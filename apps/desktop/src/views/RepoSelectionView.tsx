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
          Enter a local git repository path. Continuing initializes a local{" "}
          <code>.agentready/</code> folder. Folder picker integration comes later.
        </p>
        <label className="field">
          <span>Repository path</span>
          <input
            type="text"
            value={repoPath}
            placeholder="/Users/you/projects/my-app"
            disabled={isBusy}
            onChange={(e) => onRepoPathChange(e.target.value)}
          />
        </label>
        <div className="actions">
          <button type="button" disabled={!canContinue} onClick={onContinue}>
            {isBusy ? "Initializing..." : "Continue"}
          </button>
        </div>
      </div>

      <div className="card info-card">
        <h2>What Free v1 does</h2>
        <ul className="info-list">
          <li>Runs baseline readiness checks on your uncommitted git diff</li>
          <li>Matches changes against your original feature request</li>
          <li>Optionally runs a local test command you configure</li>
          <li>Saves local session state and report history under <code>.agentready/</code></li>
        </ul>
        <p className="hint">
          No signup, no auto-commit, no cloud. Deep stack-specific analysis is
          not included yet.
        </p>
      </div>
    </section>
  );
}
