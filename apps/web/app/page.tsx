import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#09090d] text-[#edf2ff]">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#09090d]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-bold text-lg tracking-tight text-white">AgentReady</span>
          <div className="flex items-center gap-4">
            <SignedOut>
              <Link href="/sign-in" className="text-sm text-[#9aa5c4] hover:text-white transition-colors">
                Sign in
              </Link>
              <Link href="/sign-up" className="text-sm font-semibold px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white transition-colors">
                Get started free
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" className="text-sm text-[#9aa5c4] hover:text-white transition-colors">
                Dashboard
              </Link>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-24 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-brand-600/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-600/30 bg-brand-600/10 text-brand-400 text-xs font-semibold tracking-wide uppercase mb-8">
            Built for AI-assisted development
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight tracking-tight text-white mb-6">
            Catch what your AI agent<br />
            <span className="text-brand-400">missed before you commit.</span>
          </h1>
          <p className="text-xl text-[#9aa5c4] leading-relaxed mb-10 max-w-2xl mx-auto">
            AgentReady scans your uncommitted diff for obvious risks, then uses AI to verify the agent actually built what you asked for.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up" className="px-8 py-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-base transition-all hover:scale-[1.02] shadow-lg shadow-brand-600/25">
              Download free — Mac
            </Link>
            <Link href="#how-it-works" className="px-8 py-4 rounded-xl border border-white/10 hover:border-white/20 text-[#c8d3f0] font-semibold text-base transition-colors">
              See how it works
            </Link>
          </div>
          <p className="mt-5 text-sm text-[#6b7a9f]">Free forever. No credit card required.</p>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-3">How it works</h2>
            <p className="text-[#9aa5c4]">Three steps between your AI agent and a clean commit.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Open your repo",
                body: "Point AgentReady at any local git repository. It reads your uncommitted changes — nothing is uploaded.",
              },
              {
                step: "02",
                title: "Describe what you built",
                body: "Tell AgentReady what you asked the AI to do. One sentence is enough. This becomes the benchmark for the alignment check.",
              },
              {
                step: "03",
                title: "Get a verdict",
                body: "AgentReady runs risk checks on the diff and — with Pro — asks Claude whether the agent actually built what you asked for.",
              },
            ].map((item) => (
              <div key={item.step} className="relative p-6 rounded-2xl border border-white/8 bg-white/2 hover:border-brand-600/30 transition-colors">
                <div className="text-4xl font-black text-brand-600/20 mb-4">{item.step}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-[#9aa5c4] leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-white/[0.01] border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-3">What gets checked</h2>
            <p className="text-[#9aa5c4]">Free checks run locally. Pro checks use AI.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">

            <div className="p-8 rounded-2xl border border-white/8 bg-white/2">
              <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-wide uppercase mb-6">
                Free
              </div>
              <ul className="space-y-4">
                {[
                  ["Deleted test files", "Catches cases where the agent removed your test coverage."],
                  ["Suspicious secrets", "Flags hardcoded credentials or tokens in the diff."],
                  ["Dependency changes", "Highlights new packages or config file modifications."],
                  ["Placeholder content", "Detects TODO stubs or unfinished code left in production files."],
                  ["Large diff warning", "Flags unusually large or broad changes before you commit."],
                  ["Test runner", "Run your test suite as part of every check."],
                ].map(([title, desc]) => (
                  <li key={title} className="flex gap-3">
                    <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-[10px]">✓</span>
                    <div>
                      <span className="text-sm font-medium text-white">{title}</span>
                      <p className="text-xs text-[#9aa5c4] mt-0.5">{desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-8 rounded-2xl border border-brand-600/25 bg-brand-600/3 relative">
              <div className="inline-block px-3 py-1 rounded-full bg-brand-600/15 border border-brand-600/30 text-brand-400 text-xs font-bold tracking-wide uppercase mb-6">
                Pro — $9/mo
              </div>
              <ul className="space-y-4">
                {[
                  ["Feature alignment", "Did the agent actually build what you asked for? Claude reads the diff and gives a verdict."],
                  ["Unrelated file detection", "Surfaces files changed outside the scope of your request."],
                  ["Scope creep", "Identifies changes that go beyond what was requested."],
                  ["Misleading UI copy", "Catches UI text that doesn't match the requested feature."],
                  ["Suggested fixes", "Specific, actionable guidance on what to correct before committing."],
                  ["Everything in Free", "All free checks are included with Pro."],
                ].map(([title, desc]) => (
                  <li key={title} className="flex gap-3">
                    <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-brand-600/20 border border-brand-600/40 flex items-center justify-center text-brand-400 text-[10px]">◆</span>
                    <div>
                      <span className="text-sm font-medium text-white">{title}</span>
                      <p className="text-xs text-[#9aa5c4] mt-0.5">{desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-3">Simple pricing</h2>
            <p className="text-[#9aa5c4]">Start free. Upgrade when the AI check matters.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">

            <div className="p-8 rounded-2xl border border-white/8 bg-white/2 flex flex-col">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-1">Free</h3>
                <p className="text-[#9aa5c4] text-sm">Deterministic risk scanning</p>
              </div>
              <div className="text-4xl font-black text-white mb-6">$0</div>
              <ul className="space-y-3 mb-8 flex-1">
                {["Unlimited free checks","Risk scan on every diff","Test runner integration","Repair prompt on every check","Saved report history"].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-[#c8d3f0]">
                    <span className="text-emerald-400">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/sign-up" className="block text-center py-3 rounded-xl border border-white/15 hover:border-white/25 text-white font-semibold transition-colors">
                Get started free
              </Link>
            </div>

            <div className="p-8 rounded-2xl border border-brand-600/40 bg-brand-600/5 flex flex-col relative overflow-hidden">
              <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-brand-600/20 border border-brand-600/30 text-brand-400 text-xs font-bold">
                POPULAR
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-1">Pro</h3>
                <p className="text-[#9aa5c4] text-sm">AI alignment review</p>
              </div>
              <div className="text-4xl font-black text-white mb-6">
                $9<span className="text-lg font-medium text-[#9aa5c4]">/mo</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {["Everything in Free","AI feature alignment check","Unrelated file detection","Scope creep analysis","Misleading copy detection","Suggested fixes per check"].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-[#c8d3f0]">
                    <span className="text-brand-400">◆</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/sign-up" className="block text-center py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-all hover:scale-[1.01] shadow-lg shadow-brand-600/25">
                Start free trial
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-bold text-white">AgentReady</span>
          <p className="text-sm text-[#6b7a9f]">© {new Date().getFullYear()} AgentReady. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/sign-in" className="text-sm text-[#6b7a9f] hover:text-white transition-colors">Sign in</Link>
            <Link href="/sign-up" className="text-sm text-[#6b7a9f] hover:text-white transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
