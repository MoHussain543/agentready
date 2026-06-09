import Image from "next/image";
import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

const productShots = [
  {
    src: "/screenshots/home.png",
    alt: "AgentReady home screen",
    eyebrow: "Home",
    title: "Start with the readiness workflow",
    description: "Open a repo, run a check, or jump straight into your saved report history.",
  },
  {
    src: "/screenshots/pro-check.png",
    alt: "AgentReady Pro check screen",
    eyebrow: "Pro Check",
    title: "Describe the change once",
    description: "Pro review layers AI alignment judgment on top of the baseline risk scan.",
  },
  {
    src: "/screenshots/pro-workspace.png",
    alt: "AgentReady Pro workspace",
    eyebrow: "Pro Workspace",
    title: "Keep premium tools in one place",
    description: "Alignment review, AgentForge, and AgentNarrator live in a dedicated workspace.",
  },
];

const comparison = [
  {
    label: "Free",
    title: "Baseline readiness checks",
    copy: "Runs locally against the current diff and catches obvious red flags before commit.",
    items: [
      "Diff and risk checks",
      "Optional test command",
      "Repair prompt",
      "Saved local report history",
    ],
    accent: "emerald",
  },
  {
    label: "Pro",
    title: "A second review layer",
    copy: "Adds AI alignment review and a workspace for the premium tools around your check workflow.",
    items: [
      "AI alignment verdict",
      "Scope creep detection",
      "AgentNarrator commit + PR output",
      "AgentForge context generation",
    ],
    accent: "violet",
  },
];

const workflow = [
  {
    step: "01",
    title: "Run a check",
    copy: "Open a local repo and run the readiness workflow before anything touches git history.",
  },
  {
    step: "02",
    title: "Review the verdict",
    copy: "See the risks, test results, repair prompt, and the exact reasons the diff needs another look.",
  },
  {
    step: "03",
    title: "Use Pro when judgment matters",
    copy: "Open the Pro workspace for alignment review, context generation, and commit-writing tools.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#09090d] text-[#edf2ff]">
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

      <section className="pt-40 pb-14 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-violet-600/10 rounded-full blur-3xl" />
          <div className="absolute top-24 left-1/4 w-[400px] h-[300px] bg-indigo-500/6 rounded-full blur-3xl" />
          <div className="absolute top-24 right-1/4 w-[400px] h-[300px] bg-blue-500/6 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <Image
              src="/agentready-glyph.png"
              alt="AgentReady"
              width={128}
              height={128}
              className="opacity-90"
              style={{ filter: "drop-shadow(0 0 18px rgba(139,92,246,0.35)) drop-shadow(0 8px 24px rgba(96,165,250,0.18))" }}
            />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-600/30 bg-brand-600/10 text-brand-400 text-xs font-semibold tracking-wide uppercase mb-8">
            A verification layer for AI-generated code
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight tracking-tight text-white mb-10">
            Catch risky AI code before you commit.
          </h1>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up" className="px-8 py-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-base transition-all hover:scale-[1.02] shadow-lg shadow-brand-600/25">
              Download free — Mac
            </Link>
            <Link href="#product" className="px-8 py-4 rounded-xl border border-white/10 hover:border-white/20 text-[#c8d3f0] font-semibold text-base transition-colors">
              See the product
            </Link>
          </div>
        </div>
      </section>

      <section id="product" className="pb-20 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6">
          {productShots.map((shot) => (
            <div key={shot.title} className="rounded-[28px] border border-white/8 bg-white/[0.02] overflow-hidden shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
              <div className="p-5 border-b border-white/6">
                <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-brand-400 mb-2">{shot.eyebrow}</p>
                <h2 className="text-lg font-semibold text-white mb-1">{shot.title}</h2>
                <p className="text-sm leading-relaxed text-[#9aa5c4]">{shot.description}</p>
              </div>
              <div className="p-2 bg-[#07070b]">
                <div className="rounded-[20px] overflow-hidden border border-white/6">
                  <Image src={shot.src} alt={shot.alt} width={900} height={650} className="w-full h-auto" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-start">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-white/[0.03] border border-white/8 text-[#c8d3f0] text-xs font-bold tracking-wide uppercase mb-4">
              Product split
            </span>
            <h2 className="text-3xl font-bold text-white mb-4">Free and Pro should feel different.</h2>
            <p className="text-[#9aa5c4] leading-relaxed">
              Free is the baseline readiness workflow. Pro is the second layer: deeper judgment, alignment review, and the premium tools around the same diff.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {comparison.map((entry) => (
              <div
                key={entry.title}
                className={`rounded-[26px] p-6 border ${
                  entry.accent === "emerald"
                    ? "border-emerald-500/15 bg-emerald-500/[0.03]"
                    : "border-violet-500/20 bg-violet-500/[0.05]"
                }`}
              >
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-[0.18em] uppercase mb-4 ${
                    entry.accent === "emerald"
                      ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                      : "bg-violet-500/12 border border-violet-500/25 text-violet-300"
                  }`}
                >
                  {entry.label}
                </span>
                <h3 className="text-xl font-semibold text-white mb-2">{entry.title}</h3>
                <p className="text-sm leading-relaxed text-[#9aa5c4] mb-5">{entry.copy}</p>
                <ul className="space-y-3">
                  {entry.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-[#d9e2fb]">
                      <span className={`mt-[3px] flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${
                        entry.accent === "emerald"
                          ? "bg-emerald-500/12 border border-emerald-500/25"
                          : "bg-violet-500/12 border border-violet-500/25 text-violet-300"
                      }`}>
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                          <path d="M1 4l2 2 4-4" stroke={entry.accent === "emerald" ? "#4ade80" : "#c4b5fd"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 border-t border-white/5" style={{ background: "rgba(255,255,255,0.005)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold tracking-wide uppercase mb-4">
              Workflow
            </span>
            <h2 className="text-3xl font-bold text-white mb-3">Three parts, one commit decision</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {workflow.map((item) => (
              <div key={item.step} className="rounded-[26px] border border-white/8 bg-white/[0.02] p-6">
                <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#6b7a9f] mb-4">{item.step}</p>
                <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-sm leading-relaxed text-[#9aa5c4]">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold tracking-wide uppercase mb-4">
              MCP server
            </span>
            <h2 className="text-3xl font-bold text-white mb-3">Run checks without leaving your editor</h2>
            <p className="text-[#9aa5c4] max-w-2xl mx-auto">
              AgentReady ships an MCP server you can plug into Cursor, Claude Code, or any MCP-compatible assistant.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              {
                title: "run_readiness_check",
                desc: "Run a check against a local repo from inside your assistant and get the verdict inline.",
              },
              {
                title: "get_latest_report",
                desc: "Re-open the most recent saved report without rerunning the workflow.",
              },
              {
                title: "Pro over MCP",
                desc: "Authenticated Pro users get alignment review in MCP responses too.",
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
              <div className="h-[3px] mx-0 gradient-trim-violet" />
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

      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ship AI code you actually trust</h2>
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
