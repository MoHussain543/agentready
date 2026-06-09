import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const clerkUserId = session.metadata?.clerkUserId;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      if (!clerkUserId) {
        console.error("No clerkUserId in session metadata");
        return NextResponse.json({ error: "Missing clerkUserId" }, { status: 400 });
      }
      const { error } = await supabaseAdmin.from("subscriptions").upsert({
        clerk_user_id: clerkUserId,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        status: "pro",
        updated_at: new Date().toISOString(),
      }, { onConflict: "clerk_user_id" });
      if (error) {
        console.error("Supabase upsert error:", JSON.stringify(error));
        return NextResponse.json({ error: "DB write failed" }, { status: 500 });
      }
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const activeStatuses = ["active", "trialing"];
      const newStatus = activeStatuses.includes(sub.status) ? "pro" : "free";
      const { error } = await supabaseAdmin
        .from("subscriptions")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("stripe_subscription_id", sub.id);
      if (error) {
        console.error("Supabase update error:", JSON.stringify(error));
        return NextResponse.json({ error: "DB write failed" }, { status: 500 });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const { error } = await supabaseAdmin
        .from("subscriptions")
        .update({ status: "free", updated_at: new Date().toISOString() })
        .eq("stripe_subscription_id", sub.id);
      if (error) {
        console.error("Supabase update error:", JSON.stringify(error));
        return NextResponse.json({ error: "DB write failed" }, { status: 500 });
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subRef = invoice.parent?.subscription_details?.subscription;
      const subscriptionId = typeof subRef === "string" ? subRef : subRef?.id;
      if (subscriptionId) {
        const { error } = await supabaseAdmin
          .from("subscriptions")
          .update({ status: "free", updated_at: new Date().toISOString() })
          .eq("stripe_subscription_id", subscriptionId);
        if (error) {
          console.error("Supabase update error:", JSON.stringify(error));
          return NextResponse.json({ error: "DB write failed" }, { status: 500 });
        }
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
