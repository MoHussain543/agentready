import type { ContextForgeStatus } from "../lib/contextforge";
import type { RecentProjectEntry } from "../lib/recentProjects";

interface ProViewProps {
  repoPath: string;
  recentProjects: RecentProjectEntry[];
  isBusy: boolean;
  contextForgeStatus: ContextForgeStatus | null;
  isGeneratingContext: boolean;
  contextForgeError: string | null;
  onGenerateContextFiles: () => void;
  onOpenProject: () => void;
  onOpenRecentProject: (repoPath: string) => void;
  onRunCheck: () => void;
}

export function ProView({
  repoPath,
  recentProjects,
  isBusy,
  contextForgeStatus,
  isGeneratingContext,
  contextForgeError,
  onGenerateContextFiles,
  onOpenProject,
  onOpenRecentProject,
  onRunCheck,
}: ProViewProps) {
  return (
    <section className="view pro-view">
      <header className="view-header pro-view-header">
        <div className="pro-view-title-row">
          <div>
            <p className="eyebrow">Pro tools</p>
            <h1>Your Pro workspace</h1>
          </div>
          <span className="pro-badge">
            <SparkIcon />
            Pro
          </span>
        </div>
        {repoPath && <p className="repo-path">{repoPath}</p>}
      </header>

      {!repoPath ? (
        <div className="pro-view-empty">
          <div className="pro-view-empty-icon">
            <FolderProIcon />
          </div>
          <p className="pro-view-empty-label">No project open</p>
          <p className="pro-view-empty-sub">
            Open a git repository to access ContextForge, GitNarrator, and alignment review.
          </p>
          <button
            type="button"
            className="primary-purple"
            disabled={isBusy}
            onClick={onOpenProject}
          >
            {isBusy ? "Opening…" : "Open project"}
          </button>

          {recentProjects.length > 0 && (
            <div className="pro-view-recents">
              <p className="pro-view-recents-label">Recent projects</p>
              <ul className="pro-view-recents-list">
                {recentProjects.slice(0, 6).map((p) => (
                  <li key={p.repoPath}>
                    <button
                      type="button"
                      className="pro-view-recent-item"
                      disabled={isBusy}
                      onClick={() => onOpenRecentProject(p.repoPath)}
                    >
                      <span className="pro-view-recent-name">{p.repoName}</span>
                      <span className="pro-view-recent-path">{p.repoPath}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="pro-view-tools">
          <ContextForgeCard
            status={contextForgeStatus}
            isGenerating={isGeneratingContext}
            error={contextForgeError}
            onGenerate={onGenerateContextFiles}
          />
          <GitNarratorCard onRunCheck={onRunCheck} />
          <AlignmentCard />
        </div>
      )}
    </section>
  );
}

function ContextForgeCard({
  status,
  isGenerating,
  error,
  onGenerate,
}: {
  status: ContextForgeStatus | null;
  isGenerating: boolean;
  error: string | null;
  onGenerate: () => void;
}) {
  const detected = status?.stack?.detected ?? false;
  const bothPresent = status?.hasCursorrules && status?.hasAgentsMd;
  const partialPresent = status?.hasCursorrules || status?.hasAgentsMd;

  return (
    <div className="pro-tool-card pro-tool-card-forge">
      <div className="pro-tool-header">
        <div className="pro-tool-title-row">
          <span className="contextforge-badge">ContextForge</span>
          {status?.stack?.summary && (
            <span className="contextforge-stack">{status.stack.summary}</span>
          )}
        </div>
        <p className="pro-tool-desc">
          Generates <code>.cursorrules</code> and <code>AGENTS.md</code> tailored to your detected tech stack.
        </p>
      </div>

      {error && (
        <p className="contextforge-error" role="alert">{error}</p>
      )}

      <div className="pro-tool-status">
        {!detected ? (
          <span className="pro-tool-status-dim">Stack not detected — run a check first or open a different project.</span>
        ) : bothPresent ? (
          <span className="contextforge-status-ok">Context files ready</span>
        ) : partialPresent ? (
          <span className="pro-tool-status-dim">Some context files missing</span>
        ) : (
          <span className="pro-tool-status-dim">No context files yet</span>
        )}
      </div>

      {detected && (
        <div className="contextforge-actions">
          <button
            type="button"
            className="secondary contextforge-btn"
            disabled={isGenerating}
            onClick={onGenerate}
          >
            {isGenerating ? (
              <>
                <span className="contextforge-spinner" />
                {bothPresent ? "Regenerating…" : "Generating…"}
              </>
            ) : bothPresent ? (
              "Regenerate"
            ) : partialPresent ? (
              "Regenerate context files"
            ) : (
              "Generate context files"
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function GitNarratorCard({ onRunCheck }: { onRunCheck: () => void }) {
  return (
    <div className="pro-tool-card pro-tool-card-narrator">
      <div className="pro-tool-header">
        <div className="pro-tool-title-row">
          <span className="pro-tool-badge pro-tool-badge-narrator">GitNarrator</span>
        </div>
        <p className="pro-tool-desc">
          Generates a commit message and PR description from your diff and readiness report.
        </p>
      </div>
      <div className="pro-tool-status">
        <span className="pro-tool-status-dim">Available from the Results screen after a readiness check.</span>
      </div>
      <div className="contextforge-actions">
        <button
          type="button"
          className="secondary contextforge-btn"
          onClick={onRunCheck}
        >
          Run a readiness check
        </button>
      </div>
    </div>
  );
}

function AlignmentCard() {
  return (
    <div className="pro-tool-card pro-tool-card-alignment">
      <div className="pro-tool-header">
        <div className="pro-tool-title-row">
          <span className="pro-tool-badge pro-tool-badge-alignment">Alignment Review</span>
        </div>
        <p className="pro-tool-desc">
          Checks whether the AI's changes match what you asked for — catches scope creep, missing pieces, and hallucinated logic.
        </p>
      </div>
      <div className="pro-tool-status">
        <span className="contextforge-status-ok">Included automatically in every readiness check</span>
      </div>
    </div>
  );
}

function SparkIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M8 1.8 9.16 5l3.06 1.14L9.16 7.3 8 10.5 6.84 7.3 3.78 6.14 6.84 5z"
        fill="currentColor"
      />
    </svg>
  );
}

function FolderProIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path
        d="M6 11C6 9.34 7.34 8 9 8h6.5c.8 0 1.56.32 2.12.88l2 2c.2.2.47.32.76.32H31c1.66 0 3 1.34 3 3v13c0 1.66-1.34 3-3 3H9a3 3 0 0 1-3-3V11Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M20 18v6M17 21h6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
