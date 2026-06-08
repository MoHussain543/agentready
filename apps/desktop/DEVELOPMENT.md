# AgentReady Desktop — Development

## Engine integration (dev)

The Tauri shell invokes the Java engine as a subprocess:

```text
java -jar <agentready-engine.jar>   # JSON request on stdin, JSON response on stdout
```

### Locating the engine JAR

Runtime resolution order (`engine.rs`):

1. `AGENTREADY_ENGINE_JAR` — absolute path to the fat JAR; use this for CI or custom layouts.
2. Tauri resource directory — where the JAR is bundled in a packaged app (populated by `bundle.resources` in `tauri.conf.json`).
3. `engine/target/agentready-engine.jar` relative to `CARGO_MANIFEST_DIR` — **dev-only**; this path is baked in at compile time and will not resolve on other machines.

Build the engine before running the desktop app:

```bash
cd engine && mvn package
```

`build.rs` auto-stages the built JAR into `src-tauri/resources/agentready-engine.jar` so that the Tauri resource declaration is satisfied. The staged JAR is gitignored and refreshed automatically on each build if the source JAR is newer.

### Java binary

Resolution order:

1. `AGENTREADY_JAVA` — absolute path to the `java` binary.
2. `$JAVA_HOME/bin/java` — set by most JDK installers.
3. Well-known macOS locations (Homebrew, JDK installer) — needed when the app is launched from Finder, where PATH excludes most package manager paths.
4. `java` on `$PATH` — fallback; works when launched from a terminal.

Minimum required version: JDK 21+.

### Running the desktop app

```bash
cd engine && mvn package          # build engine first
cd ../apps/desktop
npm install
npm run tauri dev
```

`tauri dev` must be run from inside `apps/desktop/`. The `build.rs` script locates the engine JAR relative to `CARGO_MANIFEST_DIR`, which requires the monorepo layout to be intact.

### Building a release bundle

```bash
# 1. Build the engine fat JAR.
cd engine && mvn package

# 2. Build and bundle the desktop app.
#    beforeBuildCommand copies the JAR into src-tauri/resources/ automatically.
cd apps/desktop
npm run tauri build
```

The resulting `.app` (macOS) or installer is in `apps/desktop/src-tauri/target/release/bundle/`.

**Requirements on the target machine:**
- Java 21+ must be installed. JDK from adoptium.net is recommended.
- No other dependencies; the JAR is bundled inside the app.

See `docs/release-v1.1-checklist.md` for the full pre-release verification checklist.

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
| `.agentready/reports/<timestamp>.json` | shell | one file per readiness run (full `ReadinessReport`) |
| `.agentready/latest-report.json` | shell | copy of the most recent report (used for hydration) |
| `.agentready/cache/.gitkeep` | shell | created on init |

These files are local AgentReady state and should normally be gitignored in the target repository.

Tauri commands:

- `init_repo_storage(repoPath)` — creates `.agentready/` if missing, seeds/loads `session.json`, returns `{ session, featureSpec, latestReport }`.
- `save_feature_session(repoPath, featureSpec)` — writes `feature-spec.json` and updates session pointers.
- `load_repo_session(repoPath)` — returns `{ session, featureSpec, latestReport }` or `null` if not initialized.
- `set_test_command(repoPath, command, cwd)` — persists (or clears) the repo-local test command and optional repo-relative working directory.
- `save_report(repoPath, report)` — writes a timestamped report + `latest-report.json` and updates session pointers (`lastReadinessRunAt`, `latestReportVerdict`, `latestReportPath`, `reportHistoryCount`).
- `load_latest_report(repoPath)` — returns the latest saved `ReadinessReport` or `null`.
- `list_reports(repoPath)` — returns saved report history entries (newest first).

Writes are atomic (temp file + rename). Missing files are handled gracefully.

### Temporary limitations

- Only a single current session + feature spec is persisted (no multi-session model).
- Report history is read by parsing each file on demand (no separate index).
- Vite-only `npm run dev` cannot call Tauri commands; use `npm run tauri dev`.
