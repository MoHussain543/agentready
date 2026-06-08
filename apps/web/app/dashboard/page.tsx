import { currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import { UpgradeButton } from "@/components/UpgradeButton";

async function getSubscription(clerkUserId: string) {
  const { data } = await supabaseAdmin
    .from("subscriptions")
    .select("status")
    .eq("clerk_user_id", clerkUserId)
    .single();
  return data?.status ?? "free";
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string }>;
}) {
  const user = await currentUser();
  const { upgraded } = await searchParams;

  const status = user ? await getSubscription(user.id) : "free";
  const isPro = status === "pro";

  return (
    <div className="min-h-screen bg-[#09090d] text-[#edf2ff]">

      <nav className="border-b border-white/5 bg-[#09090d]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg tracking-tight text-white">AgentReady</Link>
          <UserButton />
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">

        {upgraded === "true" && (
          <div className="mb-8 p-4 rounded-xl border border-emerald-500/25 bg-emerald-500/5 text-emerald-400 text-sm font-medium">
            Welcome to Pro! Alignment review is now active on every check.
          </div>
        )}

        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome{user?.firstName ? `, ${user.firstName}` : ""}.
        </h1>
        <p className="text-[#9aa5c4] mb-12">
          Your AgentReady account is active. Download the desktop app to start running checks.
        </p>

        <div className="grid gap-4">

          <div className="p-6 rounded-2xl border border-white/8 bg-white/2">
            <h2 className="font-semibold text-white mb-1">Desktop app</h2>
            <p className="text-sm text-[#9aa5c4] mb-4">
              Run pre-commit checks directly from your machine. Works with any local git repository.
            </p>
            <button
              type="button"
              className="px-5 py-2.5 rounded-lg border border-white/15 text-white text-sm font-semibold opacity-50 cursor-not-allowed"
              disabled
            >
              Download for Mac — coming soon
            </button>
          </div>

          <div className={`p-6 rounded-2xl border ${isPro ? "border-emerald-500/25 bg-emerald-500/3" : "border-brand-600/25 bg-brand-600/3"}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold text-white mb-1">
                  {isPro ? "Pro plan" : "Upgrade to Pro"}
                </h2>
                <p className="text-sm text-[#9aa5c4] mb-4">
                  {isPro
                    ? "AI alignment review is active on every check you run."
                    : "Unlock AI alignment review on every check. Cancel any time."}
                </p>
                {!isPro && <UpgradeButton />}
              </div>
              <span className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold border ${
                isPro
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                  : "bg-brand-600/15 border-brand-600/30 text-brand-400"
              }`}>
                {isPro ? "PRO" : "FREE"}
              </span>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
