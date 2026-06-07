import { open } from "@tauri-apps/plugin-dialog";

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
        <p className="subtitle">Verify AI-generated code before you commit.</p>
      </header>

      {error && (
        <div className="error-banner" role="alert">
          <strong>Could not open repository</strong>
          <p>{error}</p>
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
          <li>Checks your current uncommitted git diff before you commit</li>
          <li>Compares changes against the original request you gave the AI</li>
          <li>Optionally runs a local test command you configure</li>
        </ul>
        <p className="hint">
          Local-first. No signup, no auto-commit, no cloud dependency.
        </p>
      </div>
    </section>
  );
}
