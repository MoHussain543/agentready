import { currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { UpgradeButton } from "@/components/UpgradeButton";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string }>;
}) {
  const user = await currentUser();
  const { upgraded } = await searchParams;

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
            🎉 Welcome to Pro! Alignment review is now active on every check.
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

          <div className="p-6 rounded-2xl border border-brand-600/25 bg-brand-600/3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold text-white mb-1">Pro plan</h2>
                <p className="text-sm text-[#9aa5c4] mb-4">
                  Unlock AI alignment review on every check. Cancel any time.
                </p>
                <UpgradeButton />
              </div>
              <span className="flex-shrink-0 px-3 py-1 rounded-full bg-brand-600/15 border border-brand-600/30 text-brand-400 text-xs font-bold">
                FREE
              </span>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
