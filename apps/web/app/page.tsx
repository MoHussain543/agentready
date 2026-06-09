import Image from "next/image";
import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function Home() {
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
            <Link href="/pricing" className="text-sm text-[#9aa5c4] hover:text-white transition-colors">Pricing</Link>
            <SignedOut>
              <Link href="/sign-in" className="text-sm text-[#9aa5c4] hover:text-white transition-colors">Sign in</Link>
              <Link href="/sign-up" className="text-sm font-semibold px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white transition-colors">
                Get started free
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" className="text-sm text-[#9aa5c4] hover:text-white transition-colors">Dashboard</Link>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-20 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-violet-600/10 rounded-full blur-3xl" />
          <div className="absolute top-24 left-1/4 w-[400px] h-[300px] bg-indigo-500/6 rounded-full blur-3xl" />
          <div className="absolute top-24 right-1/4 w-[400px] h-[300px] bg-blue-500/6 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto">
          <div className="flex justify-center mb-6">
            <Image src="/agentready-glyph.png" alt="AgentReady" width={160} height={160} className="opacity-90"
              style={{ filter: "drop-shadow(0 0 18px rgba(139,92,246,0.35)) drop-shadow(0 8px 24px rgba(96,165,250,0.18))" }} />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-600/30 bg-brand-600/10 text-brand-400 text-xs font-semibold tracking-wide uppercase mb-8">
            A verification layer for AI-generated code
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight tracking-tight text-white mb-5">
            Stop shipping broken AI code<br />
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              before it reaches your repo.
            </span>
          </h1>
          <p className="text-lg text-[#9aa5c4] leading-relaxed mb-10 max-w-2xl mx-auto">
            AgentReady sits between your AI agent and your git history. Every check scans the diff for obvious risk, verifies the agent built what you actually asked for, and generates the commit message — all before you type <code className="text-[#c8d3f0] bg-white/5 px-1.5 py-0.5 rounded text-sm">git commit</code>.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up" className="px-8 py-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-base transition-all hover:scale-[1.02] shadow-lg shadow-brand-600/25">
              Download free — Mac
            </Link>
            <Link href="#features" className="px-8 py-4 rounded-xl border border-white/10 hover:border-white/20 text-[#c8d3f0] font-semibold text-base transition-colors">
              See what it checks
            </Link>
          </div>
          <p className="mt-5 text-sm text-[#6b7a9f]">Free forever. No credit card required.</p>
        </div>
      </section>

      {/* Feature strip */}
      <section className="pb-16 px-6">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-3">
          {[
            "Diff risk scan",
            "AI alignment review",
            "Repair prompt",
            "Test runner",
            "AgentForge",
            "AgentNarrator",
            "MCP server",
            "Report history",
          ].map((f) => (
            <span key={f} className="px-3 py-1.5 rounded-full border border-white/8 bg-white/[0.03] text-sm text-[#9aa5c4]">
              {f}
            </span>
          ))}
        </div>
      </section>

      {/* Free checks */}
      <section id="features" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-wide uppercase mb-4">
              Free — runs locally on every diff
            </span>
            <h2 className="text-3xl font-bold text-white mb-3">Catch risky diffs before you commit</h2>
            <p className="text-[#9aa5c4] max-w-xl mx-auto">
              Every check scans your uncommitted changes against a set of rules that catch the mistakes AI agents make most often. Nothing is uploaded — it all runs on your machine.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: "🧪",
                title: "Deleted test coverage",
                desc: "Detects when the agent removed or gutted tests in the process of making changes — a common sign something went wrong.",
              },
              {
                icon: "🔑",
                title: "Hardcoded secrets",
                desc: "Scans the diff for API keys, tokens, and credentials left directly in the code before they reach your history.",
              },
              {
                icon: "📦",
                title: "Dependency changes",
                desc: "Flags new packages added, versions bumped, or config files modified — changes that warrant a second look.",
              },
              {
                icon: "🚧",
                title: "Placeholder code",
                desc: "Catches TODO stubs, unimplemented methods, and incomplete logic that should never reach production paths.",
              },
              {
                icon: "📐",
                title: "Oversized diffs",
                desc: "Surfaces unusually broad changes that are hard to review, hard to roll back, and often a sign the agent went off-script.",
              },
              {
                icon: "🖨️",
                title: "Console log leakage",
                desc: "Identifies debug output left in the code that will clutter your logs or expose internal state in production.",
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="p-5 rounded-2xl border border-white/7 bg-white/[0.02]">
                <div className="text-2xl mb-3">{icon}</div>
                <p className="text-sm font-semibold text-white mb-1">{title}</p>
                <p className="text-xs text-[#9aa5c4] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Test runner + Repair prompt */}
      <section className="py-24 px-6 border-t border-white/5" style={{ background: "rgba(255,255,255,0.005)" }}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-widest uppercase mb-4">
              Free
            </span>
            <h2 className="text-2xl font-bold text-white mb-3">Test runner integration</h2>
            <p className="text-[#9aa5c4] leading-relaxed mb-4">
              Point AgentReady at your test command and it runs your suite as part of every check. Pass, fail, or error — the result is included in the verdict so you never miss a regression the agent introduced.
            </p>
            <p className="text-[#9aa5c4] leading-relaxed text-sm">
              Works with any test runner: <code className="text-[#c8d3f0] bg-white/5 px-1.5 py-0.5 rounded">npm test</code>, <code className="text-[#c8d3f0] bg-white/5 px-1.5 py-0.5 rounded">pytest</code>, <code className="text-[#c8d3f0] bg-white/5 px-1.5 py-0.5 rounded">cargo test</code>, or anything else. Configure once, runs every time.
            </p>
          </div>
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-widest uppercase mb-4">
              Free
            </span>
            <h2 className="text-2xl font-bold text-white mb-3">Repair prompt</h2>
            <p className="text-[#9aa5c4] leading-relaxed mb-4">
              Every check generates a repair prompt — a ready-to-paste instruction you can drop straight into Cursor or Claude Code to guide the fix. No copy-pasting error messages or rewriting context from scratch.
            </p>
            <p className="text-[#9aa5c4] leading-relaxed text-sm">
              The repair prompt is built from the check results and your original feature description, so it tells the agent exactly what it missed and what to correct.
            </p>
          </div>
        </div>
      </section>

      {/* Pro — Alignment Review */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-brand-600/15 border border-brand-600/30 text-brand-400 text-[10px] font-bold tracking-widest uppercase mb-4">
                Pro
              </span>
              <h2 className="text-3xl font-bold text-white mb-4">
                AI Alignment Review
              </h2>
              <p className="text-[#9aa5c4] leading-relaxed mb-6">
                The diff scan tells you what's risky. Alignment Review tells you whether the agent built the right thing. Claude reads your diff against what you asked for and returns a verdict with specifics.
              </p>
              <ul className="space-y-3">
                {[
                  ["Did the agent build what you asked?", "Aligned or not-aligned verdict with confidence level."],
                  ["Unrelated file detection", "Files changed that have nothing to do with the feature."],
                  ["Scope creep analysis", "Changes that go further than what was requested."],
                  ["Misleading UI copy", "Text in the UI that doesn't reflect the feature being built."],
                  ["Suggested fixes", "Specific, actionable guidance on what to correct before committing."],
                ].map(([title, desc]) => (
                  <li key={title as string} className="flex gap-3">
                    <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-[8px] text-violet-400">◆</span>
                    <div>
                      <span className="text-sm font-medium text-white">{title}</span>
                      <p className="text-xs text-[#9aa5c4] mt-0.5">{desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-violet-500/20 overflow-hidden bg-[#0d0d14] p-1">
              <div className="rounded-xl overflow-hidden">
                <Image src="/screenshots/pro-check.png" alt="Pro check screen showing AI Alignment Review feature" width={700} height={500} className="w-full h-auto" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AgentNarrator */}
      <section className="py-24 px-6 border-t border-white/5" style={{ background: "rgba(255,255,255,0.005)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 rounded-2xl border border-blue-500/15 overflow-hidden bg-[#0d0d14] p-1">
              <div className="rounded-xl overflow-hidden">
                <Image src="/screenshots/pro-workspace.png" alt="Pro workspace showing AgentNarrator and AgentForge" width={700} height={500} className="w-full h-auto" />
              </div>
            </div>
            <div className="order-1 md:order-2">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-brand-600/15 border border-brand-600/30 text-brand-400 text-[10px] font-bold tracking-widest uppercase mb-4">
                Pro
              </span>
              <h2 className="text-3xl font-bold text-white mb-4">AgentNarrator</h2>
              <p className="text-[#9aa5c4] leading-relaxed mb-4">
                After every Pro check, AgentNarrator generates a commit message and a full PR description — built from your feature spec and the check results. No context-switching, no rewriting what the agent built in your own words.
              </p>
              <p className="text-[#9aa5c4] leading-relaxed mb-6">
                One click copies it straight to your clipboard. You can also commit directly from the app — AgentReady stages your files and runs the commit with the generated message.
              </p>
              <div className="p-4 rounded-xl border border-white/8 bg-white/[0.02] font-mono text-xs text-[#9aa5c4] leading-relaxed">
                <p className="text-emerald-400 mb-1">feat(auth): add 404 response for missing users</p>
                <p className="text-[#6b7a9f]">Returns JSON error with status 404 when a user ID</p>
                <p className="text-[#6b7a9f]">is not found in the database. Adds test coverage</p>
                <p className="text-[#6b7a9f]">for the new error path.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AgentForge */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-brand-600/15 border border-brand-600/30 text-brand-400 text-[10px] font-bold tracking-widest uppercase mb-4">
                Pro
              </span>
              <h2 className="text-3xl font-bold text-white mb-4">AgentForge</h2>
              <p className="text-[#9aa5c4] leading-relaxed mb-4">
                Most agents start without any project context — they don't know your stack, your conventions, or your constraints. AgentForge fixes that by detecting your tech stack and generating the context files agents actually read.
              </p>
              <p className="text-[#9aa5c4] leading-relaxed mb-6">
                It writes <code className="text-[#c8d3f0] bg-white/5 px-1.5 py-0.5 rounded text-xs">.cursorrules</code> and <code className="text-[#c8d3f0] bg-white/5 px-1.5 py-0.5 rounded text-xs">AGENTS.md</code> to your repository, tailored to your detected stack. Cursor picks up <code className="text-[#c8d3f0] bg-white/5 px-1.5 py-0.5 rounded text-xs">.cursorrules</code> automatically. Claude Code reads <code className="text-[#c8d3f0] bg-white/5 px-1.5 py-0.5 rounded text-xs">AGENTS.md</code>. Both agents work better from prompt one.
              </p>
              <ul className="space-y-2">
                {[
                  "Detects your framework, language, and toolchain",
                  "Writes .cursorrules for Cursor",
                  "Writes AGENTS.md for Claude Code and others",
                  "Regenerate any time the stack changes",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-[#c8d3f0]">
                    <span className="flex-shrink-0 w-4 h-4 rounded-full bg-emerald-500/12 border border-emerald-500/25 flex items-center justify-center">
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4l2 2 4-4" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-6 rounded-2xl border border-emerald-500/15 bg-[#0a0f0d]">
              <p className="text-xs font-bold tracking-widest text-emerald-400/60 uppercase mb-4">Generated context files</p>
              <div className="space-y-3">
                <div className="p-3 rounded-lg border border-white/6 bg-white/[0.02]">
                  <p className="text-xs font-mono text-[#c8d3f0] mb-1">.cursorrules</p>
                  <p className="text-xs text-[#6b7a9f] leading-relaxed">You are working in a Next.js 15 + TypeScript project using Tailwind CSS. Follow existing component patterns in /components. Never use any, always define types...</p>
                </div>
                <div className="p-3 rounded-lg border border-white/6 bg-white/[0.02]">
                  <p className="text-xs font-mono text-[#c8d3f0] mb-1">AGENTS.md</p>
                  <p className="text-xs text-[#6b7a9f] leading-relaxed">Stack: Next.js 15, TypeScript, Tailwind CSS, Clerk auth, Supabase. Test command: npm test. Do not modify /app/api/webhooks without explicit instruction...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MCP */}
      <section className="py-24 px-6 border-t border-white/5" style={{ background: "rgba(255,255,255,0.005)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold tracking-wide uppercase mb-4">
              MCP server
            </span>
            <h2 className="text-3xl font-bold text-white mb-3">Run checks without leaving your editor</h2>
            <p className="text-[#9aa5c4] max-w-xl mx-auto">
              AgentReady ships an MCP server you can plug into Cursor, Claude Code, or any MCP-compatible assistant. Trigger a readiness check mid-session — without opening the desktop app.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                title: "run_readiness_check",
                desc: "Run a full check on any local repo from inside your AI assistant. Returns a verdict, findings, and repair prompt — inline in the conversation.",
              },
              {
                title: "get_latest_report",
                desc: "Retrieve the last saved check for a repo without running a new one. Useful for referencing previous results mid-session.",
              },
              {
                title: "Pro checks via MCP",
                desc: "Authenticated Pro users get AI alignment review in MCP responses too — the same verdict and suggested fixes, right in your editor.",
              },
            ].map(({ title, desc }) => (
              <div key={title} className="p-5 rounded-2xl border border-indigo-500/15 bg-indigo-500/[0.03]">
                <p className="text-sm font-mono font-semibold text-indigo-300 mb-2">{title}</p>
                <p className="text-sm text-[#9aa5c4] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="p-5 rounded-2xl border border-white/8 bg-[#0a0a10] font-mono text-sm overflow-x-auto">
            <p className="text-[#6b7a9f] mb-1"># Add to your Cursor or Claude Code MCP config</p>
            <p className="text-[#c8d3f0]"><span className="text-indigo-400">"agentready"</span>: {"{"}</p>
            <p className="text-[#c8d3f0] pl-6"><span className="text-indigo-400">"command"</span>: <span className="text-emerald-400">"npx"</span>,</p>
            <p className="text-[#c8d3f0] pl-6"><span className="text-indigo-400">"args"</span>: [<span className="text-emerald-400">"agentready-mcp"</span>]</p>
            <p className="text-[#c8d3f0]">{"}"}</p>
          </div>
        </div>
      </section>

      {/* Report history */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-wide uppercase mb-4">Free</span>
          <h2 className="text-3xl font-bold text-white mb-4">Every check is saved locally</h2>
          <p className="text-[#9aa5c4] leading-relaxed max-w-xl mx-auto mb-8">
            AgentReady stores every check result in your repo under <code className="text-[#c8d3f0] bg-white/5 px-1.5 py-0.5 rounded text-sm">.agentready/</code>. Browse the full history per project, reopen any past report, or delete what you don't need. Nothing is stored on a server — it's all yours, offline, forever.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-[#9aa5c4]">
            {["Per-project history", "Verdict + findings", "Repair prompt archived", "Delete anytime", "Works offline"].map((f) => (
              <span key={f} className="flex items-center gap-2">
                <svg width="12" height="12" viewBox="0 0 8 8" fill="none"><path d="M1 4l2 2 4-4" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                {f}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 border-t border-white/5" style={{ background: "rgba(255,255,255,0.005)" }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-3">Simple pricing</h2>
            <p className="text-[#9aa5c4]">Start free. Upgrade when the alignment check matters to you.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="p-8 rounded-2xl border border-white/8 bg-white/[0.02] flex flex-col">
              <div className="mb-5">
                <h3 className="text-xl font-bold text-white mb-1">Free</h3>
                <p className="text-[#9aa5c4] text-sm">Catch obvious risks on every diff</p>
              </div>
              <div className="text-4xl font-black text-white mb-7">$0</div>
              <ul className="space-y-3 mb-8 flex-1">
                {["Unlimited checks", "Full diff risk scan", "Test runner integration", "Repair prompt", "Saved report history", "MCP server"].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-[#c8d3f0]">
                    <span className="flex-shrink-0 w-4 h-4 rounded-full bg-emerald-500/12 border border-emerald-500/25 flex items-center justify-center">
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4l2 2 4-4" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/sign-up" className="block text-center py-3 rounded-xl border border-white/15 hover:border-white/25 text-white font-semibold transition-colors text-sm">
                Get started free
              </Link>
            </div>
            <div className="rounded-2xl border border-violet-500/30 flex flex-col overflow-hidden relative" style={{ background: "rgba(124,58,237,0.04)" }}>
              <div className="h-[3px] mx-0 gradient-trim-violet" />
              <div className="p-8 flex flex-col flex-1">
                <div className="absolute top-6 right-6 px-2.5 py-1 rounded-full bg-brand-600/20 border border-brand-600/30 text-brand-400 text-[10px] font-bold tracking-wide uppercase">Popular</div>
                <div className="mb-5">
                  <h3 className="text-xl font-bold text-white mb-1">Pro</h3>
                  <p className="text-[#9aa5c4] text-sm">Verify the agent built the right thing</p>
                </div>
                <div className="text-4xl font-black text-white mb-7">$9<span className="text-lg font-medium text-[#9aa5c4]">/mo</span></div>
                <ul className="space-y-3 mb-8 flex-1">
                  {["Everything in Free", "AI alignment review", "Unrelated file detection", "Scope creep analysis", "AgentNarrator (commit + PR)", "AgentForge (context files)"].map((f) => (
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
          <p className="text-center mt-6 text-sm text-[#6b7a9f]">
            Full feature breakdown on the <Link href="/pricing" className="text-brand-400 hover:text-brand-500 underline underline-offset-2">pricing page</Link>.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ship AI code you actually trust</h2>
          <p className="text-[#9aa5c4] mb-8 text-sm leading-relaxed">
            Download AgentReady, open any repo, and run your first check in under a minute. Free forever — no account required to get started.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up" className="px-8 py-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-base transition-all hover:scale-[1.02] shadow-lg shadow-brand-600/25">
              Download free — Mac
            </Link>
            <Link href="/pricing" className="px-8 py-4 rounded-xl border border-white/10 hover:border-white/20 text-[#c8d3f0] font-semibold text-base transition-colors">
              View pricing
            </Link>
          </div>
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
