import { currentUser } from "@clerk/nextjs/server";
import { SignJWT } from "jose";
import { redirect } from "next/navigation";

import { supabaseAdmin } from "@/lib/supabase";
import { DesktopAuthRedirect } from "./DesktopAuthRedirect";

async function mintDesktopToken(clerkUserId: string): Promise<string> {
  const { data } = await supabaseAdmin
    .from("subscriptions")
    .select("status")
    .eq("clerk_user_id", clerkUserId)
    .single();

  const isPro = data?.status === "pro";

  const secret = new TextEncoder().encode(process.env.AGENTREADY_JWT_SECRET!);
  return new SignJWT({ sub: clerkUserId, pro: isPro })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export default async function DesktopAuthPage({
  searchParams,
}: {
  searchParams: Promise<{ callback?: string }>;
}) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in?redirect_url=/auth/desktop");
  }

  const token = await mintDesktopToken(user.id);
  const { callback } = await searchParams;

  if (callback) {
    // Validate that the callback is a localhost URL (security check)
    let callbackUrl: URL;
    try {
      callbackUrl = new URL(callback);
    } catch {
      return <div>Invalid callback URL.</div>;
    }

    const host = callbackUrl.hostname;
    if (host !== "127.0.0.1" && host !== "localhost") {
      return <div>Callback must be localhost.</div>;
    }

    callbackUrl.searchParams.set("token", token);
    redirect(callbackUrl.toString());
  }

  // No callback — fall back to deep link (works in bundled production app)
  return <DesktopAuthRedirect token={token} />;
}
