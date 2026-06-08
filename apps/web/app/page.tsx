import Image from "next/image";
import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

const freeFeatures = [
  ["Deleted test files", "Catches cases where the agent removed your test coverage."],
  ["Suspicious secrets", "Flags hardcoded credentials or tokens in the diff."],
  ["Dependency changes", "Highlights new packages or config file modifications."],
  ["Placeholder content", "Detects TODO stubs or unfinished code left in production files."],
  ["Large diff warning", "Flags unusually large or broad changes before you commit."],
  ["Test runner", "Run your test suite as part of every readiness check."],
];

const proFeatures = [
  ["Feature alignment", "Did the agent actually build what you asked for? Claude reads the diff and gives a verdict."],
  ["Unrelated file detection", "Surfaces files changed outside the scope of your request."],
  ["Scope creep analysis", "Identifies changes that go beyond what was requested."],
  ["Misleading UI copy", "Catches UI text that doesn't match the requested feature."],
  ["Suggested fixes", "Specific, actionable guidance on what to correct before committing."],
  ["Everything in Free", "All free checks included — one tool for the full picture."],
];

const freePricing = [
  "Unlimited free checks",
  "Risk scan on every diff",
  "Test runner integration",
  "Repair prompt on every check",
  "Saved report history",
];

const proPricing = [
  "Everything in Free",
  "AI feature alignment check",
  "Unrelated file detection",
  "Scope creep analysis",
  "Misleading copy detection",
  "Suggested fixes per check",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#09090d] text-[#edf2ff]">

      {/* ── Nav ──────────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#09090d]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/agentready-glyph.png" alt="AgentReady" width={44} height={44} className="opacity-90" />
            <span className="font-bold text-[17px] tracking-tight text-white">AgentReady</span>
          </Link>
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

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="pt-40 pb-28 px-6 text-center relative overflow-hidden">
        {/* glow layers */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[480px] bg-violet-600/10 rounded-full blur-3xl" />
          <div className="absolute top-24 left-1/4 w-[400px] h-[300px] bg-indigo-500/6 rounded-full blur-3xl" />
          <div className="absolute top-24 right-1/4 w-[400px] h-[300px] bg-blue-500/6 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-3xl mx-auto">
          {/* logo */}
          <div className="flex justify-center mb-6">
            <Image
              src="/agentready-glyph.png"
              alt="AgentReady"
              width={160}
              height={160}
              className="opacity-90"
              style={{ filter: "drop-shadow(0 0 18px rgba(139,92,246,0.35)) drop-shadow(0 8px 24px rgba(96,165,250,0.18))" }}
            />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-600/30 bg-brand-600/10 text-brand-400 text-xs font-semibold tracking-wide uppercase mb-8">
            Built for AI-assisted development
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight tracking-tight text-white mb-5">
            Your AI ships fast.<br />
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              You commit with confidence.
            </span>
          </h1>

          <p className="text-lg text-[#9aa5c4] leading-relaxed mb-10 max-w-xl mx-auto">
            AgentReady catches what your AI agent missed — before it lands in your codebase.
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

      {/* ── How it works ─────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-3">How it works</h2>
            <p className="text-[#9aa5c4]">Three steps between your AI agent and a clean commit.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">

            {/* Step 1 — violet */}
            <div className="p-6 rounded-2xl border border-violet-500/18 bg-white/[0.02] hover:border-violet-500/35 transition-colors group">
              <div className="w-10 h-10 rounded-xl mb-5 flex items-center justify-center border border-violet-500/25 bg-gradient-to-br from-violet-600/20 to-purple-500/10 text-violet-400 group-hover:border-violet-500/40 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                </svg>
              </div>
              <p className="text-xs font-bold tracking-widest text-violet-400/70 uppercase mb-2">Step 01</p>
              <h3 className="text-base font-semibold text-white mb-2">Open your repo</h3>
              <p className="text-sm text-[#9aa5c4] leading-relaxed">Point AgentReady at any local git repository. It reads your uncommitted changes — nothing is uploaded.</p>
            </div>

            {/* Step 2 — indigo */}
            <div className="p-6 rounded-2xl border border-indigo-500/18 bg-white/[0.02] hover:border-indigo-500/35 transition-colors group">
              <div className="w-10 h-10 rounded-xl mb-5 flex items-center justify-center border border-indigo-500/25 bg-gradient-to-br from-indigo-500/20 to-violet-500/10 text-indigo-400 group-hover:border-indigo-500/40 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </div>
              <p className="text-xs font-bold tracking-widest text-indigo-400/70 uppercase mb-2">Step 02</p>
              <h3 className="text-base font-semibold text-white mb-2">Describe what you built</h3>
              <p className="text-sm text-[#9aa5c4] leading-relaxed">Tell AgentReady what you asked the AI to do. One sentence is enough — it becomes the benchmark for the alignment check.</p>
            </div>

            {/* Step 3 — blue */}
            <div className="p-6 rounded-2xl border border-blue-500/18 bg-white/[0.02] hover:border-blue-500/35 transition-colors group">
              <div className="w-10 h-10 rounded-xl mb-5 flex items-center justify-center border border-blue-500/25 bg-gradient-to-br from-blue-500/20 to-indigo-500/10 text-blue-400 group-hover:border-blue-500/40 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </div>
              <p className="text-xs font-bold tracking-widest text-blue-400/70 uppercase mb-2">Step 03</p>
              <h3 className="text-base font-semibold text-white mb-2">Get a verdict</h3>
              <p className="text-sm text-[#9aa5c4] leading-relaxed">AgentReady runs risk checks on the diff and — with Pro — asks Claude whether the agent actually built what you asked for.</p>
            </div>

          </div>
        </div>
      </section>

      {/* ── What gets checked ────────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-y border-white/5" style={{ background: "rgba(255,255,255,0.005)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-3">What gets checked</h2>
            <p className="text-[#9aa5c4]">Free checks run locally on every diff. Pro checks use Claude AI.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">

            {/* Free */}
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] overflow-hidden">
              <div className="px-8 pt-8 pb-6">
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-wide uppercase mb-5">
                  Free
                </span>
                <ul className="space-y-4">
                  {freeFeatures.map(([title, desc]) => (
                    <li key={title} className="flex gap-3">
                      <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-emerald-500/12 border border-emerald-500/25 flex items-center justify-center">
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4l2 2 4-4" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </span>
                      <div>
                        <span className="text-sm font-medium text-white">{title}</span>
                        <p className="text-xs text-[#9aa5c4] mt-0.5 leading-relaxed">{desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Pro */}
            <div className="rounded-2xl border border-violet-500/20 overflow-hidden" style={{ background: "rgba(124,58,237,0.03)" }}>
              {/* animated gradient trim */}
              <div className="h-[3px] mx-6 mt-0 rounded-b-full gradient-trim-violet" />
              <div className="px-8 pt-6 pb-8">
                <span className="inline-block px-3 py-1 rounded-full bg-brand-600/15 border border-brand-600/30 text-brand-400 text-xs font-bold tracking-wide uppercase mb-5">
                  Pro — $9/mo
                </span>
                <ul className="space-y-4">
                  {proFeatures.map(([title, desc]) => (
                    <li key={title} className="flex gap-3">
                      <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-[8px] text-violet-400">◆</span>
                      <div>
                        <span className="text-sm font-medium text-white">{title}</span>
                        <p className="text-xs text-[#9aa5c4] mt-0.5 leading-relaxed">{desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-3">Simple pricing</h2>
            <p className="text-[#9aa5c4]">Start free. Upgrade when the AI check matters to you.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">

            {/* Free tier */}
            <div className="p-8 rounded-2xl border border-white/8 bg-white/[0.02] flex flex-col">
              <div className="mb-5">
                <h3 className="text-xl font-bold text-white mb-1">Free</h3>
                <p className="text-[#9aa5c4] text-sm">Deterministic risk scanning</p>
              </div>
              <div className="text-4xl font-black text-white mb-7">$0</div>
              <ul className="space-y-3 mb-8 flex-1">
                {freePricing.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-[#c8d3f0]">
                    <span className="flex-shrink-0 w-4 h-4 rounded-full bg-emerald-500/12 border border-emerald-500/25 flex items-center justify-center">
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4l2 2 4-4" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/sign-up" className="block text-center py-3 rounded-xl border border-white/15 hover:border-white/25 text-white font-semibold transition-colors text-sm">
                Get started free
              </Link>
            </div>

            {/* Pro tier */}
            <div className="rounded-2xl border border-violet-500/30 flex flex-col overflow-hidden relative" style={{ background: "rgba(124,58,237,0.04)" }}>
              {/* animated gradient trim */}
              <div className="h-[3px] mx-0 gradient-trim-violet" />
              <div className="p-8 flex flex-col flex-1">
                <div className="absolute top-6 right-6 px-2.5 py-1 rounded-full bg-brand-600/20 border border-brand-600/30 text-brand-400 text-[10px] font-bold tracking-wide uppercase">
                  Popular
                </div>
                <div className="mb-5">
                  <h3 className="text-xl font-bold text-white mb-1">Pro</h3>
                  <p className="text-[#9aa5c4] text-sm">AI alignment review</p>
                </div>
                <div className="text-4xl font-black text-white mb-7">
                  $9<span className="text-lg font-medium text-[#9aa5c4]">/mo</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {proPricing.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-[#c8d3f0]">
                      <span className="flex-shrink-0 w-4 h-4 rounded-full bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-[8px] text-violet-400">◆</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/sign-up" className="block text-center py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-all hover:scale-[1.01] shadow-lg shadow-brand-600/20 text-sm">
                  Get started — $9/mo
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/agentready-glyph.png" alt="AgentReady" width={30} height={30} className="opacity-80" />
            <span className="font-bold text-sm text-white">AgentReady</span>
          </Link>
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
