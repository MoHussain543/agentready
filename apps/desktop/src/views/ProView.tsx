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
  const repoName = repoPath ? repoPath.split("/").filter(Boolean).pop() ?? repoPath : null;

  return (
    <section className="view pro-view">
      {!repoPath ? (
        <div className="pro-empty">
          <div className="pro-empty-content">
            <p className="eyebrow">Pro workspace</p>
            <h1>Open a project</h1>
            <p className="pro-empty-sub">
              Open a git repository to run Pro checks, generate context files, and access AgentNarrator.
            </p>
            <button
              type="button"
              className="primary-purple"
              disabled={isBusy}
              onClick={onOpenProject}
            >
              {isBusy ? "Opening…" : "Open project"}
            </button>
          </div>

          {recentProjects.length > 0 && (
            <div className="pro-recents">
              <p className="pro-recents-label">Recent</p>
              <ul className="pro-recents-list">
                {recentProjects.slice(0, 6).map((p) => (
                  <li key={p.repoPath}>
                    <button
                      type="button"
                      className="pro-recent-item"
                      disabled={isBusy}
                      onClick={() => onOpenRecentProject(p.repoPath)}
                    >
                      <span className="pro-recent-name">{p.repoName}</span>
                      <span className="pro-recent-path">{p.repoPath}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="pro-workspace-header">
            <div className="pro-workspace-title">
              <p className="eyebrow">Pro workspace</p>
              <h1>{repoName}</h1>
              <p className="repo-path">{repoPath}</p>
            </div>
          </div>

          <div className="pro-run-center">
            <button
              type="button"
              className="primary-purple pro-run-btn"
              disabled={isBusy}
              onClick={onRunCheck}
            >
              <CheckIcon />
              Run Pro check
            </button>
          </div>

          <div className="pro-tools-grid">
            <div className="pro-feature-card">
              <div className="pro-feature-icon pro-feature-icon-alignment">
                <AlignmentIcon />
              </div>
              <div className="pro-feature-body">
                <div className="pro-feature-title-row">
                  <span className="pro-feature-name">Alignment Review</span>
                  <span className="pro-feature-auto-badge">auto</span>
                </div>
                <p className="pro-feature-desc">
                  Claude reads your diff against what you asked the agent to build — returns a verdict, flags scope creep, and suggests fixes.
                </p>
              </div>
            </div>

            <div className="pro-feature-card">
              <div className="pro-feature-icon pro-feature-icon-narrator">
                <NarratorIcon />
              </div>
              <div className="pro-feature-body">
                <div className="pro-feature-title-row">
                  <span className="pro-feature-name">AgentNarrator</span>
                  <span className="pro-feature-results-badge">results screen</span>
                </div>
                <p className="pro-feature-desc">
                  Generates a commit message and PR description from your spec and check results. Available after every Pro check.
                </p>
              </div>
            </div>
          </div>

          <ContextForgeCard
            status={contextForgeStatus}
            isGenerating={isGeneratingContext}
            error={contextForgeError}
            onGenerate={onGenerateContextFiles}
          />
        </>
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
    <div className="pro-forge-card">
      <div className="pro-forge-left">
        <div className="pro-feature-icon pro-feature-icon-forge">
          <ForgeIcon />
        </div>
        <div className="pro-feature-body">
          <div className="pro-feature-title-row">
            <span className="pro-feature-name">AgentForge</span>
            {detected && status?.stack?.summary && (
              <span className="contextforge-stack">{status.stack.summary}</span>
            )}
          </div>
          <p className="pro-feature-desc">
            Generates <code>.cursorrules</code> and <code>AGENTS.md</code> tailored to your detected tech stack — so agents start with the right context.
          </p>
          {error && <p className="contextforge-error pro-forge-error" role="alert">{error}</p>}
          <div className="pro-forge-status">
            {!detected ? (
              <span className="pro-forge-status-hint">Stack not detected — run a check first.</span>
            ) : bothPresent ? (
              <span className="contextforge-status-ok">Context files ready</span>
            ) : partialPresent ? (
              <span className="pro-forge-status-hint">Some context files missing</span>
            ) : (
              <span className="pro-forge-status-hint">No context files yet</span>
            )}
          </div>
        </div>
      </div>

      {detected && (
        <div className="pro-forge-action">
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
              "Regenerate"
            ) : (
              "Generate"
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2 6.5l2.5 2.5 5.5-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AlignmentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 1.5 9.4 5.1l3.7 1.4-3.7 1.4L8 13.5 6.6 7.9 2.9 6.5l3.7-1.4z" fill="currentColor" opacity=".9" />
    </svg>
  );
}

function NarratorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 4h10M3 7h7M3 10h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ForgeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 2v3M8 11v3M2 8h3M11 8h3M4.22 4.22l2.12 2.12M9.66 9.66l2.12 2.12M4.22 11.78l2.12-2.12M9.66 6.34l2.12-2.12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
