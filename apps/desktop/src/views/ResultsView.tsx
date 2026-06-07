import { useState } from "react";
import { VerdictBadge } from "../components/VerdictBadge";
import type { ReportHistoryEntry } from "../lib/storage";
import type { FeatureSessionInput, ReadinessReport } from "../types";

interface ResultsViewProps {
  repoPath: string;
  session: FeatureSessionInput;
  report: ReadinessReport;
  history: ReportHistoryEntry[];
  latestReportPath: string | null;
  isRunning: boolean;
  error: string | null;
  onBack: () => void;
  onRerun: () => void;
}

export function ResultsView({
  repoPath,
  session,
  report,
  history,
  latestReportPath,
  isRunning,
  error,
  onBack,
  onRerun,
}: ResultsViewProps) {
  const [copied, setCopied] = useState(false);

  const copyRepairPrompt = async () => {
    try {
      await navigator.clipboard.writeText(report.repairPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="view view-wide results-view">
      <header className="view-header">
        <p className="eyebrow">{repoPath}</p>
        <div className="title-row">
          <h1>{session.title}</h1>
          <VerdictBadge verdict={report.verdict} />
        </div>
        {report.verdictExplanation && (
          <p className="verdict-explanation">{report.verdictExplanation}</p>
        )}
        <p className="meta">
          Generated {new Date(report.generatedAt).toLocaleString()} ·{" "}
          {report.checkSuite}
          {typeof report.durationMs === "number" ? ` · ${report.durationMs}ms` : ""}
          {" · "}engine{" "}
          {report.engineVersion}
        </p>
        {latestReportPath && (
          <p className="saved-note">
            Saved locally to <code>{latestReportPath}</code>
          </p>
        )}
        {report.git && (
          <p className="git-context-line">
            Git context: <code>{report.git.branch}</code> @{" "}
            <code>{report.git.baseCommit}</code>
            {report.git.isDirty ? " · working tree has uncommitted changes" : ""}
          </p>
        )}
      </header>

      <div className="inspection-summary-strip">
        <div className="summary-grid">
          <div className="summary-stat summary-stat-verdict">
            <span className="summary-label">Verdict</span>
            <strong>{report.verdict.replaceAll("_", " ")}</strong>
          </div>
          <div className="summary-stat summary-stat-files">
            <span className="summary-label">Files changed</span>
            <strong>{report.diffSummary.totalFiles}</strong>
          </div>
          <div className="summary-stat summary-stat-warn">
            <span className="summary-label">Warnings</span>
            <strong>{report.summary.warn}</strong>
          </div>
          <div className="summary-stat summary-stat-fail">
            <span className="summary-label">Failures</span>
            <strong>{report.summary.fail}</strong>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-banner" role="alert">
          <strong>Re-run failed</strong>
          <p>{error}</p>
        </div>
      )}

      <div className="results-overview-layout">
        <div className="results-overview-sidebar">
          <div className="card">
            <h2>Original request</h2>
            <p className="request-copy">{session.description}</p>
          </div>

          <div className="card">
            <h2>Check summary</h2>
            <ul className="stat-list">
              <li>Pass: {report.summary.pass}</li>
              <li>Warn: {report.summary.warn}</li>
              <li>Fail: {report.summary.fail}</li>
              <li>Skip: {report.summary.skip}</li>
            </ul>
          </div>
        </div>

        <div className="card">
          <h2>Diff summary</h2>
          <DiffList label="Added" paths={report.diffSummary.added} />
          <DiffList label="Modified" paths={report.diffSummary.modified} />
          <DiffList label="Deleted" paths={report.diffSummary.deleted} />
          <p className="stat-line">
            {report.diffSummary.totalFiles} files ·{" "}
            {report.diffSummary.totalChangedLines} changed lines
          </p>
        </div>
      </div>

      {report.findings && report.findings.length > 0 && (
        <div className="card">
          <h2>Findings</h2>
          <ul className="findings-list">
            {report.findings.map((finding) => (
              <li key={`${finding.checkId}-${finding.message}`}>
                <span className={`severity severity-${finding.severity}`}>
                  {finding.severity}
                </span>
                <strong>{finding.checkId}</strong>: {finding.message}
                {finding.paths && finding.paths.length > 0 && (
                  <span className="paths"> ({finding.paths.join(", ")})</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card">
        <h2>Checks</h2>
        <ul className="checks-list">
          {report.checks.map((check) => (
            <li key={check.id}>
              <span className={`status status-${check.status}`}>
                {check.status}
              </span>
              <div>
                <strong>{check.name}</strong>
                <p>{check.message}</p>
                {check.remediation && (
                  <p className="remediation">{check.remediation}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {report.testResult && (
        <div className="card">
          <h2>Test result</h2>
          <p>
            <span className={`status status-${report.testResult.status}`}>
              {report.testResult.status}
            </span>
            {report.testResult.ran ? " Tests ran" : " Tests not run"}
          </p>
          {report.testResult.command && (
            <p className="meta">
              Command: <code>{report.testResult.command}</code>
              {typeof report.testResult.exitCode === "number"
                ? ` · exit ${report.testResult.exitCode}`
                : ""}
              {typeof report.testResult.durationMs === "number"
                ? ` · ${report.testResult.durationMs}ms`
                : ""}
            </p>
          )}
          {report.testResult.message && <p>{report.testResult.message}</p>}
          {report.testResult.stdoutSnippet && (
            <pre className="test-output">{report.testResult.stdoutSnippet}</pre>
          )}
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <div>
            <h2>Repair prompt</h2>
          </div>
          <button
            type="button"
            className="secondary copy-button"
            onClick={copyRepairPrompt}
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <p className="hint">
          Paste this into Cursor or Claude to guide the fix.
        </p>
        <pre className="repair-prompt">{report.repairPrompt}</pre>
      </div>

      {history.length > 0 && (
        <div className="card">
          <h2>Report history</h2>
          <p className="hint">
            {history.length} saved {history.length === 1 ? "report" : "reports"}{" "}
            in <code>.agentready/reports/</code>
          </p>
          <ul className="history-list">
            {history.slice(0, 10).map((entry) => (
              <li key={entry.fileName}>
                <VerdictBadge verdict={entry.verdict} />
                <span className="meta">
                  {new Date(entry.generatedAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="actions">
        <button
          type="button"
          className="secondary"
          disabled={isRunning}
          onClick={onBack}
        >
          Edit session
        </button>
        <button type="button" disabled={isRunning} onClick={onRerun}>
          {isRunning ? "Re-running..." : "Re-run check"}
        </button>
      </div>
    </section>
  );
}

function DiffList({ label, paths }: { label: string; paths: string[] }) {
  if (paths.length === 0) {
    return null;
  }

  return (
    <div className="diff-group">
      <h3>{label}</h3>
      <ul>
        {paths.map((path) => (
          <li key={path}>
            <code>{path}</code>
          </li>
        ))}
      </ul>
    </div>
  );
}
