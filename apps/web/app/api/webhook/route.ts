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

      if (clerkUserId) {
        const { error } = await supabaseAdmin.from("subscriptions").upsert({
          clerk_user_id: clerkUserId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          status: "pro",
          updated_at: new Date().toISOString(),
        }, { onConflict: "clerk_user_id" });
        if (error) console.error("Supabase upsert error:", JSON.stringify(error));
        else console.log("Supabase upsert success for", clerkUserId);
      } else {
        console.error("No clerkUserId in session metadata");
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await supabaseAdmin
        .from("subscriptions")
        .update({ status: "free", updated_at: new Date().toISOString() })
        .eq("stripe_subscription_id", sub.id);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
