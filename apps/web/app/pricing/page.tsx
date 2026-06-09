import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Pricing — AgentReady",
  description: "Free forever for risk scanning. Upgrade to Pro for AI alignment review — verify the agent actually built what you asked.",
};

const FREE_FEATURES = [
  {
    title: "Unlimited readiness checks",
    desc: "Run as many checks as you want against any local git repo. No limits, no usage caps.",
  },
  {
    title: "Diff risk scan",
    desc: "Every check scans your uncommitted diff for deleted tests, hardcoded secrets, dependency changes, placeholder code, and oversized diffs.",
  },
  {
    title: "Test runner integration",
    desc: "Configure a test command and AgentReady runs it as part of the check — pass or fail is included in the verdict.",
  },
  {
    title: "Repair prompt",
    desc: "Every check generates a repair prompt you can paste directly into Cursor or Claude to guide the fix.",
  },
  {
    title: "Saved report history",
    desc: "All check results are saved locally. Browse past verdicts per project at any time.",
  },
  {
    title: "AgentForge detection",
    desc: "AgentReady detects your project's tech stack and surfaces which AI context files are present.",
  },
];

const PRO_FEATURES = [
  {
    title: "Everything in Free",
    desc: "All free checks run as part of every Pro check — you get the full risk scan plus the AI layer on top.",
  },
  {
    title: "AI alignment review",
    desc: "Claude reads your diff against your feature description and answers: did the agent actually build what you asked, or did it drift?",
  },
  {
    title: "Unrelated file detection",
    desc: "Surfaces files in the diff that have nothing to do with the feature you requested — a common sign of agent hallucination.",
  },
  {
    title: "Scope creep analysis",
    desc: "Identifies changes that go beyond what was asked. Useful for keeping agents on task across multi-step sessions.",
  },
  {
    title: "Misleading UI copy detection",
    desc: "Catches text in the UI that doesn't match the feature you asked for — the kind of thing that slips past diff review.",
  },
  {
    title: "Suggested fixes",
    desc: "Each Pro check returns specific, actionable guidance on what to correct before committing.",
  },
  {
    title: "AgentNarrator",
    desc: "Generate a commit message and PR description from the check's spec and results — copy it straight into your terminal or GitHub.",
  },
  {
    title: "AgentForge generation",
    desc: "Generate AI context files for your stack — writes .cursorrules and AGENTS.md to your repo so agents have the right context from the start.",
  },
];

const FREE_CHECKS = [
  ["Deleted test coverage", "Did the agent remove tests in the process of making changes?"],
  ["Hardcoded secrets & tokens", "Credentials, API keys, or tokens left directly in the diff."],
  ["Dependency modifications", "New packages added, versions changed, or config files modified."],
  ["Placeholder & stub code", "TODO comments, unimplemented stubs, or incomplete logic in production paths."],
  ["Oversized diffs", "Unusually broad changes that are risky to review or hard to roll back."],
  ["Console log leakage", "Debug output left in the code that shouldn't reach production."],
];

const PRO_CHECKS = [
  ["Did the agent build the right thing?", "Claude reads the full diff against your spec and returns an aligned or not-aligned verdict."],
  ["Did it touch files outside the scope?", "Changed files that appear unrelated to what you asked — flagged with explanation."],
  ["Did it go beyond what was requested?", "Changes that exceed the scope of the feature, including refactors you didn't ask for."],
  ["Does the UI copy match the feature?", "Text in the UI that contradicts or misrepresents the feature being built."],
  ["What specifically needs fixing?", "A list of targeted suggestions for each alignment issue found in the diff."],
  ["Commit message & PR description", "AgentNarrator generates these from the check's spec and results."],
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#09090d] text-[#edf2ff]">

      {/* Nav */}
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

      {/* Hero */}
      <section className="pt-36 pb-16 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-violet-600/8 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-2xl mx-auto">
          <p className="text-xs font-bold tracking-widest text-brand-400/70 uppercase mb-4">Pricing</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Free to scan. Pro to verify.
          </h1>
          <p className="text-lg text-[#9aa5c4] leading-relaxed">
            The free plan catches obvious risk in every diff — forever.
            Pro adds an AI layer that checks whether the agent actually built what you asked.
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="pb-20 px-6">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-6">

          {/* Free */}
          <div className="p-8 rounded-2xl border border-white/8 bg-white/[0.02] flex flex-col">
            <div className="mb-6">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-widest uppercase mb-4">
                Free
              </span>
              <h2 className="text-2xl font-bold text-white mb-1">Free</h2>
              <p className="text-[#9aa5c4] text-sm">Catch obvious risks before every commit</p>
            </div>
            <div className="mb-8">
              <span className="text-5xl font-black text-white">$0</span>
              <span className="text-[#9aa5c4] text-sm ml-2">forever</span>
            </div>
            <ul className="space-y-4 mb-10 flex-1">
              {FREE_FEATURES.map((f) => (
                <li key={f.title} className="flex gap-3">
                  <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-emerald-500/12 border border-emerald-500/25 flex items-center justify-center">
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M1 4l2 2 4-4" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-sm font-medium text-white">{f.title}</p>
                    <p className="text-xs text-[#9aa5c4] mt-0.5 leading-relaxed">{f.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Link
              href="/sign-up"
              className="block text-center py-3 rounded-xl border border-white/15 hover:border-white/25 text-white font-semibold transition-colors text-sm"
            >
              Download free
            </Link>
          </div>

          {/* Pro */}
          <div className="rounded-2xl border border-violet-500/30 flex flex-col overflow-hidden relative" style={{ background: "rgba(124,58,237,0.04)" }}>
            <div className="h-[3px] gradient-trim-violet" />
            <div className="p-8 flex flex-col flex-1">
              <div className="absolute top-8 right-8 px-2.5 py-1 rounded-full bg-brand-600/20 border border-brand-600/30 text-brand-400 text-[10px] font-bold tracking-wide uppercase">
                Most popular
              </div>
              <div className="mb-6">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-brand-600/15 border border-brand-600/30 text-brand-400 text-[10px] font-bold tracking-widest uppercase mb-4">
                  Pro
                </span>
                <h2 className="text-2xl font-bold text-white mb-1">Pro</h2>
                <p className="text-[#9aa5c4] text-sm">Verify the agent built the right thing</p>
              </div>
              <div className="mb-8">
                <span className="text-5xl font-black text-white">$9</span>
                <span className="text-[#9aa5c4] text-sm ml-1">/month</span>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                {PRO_FEATURES.map((f) => (
                  <li key={f.title} className="flex gap-3">
                    <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-[8px] text-violet-400">
                      ◆
                    </span>
                    <div>
                      <p className="text-sm font-medium text-white">{f.title}</p>
                      <p className="text-xs text-[#9aa5c4] mt-0.5 leading-relaxed">{f.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up"
                className="block text-center py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-all hover:scale-[1.01] shadow-lg shadow-brand-600/20 text-sm"
              >
                Get started — $9/mo
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* What gets checked */}
      <section className="py-24 px-6 border-y border-white/5" style={{ background: "rgba(255,255,255,0.005)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-3">What every check looks at</h2>
            <p className="text-[#9aa5c4]">Free checks run locally on every diff. Pro adds an AI layer on top.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">

            {/* Free checks */}
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] overflow-hidden">
              <div className="px-8 pt-8 pb-8">
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-wide uppercase mb-6">
                  Free — local checks
                </span>
                <ul className="space-y-5">
                  {FREE_CHECKS.map(([title, desc]) => (
                    <li key={title} className="flex gap-3">
                      <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-emerald-500/12 border border-emerald-500/25 flex items-center justify-center">
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                          <path d="M1 4l2 2 4-4" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <div>
                        <p className="text-sm font-medium text-white">{title}</p>
                        <p className="text-xs text-[#9aa5c4] mt-0.5 leading-relaxed">{desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Pro checks */}
            <div className="rounded-2xl border border-violet-500/20 overflow-hidden" style={{ background: "rgba(124,58,237,0.03)" }}>
              <div className="h-[3px] mx-6 mt-0 rounded-b-full gradient-trim-violet" />
              <div className="px-8 pt-6 pb-8">
                <span className="inline-block px-3 py-1 rounded-full bg-brand-600/15 border border-brand-600/30 text-brand-400 text-xs font-bold tracking-wide uppercase mb-6">
                  Pro — AI checks
                </span>
                <ul className="space-y-5">
                  {PRO_CHECKS.map(([title, desc]) => (
                    <li key={title} className="flex gap-3">
                      <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-[8px] text-violet-400">
                        ◆
                      </span>
                      <div>
                        <p className="text-sm font-medium text-white">{title}</p>
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

      {/* FAQ */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">Common questions</h2>
          </div>
          <dl className="space-y-8">
            {[
              {
                q: "Does AgentReady upload my code?",
                a: "Free checks run entirely locally — your diff never leaves your machine. Pro checks send only the diff summary and your feature description to Claude for the alignment review. No full file contents are uploaded.",
              },
              {
                q: "What is the alignment review actually checking?",
                a: "You tell AgentReady what you asked the agent to build. After the check, Claude reads the diff against that description and returns a verdict: aligned or not aligned, a confidence level, a summary, and a list of specific issues to fix.",
              },
              {
                q: "What is AgentNarrator?",
                a: "AgentNarrator generates a commit message and PR description from the check's spec and results. It's a Pro feature — once a check completes, you can generate both and copy them straight to your terminal or GitHub.",
              },
              {
                q: "What is AgentForge?",
                a: "AgentForge detects your project's tech stack and generates AI context files — .cursorrules and AGENTS.md — so that Cursor and other agents have the right context from the start. It's a Pro feature.",
              },
              {
                q: "Can I cancel Pro at any time?",
                a: "Yes. Cancelling stops the next billing cycle. You keep Pro access until the end of the period you paid for.",
              },
              {
                q: "Is the Free plan really free forever?",
                a: "Yes. The risk scan, repair prompt, test runner, and report history are all free with no usage limits, no expiry, and no credit card required.",
              },
            ].map(({ q, a }) => (
              <div key={q}>
                <dt className="text-base font-semibold text-white mb-2">{q}</dt>
                <dd className="text-sm text-[#9aa5c4] leading-relaxed">{a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Start catching risky diffs today</h2>
          <p className="text-[#9aa5c4] mb-8 text-sm leading-relaxed">
            Download the Mac app, open any git repo, and run your first check in under a minute.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="px-8 py-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-base transition-all hover:scale-[1.02] shadow-lg shadow-brand-600/25"
            >
              Download free — Mac
            </Link>
            <Link
              href="/"
              className="px-8 py-4 rounded-xl border border-white/10 hover:border-white/20 text-[#c8d3f0] font-semibold text-base transition-colors"
            >
              Learn more
            </Link>
          </div>
          <p className="mt-5 text-sm text-[#6b7a9f]">Free forever. No credit card required.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/agentready-glyph.png" alt="AgentReady" width={30} height={30} className="opacity-80" />
            <span className="font-bold text-sm text-white">AgentReady</span>
          </Link>
          <p className="text-sm text-[#6b7a9f]">© {new Date().getFullYear()} AgentReady. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/pricing" className="text-sm text-[#6b7a9f] hover:text-white transition-colors">Pricing</Link>
            <Link href="/sign-in" className="text-sm text-[#6b7a9f] hover:text-white transition-colors">Sign in</Link>
            <Link href="/sign-up" className="text-sm text-[#6b7a9f] hover:text-white transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
