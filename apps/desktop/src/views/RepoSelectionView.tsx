import { open } from "@tauri-apps/plugin-dialog";

function friendlyRepoError(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes("not a git repository")) {
    return "That folder isn't a git repository. Select the root folder of a project that uses git.";
  }
  if (lower.includes("does not exist")) {
    return "That path doesn't exist. Check the folder path or use Browse to pick a different one.";
  }
  if (lower.includes("permission denied") || lower.includes("access denied")) {
    return "AgentReady doesn't have permission to read that folder.";
  }
  return raw;
}

interface RepoSelectionViewProps {
  repoPath: string;
  isBusy: boolean;
  error: string | null;
  onRepoPathChange: (path: string) => void;
  onContinue: () => void;
}

export function RepoSelectionView({
  repoPath,
  isBusy,
  error,
  onRepoPathChange,
  onContinue,
}: RepoSelectionViewProps) {
  const canContinue = repoPath.trim().length > 0 && !isBusy;

  async function handleBrowse() {
    try {
      const selected = await open({ directory: true, multiple: false });
      if (typeof selected === "string") {
        onRepoPathChange(selected);
      }
    } catch {
      // Leave the current path alone if the native picker is unavailable.
    }
  }

  return (
    <section className="view repo-view">
      <header className="view-header">
        <p className="eyebrow">Local verifier</p>
        <h1>AgentReady</h1>
        <p className="subtitle">Catch obvious risks before you commit.</p>
      </header>

      {error && (
        <div className="error-banner" role="alert">
          <strong>Could not open repository</strong>
          <p>{friendlyRepoError(error)}</p>
        </div>
      )}

      <div className="card">
        <h2>Select repository</h2>
        <p className="hint">
          Enter the path to a local git repository to start a readiness check.
        </p>
        <label className="field">
          <span>Repository path</span>
          <div className="input-row">
            <input
              type="text"
              value={repoPath}
              placeholder="/Users/you/projects/my-app"
              disabled={isBusy}
              onChange={(e) => onRepoPathChange(e.target.value)}
            />
            <button
              type="button"
              className="secondary browse-button"
              disabled={isBusy}
              onClick={handleBrowse}
            >
              Browse
            </button>
          </div>
        </label>
        <div className="actions">
          <button type="button" disabled={!canContinue} onClick={onContinue}>
            {isBusy ? "Initializing..." : "Continue"}
          </button>
        </div>
      </div>

      <div className="card info-card">
        <h2>How it works</h2>
        <ul className="info-list">
          <li>Scans your current uncommitted git diff for obvious risks before you commit</li>
          <li>Flags things like deleted tests, failing tests, secrets, placeholder content, and dependency/config changes</li>
          <li>Optionally runs a local test command you configure</li>
        </ul>
        <p className="hint">
          Local-first. No signup, no auto-commit, no cloud dependency. Feature alignment review is available in Pro.
        </p>
      </div>
    </section>
  );
}
