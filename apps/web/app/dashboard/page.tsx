import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await currentUser();

  return (
    <div className="min-h-screen bg-[#09090d] text-[#edf2ff]">

      <nav className="border-b border-white/5 bg-[#09090d]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg tracking-tight text-white">AgentReady</Link>
          <div className="flex items-center gap-4 text-sm text-[#9aa5c4]">
            <span>{user?.emailAddresses[0]?.emailAddress}</span>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">
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
              className="px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold transition-colors"
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
                  Unlock AI alignment review on every check. $9/month, cancel any time.
                </p>
                <button
                  type="button"
                  className="px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold transition-colors"
                  disabled
                >
                  Upgrade to Pro — coming soon
                </button>
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
