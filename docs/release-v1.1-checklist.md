# AgentReady Free v1.1 — Release Checklist

Run through this list before tagging and distributing a release build.

## 1. Engine

- [ ] `cd engine && mvn package` completes without test failures.
- [ ] `engine/target/agentready-engine.jar` exists and is the fat JAR (not `original-agentready-engine.jar`).
- [ ] Smoke-test the engine directly:
  ```bash
  echo '{"protocolVersion":"1.0","command":"run_readiness","repoPath":"/path/to/any/git/repo"}' \
    | java -jar engine/target/agentready-engine.jar
  ```
  Expected: JSON response with `"status":"ok"` or `"status":"error"` (not a crash).

## 2. Desktop build

- [ ] `cd apps/desktop && npm run tauri build` succeeds.
- [ ] `src-tauri/resources/agentready-engine.jar` was staged automatically by `build.rs` (check build output for "Staged agentready-engine.jar" warning — expected once, not on subsequent clean builds).
- [ ] The bundle output exists:
  - macOS: `src-tauri/target/release/bundle/macos/AgentReady.app`
  - macOS DMG: `src-tauri/target/release/bundle/dmg/AgentReady_*.dmg`

## 3. Smoke-test the packaged app

Launch the `.app` from Finder (not Terminal) to verify Finder-launched behavior:

- [ ] App opens without a crash.
- [ ] Selecting a git repository and clicking Continue navigates to the session screen.
- [ ] Running a readiness check on a repo with uncommitted changes completes and shows a verdict.
- [ ] Running a readiness check on a clean repo (no diff) shows "Nothing to check yet" — not a crash or raw error.
- [ ] Selecting a non-git folder shows a friendly error ("That folder isn't a git repository...").
- [ ] Running with no Java installed shows a friendly error, not a raw process error.

## 4. Java dependency

- [ ] Test on a machine where `java` is not on the system `PATH` but is installed via Homebrew or a JDK installer — the engine should still start (Java discovery in `engine.rs` checks `$JAVA_HOME` and well-known macOS paths before falling back to `$PATH`).
- [ ] Document the Java requirement in the distributed README or release notes.

## 5. Version

- [ ] `apps/desktop/src-tauri/tauri.conf.json` `"version"` is bumped from `0.1.0`.
- [ ] Engine version echoed in reports matches the release (check `report.engineVersion` field).

## 6. macOS distribution (if distributing publicly)

- [ ] App bundle is code-signed (`codesign --verify --verbose AgentReady.app`).
- [ ] App is notarized via `xcrun notarytool` or Xcode.
- [ ] `.agentready/` gitignore recommendation appears somewhere visible (README or first-run UI).

## 7. Remaining known caveats

- **Java must be installed by the user.** There is no bundled JRE in v1.1. The app discovers Java at runtime but cannot install it. Recommend adoptium.net in release notes.
- **Single active session per repo.** Opening the same repo in two AgentReady windows simultaneously can corrupt `.agentready/session.json` (no cross-process locking).
- **Report history has no upper bound.** `reports/` grows indefinitely; no pruning in v1.1.
- **Test command trust.** The test command stored in `.agentready/session.json` is run as-is. Users opening shared repos should review the stored command before enabling "Run tests."
