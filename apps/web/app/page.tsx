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
      <section className="pt-40 pb-16 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-violet-600/10 rounded-full blur-3xl" />
          <div className="absolute top-24 left-1/4 w-[400px] h-[300px] bg-indigo-500/6 rounded-full blur-3xl" />
          <div className="absolute top-24 right-1/4 w-[400px] h-[300px] bg-blue-500/6 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <Image src="/agentready-glyph.png" alt="AgentReady" width={128} height={128} className="opacity-90"
              style={{ filter: "drop-shadow(0 0 18px rgba(139,92,246,0.35)) drop-shadow(0 8px 24px rgba(96,165,250,0.18))" }} />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-600/30 bg-brand-600/10 text-brand-400 text-xs font-semibold tracking-wide uppercase mb-8">
            A verification layer for AI-generated code
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight tracking-tight mb-5">
            <span className="text-white">Catch </span>
            <span className="bg-gradient-to-r from-rose-400 via-orange-300 to-yellow-300 bg-clip-text text-transparent">risky</span>
            <span className="text-white"> AI code</span>
            <br />
            <span className="text-white">before you </span>
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">commit.</span>
          </h1>
          <p className="text-lg text-[#9aa5c4] leading-relaxed mb-10 max-w-2xl mx-auto">
            AgentReady sits between your AI agent and your git history — scanning every diff for risk, verifying the agent built what you asked for, and writing the commit message before you push.
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

      {/* App screenshots */}
      <section className="pb-24 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.05fr_1.35fr] gap-7 items-start">
          {[
            {
              src: "/screenshots/home.png",
              alt: "AgentReady home screen",
              eyebrow: "Home",
              title: "Your local readiness workflow",
              description: "Open a repo, run a baseline check, revisit report history, or jump into the Pro workspace.",
            },
            {
              src: "/screenshots/pro-workspace.png",
              alt: "AgentReady Pro workspace",
              eyebrow: "Pro Workspace",
              title: "Alignment Review, AgentForge, and AgentNarrator in one place",
              description: "The Pro workspace keeps every premium tool together instead of buried inside the free flow.",
            },
          ].map((shot, i) => (
            <div key={shot.title} className={`rounded-[30px] border border-white/8 bg-white/[0.02] overflow-hidden shadow-[0_24px_70px_rgba(0,0,0,0.32)] ${i === 1 ? "lg:translate-y-10" : ""}`}>
              <div className="p-5 border-b border-white/6">
                <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-brand-400 mb-2">{shot.eyebrow}</p>
                <h2 className="text-xl font-semibold text-white mb-2">{shot.title}</h2>
                <p className="text-[15px] leading-relaxed text-[#9aa5c4]">{shot.description}</p>
              </div>
              <div className="p-2 bg-[#07070b]">
                <div className="rounded-[20px] overflow-hidden border border-white/6">
                  <Image src={shot.src} alt={shot.alt} width={1400} height={980} className="w-full h-auto" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Free risk scan — icon grid */}
      <section id="features" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-wide uppercase mb-5">
                Free — runs on every diff
              </span>
              <h2 className="text-4xl font-extrabold text-white leading-tight mb-5">
                Six checks that run<br />
                <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">before every commit.</span>
              </h2>
              <p className="text-[#9aa5c4] leading-relaxed text-lg mb-6">
                Every check scans your uncommitted diff locally — no upload, no account. It catches the mistakes AI agents make most often and generates a repair prompt you can paste straight back into Cursor or Claude.
              </p>
              <p className="text-sm text-[#6b7a9f]">Also includes test runner integration and saved report history.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: "🧪", title: "Deleted tests", desc: "Catches removed or gutted test coverage." },
                { icon: "🔑", title: "Hardcoded secrets", desc: "API keys and tokens left in the diff." },
                { icon: "📦", title: "Dependency changes", desc: "New packages or version bumps." },
                { icon: "🚧", title: "Placeholder code", desc: "TODOs and stubs in production paths." },
                { icon: "📐", title: "Oversized diffs", desc: "Suspiciously broad changes." },
                { icon: "🖨️", title: "Console log leakage", desc: "Debug output left in the code." },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="p-4 rounded-2xl border border-white/7 bg-white/[0.02] hover:border-emerald-500/20 hover:bg-emerald-500/[0.03] transition-colors">
                  <div className="text-2xl mb-2">{icon}</div>
                  <p className="text-sm font-semibold text-white mb-1">{title}</p>
                  <p className="text-xs text-[#9aa5c4] leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Alignment Review — verdict mockup */}
      <section className="py-24 px-6 border-t border-white/5" style={{ background: "rgba(255,255,255,0.005)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full bg-brand-600/15 border border-brand-600/30 text-brand-400 text-xs font-bold tracking-wide uppercase mb-4">Pro</span>
            <h2 className="text-4xl font-extrabold text-white mb-4">
              Did the agent build{" "}
              <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">what you asked?</span>
            </h2>
            <p className="text-[#9aa5c4] max-w-2xl mx-auto text-lg">
              Alignment Review adds Claude as a second opinion. It reads your diff against what you described and returns a verdict — not just whether the code is risky, but whether it&apos;s right.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {[
              { label: "Alignment verdict", desc: "Aligned or not-aligned with a confidence level.", color: "violet" },
              { label: "Unrelated files", desc: "Changed files that have nothing to do with the feature.", color: "purple" },
              { label: "Scope creep", desc: "Changes that go further than what you asked for.", color: "indigo" },
              { label: "Suggested fixes", desc: "Actionable guidance you can hand back to the agent.", color: "blue" },
            ].map(({ label, desc, color }) => (
              <div key={label} className={`p-5 rounded-2xl border ${
                color === "violet" ? "border-violet-500/20 bg-violet-500/[0.04]" :
                color === "purple" ? "border-purple-500/20 bg-purple-500/[0.04]" :
                color === "indigo" ? "border-indigo-500/20 bg-indigo-500/[0.04]" :
                "border-blue-500/20 bg-blue-500/[0.04]"
              }`}>
                <p className={`text-sm font-semibold mb-2 ${
                  color === "violet" ? "text-violet-300" :
                  color === "purple" ? "text-purple-300" :
                  color === "indigo" ? "text-indigo-300" : "text-blue-300"
                }`}>{label}</p>
                <p className="text-xs text-[#9aa5c4] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          {/* Mock verdict output */}
          <div className="max-w-2xl mx-auto rounded-2xl border border-violet-500/25 bg-[#0c0b14] overflow-hidden">
            <div className="px-5 py-3 border-b border-white/6 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
              <span className="ml-2 text-xs text-[#6b7a9f]">Alignment Review — result</span>
            </div>
            <div className="p-6 space-y-4 font-mono text-sm">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-xs font-bold">ALIGNED</span>
                <span className="text-[#6b7a9f]">high confidence</span>
              </div>
              <p className="text-[#c8d3f0] leading-relaxed text-xs">The diff matches the requested feature. A 404 JSON response was added for missing user IDs with appropriate test coverage.</p>
              <div>
                <p className="text-xs text-[#6b7a9f] mb-2">Unrelated files (1)</p>
                <p className="text-xs text-amber-400/80">⚠ apps/web/app/layout.tsx — no changes related to the 404 feature</p>
              </div>
              <div>
                <p className="text-xs text-[#6b7a9f] mb-2">Suggested fix</p>
                <p className="text-xs text-[#9aa5c4]">Revert layout.tsx or confirm the change was intentional before committing.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AgentForge — two-column with file mockup */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-brand-600/15 border border-brand-600/30 text-brand-400 text-xs font-bold tracking-wide uppercase mb-5">Pro — AgentForge</span>
            <h2 className="text-4xl font-extrabold text-white leading-tight mb-5">
              Agents work better when they<br />
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">know your stack.</span>
            </h2>
            <p className="text-[#9aa5c4] leading-relaxed text-lg mb-6">
              AgentForge detects your tech stack and writes <code className="text-[#c8d3f0] bg-white/6 px-1.5 py-0.5 rounded text-sm">.cursorrules</code> and <code className="text-[#c8d3f0] bg-white/6 px-1.5 py-0.5 rounded text-sm">AGENTS.md</code> to your repo. Cursor picks up <code className="text-[#c8d3f0] bg-white/6 px-1.5 py-0.5 rounded text-sm">.cursorrules</code> automatically. Claude Code reads <code className="text-[#c8d3f0] bg-white/6 px-1.5 py-0.5 rounded text-sm">AGENTS.md</code>. Both agents hit the ground running from prompt one.
            </p>
            <div className="space-y-3">
              {[
                "Detects your framework, language, and toolchain",
                "Writes both files in one click from the Pro workspace",
                "Regenerate any time the stack changes",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-[#c8d3f0]">
                  <span className="flex-shrink-0 w-4 h-4 rounded-full bg-emerald-500/12 border border-emerald-500/25 flex items-center justify-center">
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4l2 2 4-4" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div className="rounded-xl border border-emerald-500/15 bg-[#080f0b] overflow-hidden">
              <div className="px-4 py-2.5 border-b border-white/6 flex items-center gap-2">
                <span className="text-xs font-mono text-emerald-400">.cursorrules</span>
                <span className="ml-auto text-[10px] text-[#4a5470]">generated by AgentForge</span>
              </div>
              <div className="p-4 font-mono text-xs text-[#7a8faa] leading-relaxed space-y-1">
                <p><span className="text-emerald-400/70">Stack:</span> Next.js 15, TypeScript, Tailwind CSS</p>
                <p><span className="text-emerald-400/70">Auth:</span> Clerk — never build custom auth</p>
                <p><span className="text-emerald-400/70">Style:</span> Tailwind only, no inline styles</p>
                <p><span className="text-emerald-400/70">Types:</span> Always define types, never use any</p>
                <p><span className="text-emerald-400/70">Tests:</span> npm test — run before finishing</p>
              </div>
            </div>
            <div className="rounded-xl border border-cyan-500/15 bg-[#080b0f] overflow-hidden">
              <div className="px-4 py-2.5 border-b border-white/6 flex items-center gap-2">
                <span className="text-xs font-mono text-cyan-400">AGENTS.md</span>
                <span className="ml-auto text-[10px] text-[#4a5470]">generated by AgentForge</span>
              </div>
              <div className="p-4 font-mono text-xs text-[#7a8faa] leading-relaxed space-y-1">
                <p><span className="text-cyan-400/70"># AgentReady — Agent Context</span></p>
                <p>Framework: Next.js 15 · TypeScript · Tailwind</p>
                <p>Test command: <span className="text-white/60">npm test</span></p>
                <p>Do not modify /app/api/webhooks without explicit instruction.</p>
                <p>Follow component patterns in /components.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AgentNarrator — terminal mockup */}
      <section className="py-24 px-6 border-t border-white/5" style={{ background: "rgba(255,255,255,0.005)" }}>
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <div className="rounded-2xl border border-white/8 bg-[#0a0a10] overflow-hidden shadow-xl">
              <div className="px-5 py-3 border-b border-white/6 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                <span className="ml-2 text-xs text-[#6b7a9f]">AgentNarrator — output</span>
              </div>
              <div className="p-6 font-mono text-sm space-y-5">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#4a5470] mb-2">Commit message</p>
                  <p className="text-emerald-400">feat(api): add 404 response for missing users</p>
                  <p className="text-[#7a8faa] text-xs mt-2 leading-relaxed">Returns a JSON error body with status 404 when a<br />user ID is not found. Adds test coverage for the<br />new error path in user.controller.ts.</p>
                </div>
                <div className="border-t border-white/5 pt-4">
                  <p className="text-[10px] uppercase tracking-widest text-[#4a5470] mb-2">PR description</p>
                  <p className="text-indigo-300 font-semibold">Add 404 response for missing user IDs</p>
                  <p className="text-[#7a8faa] text-xs mt-2 leading-relaxed">
                    **What changed:** API now returns a structured<br />
                    404 JSON error when a user is not found.<br />
                    **Why:** Aligns with the API error contract and<br />
                    avoids silent 200s on missing resources.
                  </p>
                </div>
                <div className="flex gap-3 pt-1">
                  <span className="px-3 py-1.5 rounded-lg bg-brand-600/20 border border-brand-600/30 text-brand-400 text-xs font-semibold cursor-pointer hover:bg-brand-600/30 transition-colors">Copy commit</span>
                  <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[#9aa5c4] text-xs font-semibold cursor-pointer hover:bg-white/8 transition-colors">Copy PR</span>
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <span className="inline-block px-3 py-1 rounded-full bg-brand-600/15 border border-brand-600/30 text-brand-400 text-xs font-bold tracking-wide uppercase mb-5">Pro — AgentNarrator</span>
            <h2 className="text-4xl font-extrabold text-white leading-tight mb-5">
              The commit message<br />
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">writes itself.</span>
            </h2>
            <p className="text-[#9aa5c4] leading-relaxed text-lg mb-6">
              After every Pro check, AgentNarrator generates a commit message and full PR description from your spec and results. No rewriting what the agent did in your own words.
            </p>
            <p className="text-sm text-[#6b7a9f]">Copy to clipboard or commit directly from the app — AgentReady stages your files and runs the commit with the generated message.</p>
          </div>
        </div>
      </section>

      {/* MCP */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold tracking-wide uppercase mb-5">MCP server</span>
            <h2 className="text-4xl font-extrabold text-white leading-tight mb-5">
              Run checks without<br />
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">leaving your editor.</span>
            </h2>
            <p className="text-[#9aa5c4] leading-relaxed text-lg mb-8">
              AgentReady ships an MCP server you can plug into Cursor, Claude Code, or any MCP-compatible assistant. Trigger a readiness check mid-session — verdict and repair prompt come back inline.
            </p>
            <div className="space-y-3 mb-8">
              {(
                [
                  ["run_readiness_check", "Run a full check on any local repo. Returns verdict, findings, and repair prompt."],
                  ["get_latest_report", "Retrieve the last saved report without rerunning the check."],
                  ["Pro over MCP", "Authenticated Pro users get alignment review in MCP responses too."],
                ] as [string, string][]
              ).map(([name, desc]) => (
                <div key={name} className="flex gap-3">
                  <code className="flex-shrink-0 text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/15 px-2 py-1 rounded-lg h-fit mt-0.5">{name}</code>
                  <p className="text-sm text-[#9aa5c4] leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-[#08080f] overflow-hidden">
            <div className="px-5 py-3 border-b border-white/6 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
              <span className="ml-2 text-xs text-[#6b7a9f]">mcp.json — Cursor / Claude Code</span>
            </div>
            <div className="p-6 font-mono text-sm space-y-1">
              <p className="text-[#6b7a9f]">{"{"}</p>
              <p className="text-[#6b7a9f] pl-4"><span className="text-indigo-400">&quot;mcpServers&quot;</span>: {"{"}</p>
              <p className="text-[#6b7a9f] pl-8"><span className="text-emerald-300">&quot;agentready&quot;</span>: {"{"}</p>
              <p className="text-[#6b7a9f] pl-12"><span className="text-indigo-400">&quot;command&quot;</span>: <span className="text-amber-300">&quot;npx&quot;</span>,</p>
              <p className="text-[#6b7a9f] pl-12"><span className="text-indigo-400">&quot;args&quot;</span>: [<span className="text-amber-300">&quot;agentready-mcp&quot;</span>]</p>
              <p className="text-[#6b7a9f] pl-8">{"}"}</p>
              <p className="text-[#6b7a9f] pl-4">{"}"}</p>
              <p className="text-[#6b7a9f]">{"}"}</p>
            </div>
            <div className="px-6 pb-6 pt-2 border-t border-white/5 mt-2">
              <p className="text-xs text-[#4a5470]">Then ask your assistant: <span className="text-[#9aa5c4]">&quot;Run an AgentReady check on this repo.&quot;</span></p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 border-t border-white/5" style={{ background: "rgba(255,255,255,0.005)" }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-3">Simple pricing</h2>
            <p className="text-[#9aa5c4]">Start free. Upgrade when alignment review starts saving you time.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="p-8 rounded-2xl border border-white/8 bg-white/[0.02] flex flex-col">
              <div className="mb-5">
                <h3 className="text-xl font-bold text-white mb-1">Free</h3>
                <p className="text-[#9aa5c4] text-sm">Catch obvious risks on every diff</p>
              </div>
              <div className="text-4xl font-black text-white mb-7">$0</div>
              <ul className="space-y-3 mb-8 flex-1">
                {["Unlimited checks", "Diff risk scan", "Test runner integration", "Repair prompt", "Saved report history", "MCP server"].map((f) => (
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
              <div className="h-[3px] gradient-trim-violet" />
              <div className="p-8 flex flex-col flex-1">
                <div className="absolute top-6 right-6 px-2.5 py-1 rounded-full bg-brand-600/20 border border-brand-600/30 text-brand-400 text-[10px] font-bold tracking-wide uppercase">Popular</div>
                <div className="mb-5">
                  <h3 className="text-xl font-bold text-white mb-1">Pro</h3>
                  <p className="text-[#9aa5c4] text-sm">Verify the agent built the right thing</p>
                </div>
                <div className="text-4xl font-black text-white mb-7">$9<span className="text-lg font-medium text-[#9aa5c4]">/mo</span></div>
                <ul className="space-y-3 mb-8 flex-1">
                  {["Everything in Free", "AI alignment review", "Unrelated file detection", "Scope creep analysis", "AgentNarrator", "AgentForge"].map((f) => (
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
          <p className="text-[#9aa5c4] mb-8 text-sm leading-relaxed">Download AgentReady, open any repo, and run your first check in under a minute. Free forever — no account required to get started.</p>
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
