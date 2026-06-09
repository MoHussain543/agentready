# AgentReady

AgentReady is a verification layer for AI-generated code. It sits between your AI agent and your git history — scanning every uncommitted diff for risk, verifying the agent built what you actually asked for, and generating the commit message before you push.

It ships as a native Mac desktop app (Tauri v2 + React), a web dashboard, an API, and an MCP server you can plug into Cursor or Claude Code.

---

## What it does

### Free — local checks on every diff

Every check runs entirely on your machine. No code is uploaded.

| Check | What it catches |
|---|---|
| **Deleted test coverage** | Tests removed or gutted during the agent's changes |
| **Hardcoded secrets** | API keys, tokens, and credentials left in the diff |
| **Dependency changes** | New packages added, versions bumped, config files modified |
| **Placeholder code** | TODO stubs, unimplemented methods, incomplete logic |
| **Oversized diffs** | Unusually broad changes that are hard to review or roll back |
| **Console log leakage** | Debug output left in production paths |

Every check also runs your test suite (if configured) and generates a **repair prompt** — a ready-to-paste instruction for Cursor or Claude Code that tells the agent exactly what to fix.

All check results are saved locally in `.agentready/` inside the target repo. Browse the full history per project, reopen any past report, or delete what you don't need.

---

### Pro — AI-powered review

Pro adds an AI layer on top of every check using Claude.

**AI Alignment Review**
Claude reads the diff against your original feature description and returns a verdict:
- Aligned or not-aligned, with a confidence level
- Unrelated files — changed files outside the scope of the feature
- Scope creep — changes that go further than what was requested
- Misleading UI copy — text in the UI that doesn't match the feature
- Suggested fixes — specific, actionable guidance on what to correct

**AgentNarrator**
Generates a commit message and full PR description from your spec and check results. Available after every Pro check. Copy to clipboard or commit directly from the app.

**AgentForge**
Detects your tech stack and writes `.cursorrules` and `AGENTS.md` to your repo so agents start with the right context from the first prompt. Cursor picks up `.cursorrules` automatically; Claude Code reads `AGENTS.md`. Regenerate any time the stack changes.

---

### MCP server

AgentReady ships an MCP server you can add to Cursor, Claude Code, or any MCP-compatible assistant. Run checks without leaving your editor.

**Tools exposed:**

| Tool | Description |
|---|---|
| `run_readiness_check` | Run a full check on a local repo. Returns verdict, findings, and repair prompt. Pro users also receive alignment review. |
| `get_latest_report` | Retrieve the last saved check for a repo without running a new one. |

**Setup:**
```json
{
  "agentready": {
    "command": "npx",
    "args": ["agentready-mcp"]
  }
}
```

---

## Repository layout

```
agentready/
├── apps/
│   ├── desktop/    # Tauri v2 (Rust) + React 19 + TypeScript — Mac desktop app
│   ├── web/        # Next.js 15 — marketing site and auth (Clerk + Stripe)
│   ├── api/        # Vercel serverless API — alignment review, AgentNarrator, AgentForge
│   └── mcp/        # MCP server — run checks from inside Cursor / Claude Code
├── engine/         # Java verification engine (Maven) — stateless diff analysis
└── docs/           # Architecture, scope docs, JSON schemas
```

| Path | Purpose |
|---|---|
| `apps/desktop/` | Native Mac app. Opens repos, runs the engine, shows verdicts, hosts Pro tools. |
| `apps/web/` | Marketing site and sign-up / dashboard. Clerk handles auth, Stripe handles billing. |
| `apps/api/` | Vercel edge functions. Called by the desktop app for Pro features (alignment review, AgentNarrator, AgentForge). |
| `apps/mcp/` | MCP server. Wraps the engine and API so checks run from inside AI coding assistants. |
| `engine/` | Stateless Java process. Receives a JSON request on stdin, returns a JSON readiness report on stdout. |
| `docs/` | Source of truth for scope, architecture, and integration contracts. |

---

## Prerequisites

| Component | Requirements |
|---|---|
| Desktop app | Node.js 20+, Rust (stable), [Tauri v2 prerequisites](https://v2.tauri.app/start/prerequisites/) |
| Engine | JDK 21+, Maven 3.9+ |
| Web | Node.js 20+ |
| MCP server | Node.js 18+ |

---

## Development

### 1. Build the engine

The engine must be built before the desktop app or MCP server can run.

```bash
cd engine
mvn package

# Test it directly — reads JSON on stdin, prints a report on stdout:
echo '{"protocolVersion":"1.0","command":"run_readiness","repoPath":"/path/to/repo"}' \
  | java -jar target/agentready-engine.jar
```

### 2. Desktop app

```bash
cd apps/desktop
npm install
npm run tauri dev
```

The Tauri shell locates `engine/target/agentready-engine.jar` automatically in dev.
Override with `AGENTREADY_ENGINE_JAR` (path to jar) or `AGENTREADY_JAVA` (path to java binary) if needed.

See [apps/desktop/DEVELOPMENT.md](apps/desktop/DEVELOPMENT.md) for full dev setup, env vars, and build instructions.

### 3. Web app

```bash
cd apps/web
npm install
npm run dev
```

Requires Clerk and Stripe environment variables. Copy `.env.example` to `.env.local` and fill in the values.

### 4. API

```bash
cd apps/api
npm install
vercel dev
```

Requires `AGENTREADY_TOKEN`, `AGENTREADY_JWT_SECRET`, and Anthropic API key env vars set in Vercel.

### 5. MCP server

```bash
cd apps/mcp
npm install
npm run build
node dist/index.js
```

Or install globally and add to your MCP config:

```bash
npm install -g agentready-mcp
```

---

## Architecture overview

**Desktop → Engine (local)**
The desktop app shells out to the Java engine, passing a JSON request. The engine analyzes the git diff and returns a structured JSON report. The engine is stateless and offline — it never phones home.

**Desktop → API (Pro features)**
Pro checks, AgentNarrator, and AgentForge call `agentready-api.vercel.app` over HTTPS. Requests are authenticated with a shared app token (`AGENTREADY_TOKEN`) and a per-user JWT signed by the web app (`AGENTREADY_JWT_SECRET`). The JWT carries `{ sub: clerkUserId, pro: bool }`.

**Auth flow**
Sign-in opens a browser to the web app (Clerk). On success, a JWT is written to the macOS keychain and emitted as a Tauri event. The React frontend picks it up in-memory without a keychain re-read.

**Local state**
Reports and session data live in `.agentready/` inside the target repo. This directory is local tool state — not application source — and should be added to `.gitignore`.

---

## Key environment variables

| Variable | Where | Purpose |
|---|---|---|
| `AGENTREADY_TOKEN` | `.cargo/config.toml` + Vercel `agentready-api` | Shared secret between desktop and API |
| `AGENTREADY_JWT_SECRET` | Vercel `agentready-web` + Vercel `agentready-api` | Signs and verifies per-user JWTs |
| `ANTHROPIC_API_KEY` | Vercel `agentready-api` | Claude API calls for Pro features |
| `CLERK_SECRET_KEY` | Vercel `agentready-web` | Clerk server-side auth |
| `STRIPE_SECRET_KEY` | Vercel `agentready-web` | Stripe billing |

---

## Local state and gitignore

AgentReady stores all session and report data in `.agentready/` inside each target repository. Add this to your `.gitignore`:

```
.agentready/
```

AgentForge writes `.cursorrules` and `AGENTS.md` to the repo root. Whether to commit these is up to you — most teams commit them so all contributors (and agents) share the same context.

---

## Docs

- [docs/architecture.md](docs/architecture.md) — system design and integration contracts
- [docs/free-v1-scope.md](docs/free-v1-scope.md) — free tier scope and check definitions
- [apps/desktop/DEVELOPMENT.md](apps/desktop/DEVELOPMENT.md) — desktop dev setup in detail
