import homeLogo from "../assets/agentready-glyph.png";
import { VerdictBadge } from "../components/VerdictBadge";
import type { RecentProjectEntry } from "../lib/recentProjects";

interface HomeViewProps {
  recentProjects: RecentProjectEntry[];
  versionLabel: string;
  isBusy: boolean;
  error: string | null;
  onOpenProject: () => void;
  onOpenRecentProject: (repoPath: string) => void;
  onViewSavedReports: () => void;
  onOpenHelp: () => void;
  onOpenSettings: () => void;
}

export function HomeView({
  recentProjects,
  versionLabel,
  isBusy,
  error,
  onOpenProject,
  onOpenRecentProject,
  onViewSavedReports,
  onOpenHelp,
  onOpenSettings,
}: HomeViewProps) {
  return (
    <section className="view home-view">
      <div className="home-toolbar">
        <button
          type="button"
          className="icon-button"
          aria-label="Help"
          onClick={onOpenHelp}
        >
          <QuestionIcon />
        </button>
        <button
          type="button"
          className="icon-button"
          aria-label="Settings"
          onClick={onOpenSettings}
        >
          <GearIcon />
        </button>
      </div>

      <div className="home-hero">
        <header className="home-header">
          <img
            src={homeLogo}
            alt="AgentReady logo"
            className="home-logo"
          />
          <h1>AgentReady</h1>
          <p className="subtitle">Catch obvious risks before you commit.</p>
        </header>

        {error && (
          <div className="error-banner" role="alert">
            <strong>Could not open repository</strong>
            <p>{error}</p>
          </div>
        )}

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
              <span>Choose a local git repository and start a verification session.</span>
            </span>
          </button>
          <button
            type="button"
            className="home-action-card home-action-reports"
            disabled={isBusy}
            onClick={onViewSavedReports}
          >
            <span className="home-action-icon">
              <ReportIcon />
            </span>
            <span className="home-action-copy">
              <strong>View saved reports</strong>
              <span>Browse previous report history by project and reopen a saved result.</span>
            </span>
          </button>
        </div>

        <p className="hint">
          Free checks focus on obvious risks in the diff. Feature alignment review is available in Pro.
        </p>
      </div>

      {recentProjects.length > 0 && (
        <div className="home-recents">
          <div className="home-section-heading">
            <h2>Recent projects</h2>
          </div>
          <ul className="recent-projects-list">
            {recentProjects.slice(0, 5).map((project) => (
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
      )}

      <p className="version-indicator">{versionLabel}</p>
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

function ReportIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M4 2.75h5.2l2.3 2.3v8.2H4z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M9.2 2.75v2.3h2.3" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5.5 8h4.8M5.5 10.25h4.8" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function QuestionIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M6.8 6.1a1.7 1.7 0 1 1 2.1 1.64c-.58.18-.9.55-.9 1.06v.24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="8" cy="11.8" r=".7" fill="currentColor" />
      <circle cx="8" cy="8" r="6.1" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M9.4 2.2 9.7 3a5.3 5.3 0 0 1 1 .42l.8-.32 1.1 1.9-.67.53c.08.34.13.7.13 1.07s-.05.73-.13 1.07l.67.53-1.1 1.9-.8-.32c-.31.18-.65.32-1 .42l-.3.8H6.6l-.3-.8a5.3 5.3 0 0 1-1-.42l-.8.32-1.1-1.9.67-.53A4.4 4.4 0 0 1 4 6.67c0-.37.05-.73.13-1.07l-.67-.53 1.1-1.9.8.32c.31-.18.65-.32 1-.42l.3-.8z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="6.67" r="1.8" fill="none" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}
