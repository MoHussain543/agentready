import Image from "next/image";
import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

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
      <section className="pt-40 pb-20 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[480px] bg-violet-600/10 rounded-full blur-3xl" />
          <div className="absolute top-24 left-1/4 w-[400px] h-[300px] bg-indigo-500/6 rounded-full blur-3xl" />
          <div className="absolute top-24 right-1/4 w-[400px] h-[300px] bg-blue-500/6 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-3xl mx-auto">
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
            A verification layer for AI-generated code
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight tracking-tight text-white mb-5">
            Catch risky AI code<br />
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              before you commit.
            </span>
          </h1>

          <p className="text-lg text-[#9aa5c4] leading-relaxed mb-10 max-w-xl mx-auto">
            Free checks scan your diff for obvious red flags.
            Pro verifies the diff actually matches what you asked the agent to build.
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

      {/* ── Free vs Pro split ────────────────────────────────────────────────── */}
      <section className="pb-20 px-6">
        <div className="max-w-2xl mx-auto grid sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl border border-emerald-500/18 bg-emerald-500/[0.03]">
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-widest uppercase mb-3">
              Free
            </span>
            <p className="text-white font-semibold text-base mb-1">Obvious risk scan</p>
            <p className="text-sm text-[#9aa5c4] leading-relaxed">
              Runs locally on every diff. Catches deleted tests, hardcoded secrets,
              dependency changes, and placeholder code before they reach your repo.
            </p>
          </div>
          <div className="p-5 rounded-2xl border border-violet-500/25 relative overflow-hidden" style={{ background: "rgba(124,58,237,0.04)" }}>
            <div className="absolute top-0 left-4 right-4 h-[2px] rounded-b-full gradient-trim-violet" />
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-brand-600/15 border border-brand-600/30 text-brand-400 text-[10px] font-bold tracking-widest uppercase mb-3">
              Pro — $9/mo
            </span>
            <p className="text-white font-semibold text-base mb-1">Alignment review</p>
            <p className="text-sm text-[#9aa5c4] leading-relaxed">
              Claude reads the diff and answers: did the agent actually build the right thing,
              or did it drift, add unrelated files, or go beyond what you asked?
            </p>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-3">How it works</h2>
            <p className="text-[#9aa5c4]">Three steps between your AI agent and a clean commit.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">

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

            <div className="p-6 rounded-2xl border border-indigo-500/18 bg-white/[0.02] hover:border-indigo-500/35 transition-colors group">
              <div className="w-10 h-10 rounded-xl mb-5 flex items-center justify-center border border-indigo-500/25 bg-gradient-to-br from-indigo-500/20 to-violet-500/10 text-indigo-400 group-hover:border-indigo-500/40 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </div>
              <p className="text-xs font-bold tracking-widest text-indigo-400/70 uppercase mb-2">Step 02</p>
              <h3 className="text-base font-semibold text-white mb-2">Describe the change</h3>
              <p className="text-sm text-[#9aa5c4] leading-relaxed">Say what you asked the agent to build. One sentence is enough — it becomes the benchmark for the readiness check.</p>
            </div>

            <div className="p-6 rounded-2xl border border-blue-500/18 bg-white/[0.02] hover:border-blue-500/35 transition-colors group">
              <div className="w-10 h-10 rounded-xl mb-5 flex items-center justify-center border border-blue-500/25 bg-gradient-to-br from-blue-500/20 to-indigo-500/10 text-blue-400 group-hover:border-blue-500/40 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </div>
              <p className="text-xs font-bold tracking-widest text-blue-400/70 uppercase mb-2">Step 03</p>
              <h3 className="text-base font-semibold text-white mb-2">Get a readiness verdict</h3>
              <p className="text-sm text-[#9aa5c4] leading-relaxed">AgentReady returns a verdict with a repair prompt. Pro adds Claude's judgment on whether the agent actually did the job.</p>
            </div>

          </div>
        </div>
      </section>

      {/* ── What gets checked ────────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-y border-white/5" style={{ background: "rgba(255,255,255,0.005)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-3">What gets checked</h2>
            <p className="text-[#9aa5c4]">Free checks run locally on every diff. Pro checks use Claude.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">

            {/* Free */}
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] overflow-hidden">
              <div className="px-8 pt-8 pb-8">
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-wide uppercase mb-6">
                  Free catches
                </span>
                <ul className="space-y-5">
                  {[
                    ["Deleted tests", "Did the agent remove test coverage in the process?"],
                    ["Hardcoded secrets", "Credentials or tokens left in the diff."],
                    ["Dependency changes", "New packages or config modifications that deserve a second look."],
                    ["Placeholder code", "TODO stubs and unfinished logic left in production paths."],
                    ["Oversized diffs", "Unusually broad changes that are hard to review or roll back."],
                  ].map(([title, desc]) => (
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
              <div className="h-[3px] mx-6 mt-0 rounded-b-full gradient-trim-violet" />
              <div className="px-8 pt-6 pb-8">
                <span className="inline-block px-3 py-1 rounded-full bg-brand-600/15 border border-brand-600/30 text-brand-400 text-xs font-bold tracking-wide uppercase mb-6">
                  Pro answers
                </span>
                <ul className="space-y-5">
                  {[
                    ["Did the agent build the right thing?", "Claude reads the diff against your spec and returns a verdict."],
                    ["Did it touch files outside the scope?", "Surfaces changed files that have nothing to do with what you asked."],
                    ["Did it drift beyond the request?", "Identifies changes that go further than the feature required."],
                    ["Does the UI copy match?", "Catches text in the UI that doesn't reflect the requested feature."],
                    ["What needs to be fixed?", "Specific, actionable guidance on what to correct before committing."],
                  ].map(([title, desc]) => (
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
            <p className="text-[#9aa5c4]">Start free. Upgrade when the alignment check matters to you.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">

            {/* Free tier */}
            <div className="p-8 rounded-2xl border border-white/8 bg-white/[0.02] flex flex-col">
              <div className="mb-5">
                <h3 className="text-xl font-bold text-white mb-1">Free</h3>
                <p className="text-[#9aa5c4] text-sm">Catch obvious risks in the diff</p>
              </div>
              <div className="text-4xl font-black text-white mb-7">$0</div>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  "Unlimited checks",
                  "Risk scan on every diff",
                  "Test runner integration",
                  "Repair prompt on every check",
                  "Saved report history",
                ].map((f) => (
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
              <div className="h-[3px] mx-0 gradient-trim-violet" />
              <div className="p-8 flex flex-col flex-1">
                <div className="absolute top-6 right-6 px-2.5 py-1 rounded-full bg-brand-600/20 border border-brand-600/30 text-brand-400 text-[10px] font-bold tracking-wide uppercase">
                  Popular
                </div>
                <div className="mb-5">
                  <h3 className="text-xl font-bold text-white mb-1">Pro</h3>
                  <p className="text-[#9aa5c4] text-sm">Verify the agent built the right thing</p>
                </div>
                <div className="text-4xl font-black text-white mb-7">
                  $9<span className="text-lg font-medium text-[#9aa5c4]">/mo</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    "Everything in Free",
                    "AI feature alignment check",
                    "Unrelated file detection",
                    "Scope creep analysis",
                    "Misleading copy detection",
                    "Suggested fixes per check",
                  ].map((f) => (
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
