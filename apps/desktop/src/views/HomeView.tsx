import homeLogo from "../assets/agentready-glyph.png";
import { VerdictBadge } from "../components/VerdictBadge";
import type { RecentProjectEntry } from "../lib/recentProjects";

interface HomeViewProps {
  recentProjects: RecentProjectEntry[];
  isBusy: boolean;
  error: string | null;
  isSignedIn: boolean;
  isPro: boolean;
  onOpenProject: () => void;
  onBrowseHistory: () => void;
  onOpenPro: () => void;
  onOpenRecentProject: (repoPath: string) => void;
}

export function HomeView({
  recentProjects,
  isBusy,
  error,
  isSignedIn,
  isPro,
  onOpenProject,
  onBrowseHistory,
  onOpenPro,
  onOpenRecentProject,
}: HomeViewProps) {
  const hasRecents = recentProjects.length > 0;
  const proTitle = isPro ? "Pro review" : "Unlock Pro";
  const proSubtitle = isPro
    ? "Alignment review, ContextForge, and GitNarrator are active on this account."
    : isSignedIn
      ? "AI alignment review, ContextForge, and GitNarrator. Open your account to upgrade."
      : "AI alignment review, ContextForge, and GitNarrator. Sign in to unlock Pro.";
  const proBadge = isPro ? "PRO" : "Locked";

  return (
    <section className="view home-view">
      {error && (
        <div className="error-banner" role="alert">
          <strong>Could not open repository</strong>
          <p>{error}</p>
        </div>
      )}

      <header className="home-hero">
        <img src={homeLogo} alt="AgentReady" className="home-logo" />
        <div className="home-header">
          <p className="eyebrow">AgentReady</p>
          <h1>Catch risky AI code before you commit.</h1>
          <p className="subtitle">
            Run a local readiness check, revisit saved reports, or unlock Pro for alignment review and agent workflow tools.
          </p>
        </div>
      </header>

      <div className="home-actions">
        <button
          type="button"
          className="home-action-card home-action-open"
          disabled={isBusy}
          onClick={onOpenProject}
        >
          <span className="home-action-icon">
            <FolderIcon />
          </span>
          <span className="home-action-copy">
            <strong>{isBusy ? "Opening..." : "Open project"}</strong>
            <span>Choose a local git repository and run a pre-commit check on the current diff.</span>
          </span>
        </button>
        <button
          type="button"
          className="home-action-card home-action-reports"
          disabled={isBusy}
          onClick={onBrowseHistory}
        >
          <span className="home-action-icon">
            <HistoryIcon />
          </span>
          <span className="home-action-copy">
            <strong>History</strong>
            <span>Browse saved reports from projects you have already checked.</span>
          </span>
        </button>
        <button
          type="button"
          className="home-action-card home-action-pro"
          disabled={isBusy}
          onClick={onOpenPro}
        >
          <span className="home-action-icon">
            <SparkIcon />
          </span>
          <span className="home-action-copy">
            <span className="home-action-topline">
              <strong>{proTitle}</strong>
              <span className={`home-action-badge ${isPro ? "home-action-badge-pro" : "home-action-badge-locked"}`}>
                {proBadge}
              </span>
            </span>
            <span>{proSubtitle}</span>
          </span>
        </button>
      </div>

      {hasRecents ? (
        <div className="home-recents">
          <h2 className="home-recents-heading">Recent projects</h2>
          <ul className="recent-projects-list">
            {recentProjects.slice(0, 8).map((project) => (
              <li key={project.repoPath}>
                <button
                  type="button"
                  className="recent-project"
                  disabled={isBusy}
                  onClick={() => onOpenRecentProject(project.repoPath)}
                >
                  <span className="recent-project-main">
                    <span className="recent-project-name">{project.repoName}</span>
                    <span className="recent-project-path">{project.repoPath}</span>
                  </span>
                  <span className="recent-project-meta">
                    {project.latestVerdict && (
                      <VerdictBadge verdict={project.latestVerdict} />
                    )}
                    <span className="meta">
                      {formatRelativeTime(project.lastCheckedAt ?? project.lastOpenedAt)}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="hint home-hint">
          Free checks focus on obvious risks in the diff. Feature alignment review is available in Pro.
        </p>
      )}
    </section>
  );
}

function formatRelativeTime(value: string): string {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    return "Recently";
  }

  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) {
    return "Just now";
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  }
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  }
  return new Date(value).toLocaleDateString();
}

function FolderIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M2 4.25C2 3.56 2.56 3 3.25 3h2.47c.33 0 .64.13.88.37l.76.76c.09.09.21.14.34.14h4.05c.69 0 1.25.56 1.25 1.25v5.23c0 .69-.56 1.25-1.25 1.25h-8.5C2.56 12 2 11.44 2 10.75z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <circle
        cx="8"
        cy="8"
        r="4.75"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M8 5.75v2.3l1.6 1.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M8 1.8 9.16 5l3.06 1.14L9.16 7.3 8 10.5 6.84 7.3 3.78 6.14 6.84 5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinejoin="round"
      />
      <path
        d="m12 9.6.54 1.48 1.46.55-1.46.55L12 13.65l-.54-1.47-1.46-.55 1.46-.55z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.05"
        strokeLinejoin="round"
      />
    </svg>
  );
}
