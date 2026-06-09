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

      <main className="max-w-2xl mx-auto px-6 py-14">

        {upgraded === "true" && (
          <div className="mb-8 p-4 rounded-xl border border-emerald-500/25 bg-emerald-500/5 text-emerald-400 text-sm font-medium">
            Welcome to Pro. Alignment review is now active on every check you run.
          </div>
        )}

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-white mb-1">
            {user?.firstName ? `Hi, ${user.firstName}.` : "Your account"}
          </h1>
          <p className="text-[#6b7a9f] text-sm">
            {isPro ? "Pro plan · Alignment review active" : "Free plan · Risk scan on every diff"}
          </p>
        </div>

        <div className="grid gap-4">

          {/* Plan */}
          <div className={`p-6 rounded-2xl border ${isPro ? "border-emerald-500/25 bg-emerald-500/[0.03]" : "border-brand-600/25 bg-brand-600/[0.03]"}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-semibold text-white">{isPro ? "Pro plan" : "Free plan"}</h2>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    isPro
                      ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                      : "bg-brand-600/15 border-brand-600/30 text-brand-400"
                  }`}>
                    {isPro ? "PRO" : "FREE"}
                  </span>
                </div>
                <p className="text-sm text-[#9aa5c4] mb-4">
                  {isPro
                    ? "Claude reads every diff and answers: did the agent actually build the right thing?"
                    : "Every diff gets a risk scan. Upgrade to add Claude's alignment judgment on top."}
                </p>
                {!isPro && (
                  <div className="space-y-2 mb-5">
                    {["AI feature alignment check", "Unrelated file detection", "Scope creep analysis", "Suggested fixes per check"].map((f) => (
                      <div key={f} className="flex items-center gap-2 text-sm text-[#9aa5c4]">
                        <span className="flex-shrink-0 w-3.5 h-3.5 rounded-full bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-[7px] text-violet-400">◆</span>
                        {f}
                      </div>
                    ))}
                  </div>
                )}
                {!isPro && <UpgradeButton />}
              </div>
            </div>
          </div>

          {/* Desktop app */}
          <div className="p-6 rounded-2xl border border-white/8 bg-white/[0.02]">
            <h2 className="font-semibold text-white mb-1">Desktop app</h2>
            <p className="text-sm text-[#9aa5c4] mb-5">
              AgentReady runs as a local Mac app. It reads your uncommitted changes directly
              — nothing leaves your machine until you run a Pro check.
            </p>
            <div className="space-y-3 mb-5">
              {[
                ["1", "Download and open the app"],
                ["2", "Open a local git repository"],
                ["3", isPro ? "Sign in from the sidebar to activate Pro" : "Sign in from the sidebar to connect your account"],
              ].map(([n, step]) => (
                <div key={n} className="flex items-start gap-3 text-sm text-[#9aa5c4]">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full border border-white/12 bg-white/4 flex items-center justify-center text-[10px] font-bold text-[#6b7a9f]">{n}</span>
                  {step}
                </div>
              ))}
            </div>
            <button
              type="button"
              className="px-5 py-2.5 rounded-lg border border-white/15 text-white text-sm font-semibold opacity-50 cursor-not-allowed"
              disabled
            >
              Download for Mac — coming soon
            </button>
          </div>

          {/* Sign-in instructions */}
          <div className="p-6 rounded-2xl border border-white/8 bg-white/[0.02]">
            <h2 className="font-semibold text-white mb-1">Connecting the desktop app</h2>
            <p className="text-sm text-[#9aa5c4] leading-relaxed">
              Once the app is installed, click the sign-in icon in the sidebar. It opens this
              site in your browser — sign in here and the app picks up your session automatically.
              {isPro && " Your Pro plan will be recognised immediately."}
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}
