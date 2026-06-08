import { useState } from "react";
import { VerdictBadge } from "../components/VerdictBadge";
import type { RecentProjectEntry } from "../lib/recentProjects";
import type { ReportHistoryEntry } from "../lib/storage";

interface ReportsViewProps {
  projects: RecentProjectEntry[];
  selectedProject: RecentProjectEntry | null;
  reports: ReportHistoryEntry[];
  isBusy: boolean;
  error: string | null;
  onBackHome: () => void;
  onSelectProject: (project: RecentProjectEntry) => void;
  onBackToProjects: () => void;
  onOpenReport: (entry: ReportHistoryEntry) => void;
  onDeleteReport: (entry: ReportHistoryEntry) => void;
}

export function ReportsView({
  projects,
  selectedProject,
  reports,
  isBusy,
  error,
  onBackHome,
  onSelectProject,
  onBackToProjects,
  onOpenReport,
  onDeleteReport,
}: ReportsViewProps) {
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  const handleConfirmDelete = (entry: ReportHistoryEntry) => {
    setConfirmingDelete(null);
    onDeleteReport(entry);
  };

  return (
    <section className="view reports-view">
      <header className="view-header">
        <p className="eyebrow">Saved reports</p>
        <h1>{selectedProject ? selectedProject.repoName : "Browse report history"}</h1>
        <p className="subtitle">
          {selectedProject
            ? "Open a previous verification result for this project."
            : "Pick a project to review its locally saved AgentReady reports."}
        </p>
      </header>

      {error && (
        <div className="error-banner" role="alert">
          <strong>Could not load saved reports</strong>
          <p>{error}</p>
        </div>
      )}

      <div className="card">
        {!selectedProject ? (
          <>
            <h2>Projects with report history</h2>
            {projects.length === 0 ? (
              <p className="hint">
                No saved report history has been found yet. Run a readiness check on a repository first.
              </p>
            ) : (
              <ul className="report-project-list">
                {projects.map((project) => (
                  <li key={project.repoPath}>
                    <button
                      type="button"
                      className="report-project-entry"
                      disabled={isBusy}
                      onClick={() => onSelectProject(project)}
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
                          {(project.reportHistoryCount ?? 0).toString()} report
                          {(project.reportHistoryCount ?? 0) === 1 ? "" : "s"}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <>
            <div className="card-header">
              <div>
                <h2>{selectedProject.repoName}</h2>
                <p className="meta">{selectedProject.repoPath}</p>
              </div>
              <button
                type="button"
                className="secondary"
                disabled={isBusy}
                onClick={onBackToProjects}
              >
                All projects
              </button>
            </div>

            {reports.length === 0 ? (
              <p className="hint">
                No saved reports were found for this project.
              </p>
            ) : (
              <ul className="history-list">
                {reports.map((entry) => (
                  <li key={entry.fileName}>
                    {confirmingDelete === entry.fileName ? (
                      <div className="history-entry-confirm">
                        <span className="meta confirm-label">Delete this report?</span>
                        <button
                          type="button"
                          className="delete-confirm-btn"
                          onClick={() => handleConfirmDelete(entry)}
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          className="delete-cancel-btn"
                          onClick={() => setConfirmingDelete(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="history-entry-row">
                        <button
                          type="button"
                          className="history-entry"
                          disabled={isBusy}
                          onClick={() => onOpenReport(entry)}
                        >
                          <VerdictBadge verdict={entry.verdict} />
                          <span className="meta">
                            {new Date(entry.generatedAt).toLocaleString()}
                          </span>
                        </button>
                        <button
                          type="button"
                          className="delete-entry-btn"
                          disabled={isBusy}
                          onClick={() => setConfirmingDelete(entry.fileName)}
                          title="Delete report"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      <div className="actions">
        <button type="button" className="secondary" disabled={isBusy} onClick={onBackHome}>
          Back
        </button>
      </div>
    </section>
  );
}
