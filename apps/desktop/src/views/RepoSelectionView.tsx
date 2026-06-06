interface RepoSelectionViewProps {
  repoPath: string;
  onRepoPathChange: (path: string) => void;
  onContinue: () => void;
}

export function RepoSelectionView({
  repoPath,
  onRepoPathChange,
  onContinue,
}: RepoSelectionViewProps) {
  const canContinue = repoPath.trim().length > 0;

  return (
    <section className="view">
      <header className="view-header">
        <h1>AgentReady</h1>
        <p className="subtitle">Verify AI-generated code before you commit.</p>
      </header>

      <div className="card">
        <h2>Select repository</h2>
        <p className="hint">
          Enter a local git repository path. Folder picker integration comes later.
        </p>
        <label className="field">
          <span>Repository path</span>
          <input
            type="text"
            value={repoPath}
            placeholder="/Users/you/projects/my-app"
            onChange={(e) => onRepoPathChange(e.target.value)}
          />
        </label>
        <div className="actions">
          <button type="button" disabled={!canContinue} onClick={onContinue}>
            Continue
          </button>
        </div>
      </div>
    </section>
  );
}
