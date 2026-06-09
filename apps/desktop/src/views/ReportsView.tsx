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
  onDeleteAllReports: () => void;
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
  onDeleteAllReports,
}: ReportsViewProps) {
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const [confirmingDeleteAll, setConfirmingDeleteAll] = useState(false);

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
              {reports.length > 0 && (
                confirmingDeleteAll ? (
                  <div className="delete-all-confirm">
                    <span className="meta">Delete all {reports.length} reports?</span>
                    <button
                      type="button"
                      className="delete-confirm-btn"
                      disabled={isBusy}
                      onClick={() => { setConfirmingDeleteAll(false); onDeleteAllReports(); }}
                    >
                      Delete all
                    </button>
                    <button
                      type="button"
                      className="delete-cancel-btn"
                      onClick={() => setConfirmingDeleteAll(false)}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="delete-all-btn"
                    disabled={isBusy}
                    onClick={() => setConfirmingDeleteAll(true)}
                  >
                    Delete all
                  </button>
                )
              )}
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
                          <span className="history-entry-body">
                            {(entry.featureTitle || entry.verdictExplanation) && (
                              <span className="history-entry-title">
                                {entry.featureTitle || entry.verdictExplanation}
                              </span>
                            )}
                            {entry.featureTitle && entry.verdictExplanation && (
                              <span className="history-entry-subtitle">
                                {entry.verdictExplanation}
                              </span>
                            )}
                            <span className="history-entry-meta">
                              <span className="meta">
                                {new Date(entry.generatedAt).toLocaleString()}
                              </span>
                              <span className="history-entry-stats">
                                {entry.totalFiles > 0 && (
                                  <span>{entry.totalFiles} file{entry.totalFiles === 1 ? "" : "s"}</span>
                                )}
                                {entry.warnCount > 0 && (
                                  <span className="history-stat-warn">{entry.warnCount} warn</span>
                                )}
                                {entry.failCount > 0 && (
                                  <span className="history-stat-fail">{entry.failCount} fail</span>
                                )}
                                {(entry.testStatus === "pass" || entry.testStatus === "fail") && (
                                  <span className={`history-stat-test history-stat-test-${entry.testStatus}`}>
                                    tests {entry.testStatus === "pass" ? "passed" : "failed"}
                                  </span>
                                )}
                              </span>
                            </span>
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
        <button
          type="button"
          className="secondary"
          disabled={isBusy}
          onClick={selectedProject ? onBackToProjects : onBackHome}
        >
          Back
        </button>
      </div>
    </section>
  );
}
