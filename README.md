# AgentReady

Local-first desktop app that verifies **AI-generated code before commit**. Open a git repo, start a feature session with your original request, let your agent make changes, then run baseline readiness checks against the uncommitted diff. AgentReady returns a verdict, findings, and a repair prompt — you commit manually when ready.

Free v1 is offline, requires no signup, and stores repo-local state in `.agentready/`.
That directory is intended to stay local and should normally be gitignored.

## Repository layout

```
agentready/
├── apps/
│   └── desktop/     # Tauri shell (Rust) + React/TypeScript UI
├── docs/            # Product scope, architecture, JSON schemas
└── engine/          # Java verification engine (Maven)
```

| Path | Purpose |
|------|---------|
| `apps/desktop/` | Desktop app: opens repos, runs checks, displays verdicts and repair prompts. |
| `engine/` | Stateless Java process: analyzes git diff, returns JSON report. |
| `docs/` | Source of truth for scope, architecture, and integration contracts. |

See [docs/free-v1-scope.md](docs/free-v1-scope.md) and [docs/architecture.md](docs/architecture.md) for design details.

## Prerequisites

- **Desktop:** Node.js 20+, Rust (stable), platform Tauri dependencies ([Tauri prerequisites](https://v2.tauri.app/start/prerequisites/))
- **Engine:** JDK 21+, Maven 3.9+

## Development

### Engine

```bash
cd engine
mvn package
# Reads a JSON request on stdin and prints a JSON readiness report:
echo '{"protocolVersion":"1.0","command":"run_readiness","repoPath":"/path/to/repo"}' \
  | java -jar target/agentready-engine.jar
```

### Desktop

Build the engine first, then start the desktop app:

```bash
cd engine && mvn package
cd ../apps/desktop
npm install
npm run tauri dev
```

The shell locates `engine/target/agentready-engine.jar` automatically in local dev.
Override with `AGENTREADY_ENGINE_JAR` or `AGENTREADY_JAVA` if needed. See [apps/desktop/DEVELOPMENT.md](apps/desktop/DEVELOPMENT.md).

## Integration boundary

The shell and engine communicate via JSON defined in `docs/schemas/`. The shell persists session, feature spec, and reports under `.agentready/` in the target repository. Those files are local tool state, not application source, and should generally remain untracked.
