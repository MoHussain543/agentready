# AgentReady Desktop — Development

## Engine integration (dev)

The Tauri shell invokes the Java engine as a subprocess:

```text
java -jar <agentready-engine.jar>   # JSON request on stdin, JSON response on stdout
```

### Locating the engine JAR

Resolution order:

1. `AGENTREADY_ENGINE_JAR` — absolute path to the fat JAR (recommended for CI or custom layouts)
2. `engine/target/agentready-engine.jar` relative to the monorepo root (default for local dev)
3. `apps/desktop/resources/agentready-engine.jar` (future bundled artifact)

Build the engine before running the desktop app:

```bash
cd engine && mvn package
```

### Java binary

- Default: `java` on `PATH` (JDK 21+)
- Override: `AGENTREADY_JAVA=/path/to/java`

### Running the desktop app

```bash
cd apps/desktop
npm install
npm run tauri dev
```

`tauri dev` must be started from the monorepo checkout so the relative path to `engine/target/agentready-engine.jar` resolves.

### Request flow

1. React builds `EngineRequest` (including `featureSpec` from the session form).
2. `invoke('run_readiness', { request })` calls the Rust command.
3. Rust serializes the request, spawns the engine, parses `EngineResponse`.
4. On success, Rust returns `ReadinessReport` to React.
5. On process, parse, or engine error, Rust returns `Err(String)` and React shows an error banner.

## Repo-local persistence

The Tauri shell owns repo-local state under `.agentready/` (the Java engine stays stateless):

| File | Written by | Contents |
| --- | --- | --- |
| `.agentready/session.json` | shell | current session metadata (see `docs/schemas/current-session.schema.json`) |
| `.agentready/feature-spec.json` | shell | current feature spec (see `docs/schemas/feature-spec.schema.json`) |
| `.agentready/reports/`, `.agentready/cache/.gitkeep` | shell | created on init; report history not persisted yet |

Tauri commands:

- `init_repo_storage(repoPath)` — creates `.agentready/` if missing, seeds/loads `session.json`, returns `{ session, featureSpec }`.
- `save_feature_session(repoPath, featureSpec)` — writes `feature-spec.json` and updates session pointers.
- `load_repo_session(repoPath)` — returns `{ session, featureSpec }` or `null` if not initialized.
- `record_readiness_run(repoPath, verdict)` — updates `lastReadinessRunAt` / `latestReportVerdict`.

Writes are atomic (temp file + rename). Missing files are handled gracefully.

### Temporary limitations

- Engine report content is still mocked inside Java (no real git diff yet).
- Report history is not written to disk; `latestReportPath` stays null and `reportHistoryCount` is 0.
- Only a single current session + feature spec is persisted (no multi-session model).
- Vite-only `npm run dev` cannot call Tauri commands; use `npm run tauri dev`.
