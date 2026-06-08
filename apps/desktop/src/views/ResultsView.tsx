import { useState } from "react";
import type { FeatureSessionInput, ReadinessReport, TestResult } from "../types";

interface ResultsViewProps {
  repoPath: string;
  session: FeatureSessionInput;
  report: ReadinessReport;
  isLatestReport: boolean;
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
  isLatestReport,
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
      <div className={`verdict-hero verdict-hero-${report.verdict.toLowerCase()}`}>
        <p className="eyebrow verdict-hero-repo">{repoPath}</p>
        <span className="verdict-hero-label">{report.verdict.replaceAll("_", " ")}</span>
        <h1 className="verdict-hero-title">{session.title}</h1>
        {report.verdictExplanation && (
          <p className="verdict-hero-explanation">{report.verdictExplanation}</p>
        )}
      </div>

      <header className="view-header view-header-compact">
        <p className="meta">
          Generated {new Date(report.generatedAt).toLocaleString()} ·{" "}
          {report.checkSuite}
          {typeof report.durationMs === "number" ? ` · ${report.durationMs}ms` : ""}
          {" · "}engine {report.engineVersion}
        </p>
        {!isLatestReport && (
          <p className="archived-note">
            Archived report — not the latest saved check.
          </p>
        )}
        {isLatestReport && latestReportPath && (
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
          <strong>{error.includes("No uncommitted changes to check yet") ? "Nothing to check yet" : "Re-run failed"}</strong>
          <p>{error}</p>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <div>
            <h2>Repair prompt</h2>
            <p className="hint">Paste this into Cursor or Claude to guide the fix.</p>
          </div>
          <button
            type="button"
            className="secondary copy-button"
            onClick={copyRepairPrompt}
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <pre className="repair-prompt">{report.repairPrompt}</pre>
      </div>

      <div className="results-overview-layout">
        <div className="card">
          <h2>Original request</h2>
          <p className="request-copy">{session.description}</p>
        </div>

        <div className="card">
          <h2>Diff summary</h2>
          <DiffList label="Added" paths={report.diffSummary.added} />
          <DiffList label="Modified" paths={report.diffSummary.modified} />
          <DiffList label="Deleted" paths={report.diffSummary.deleted} />
          <p className="stat-line">
            {report.diffSummary.totalFiles} files ·{" "}
            <strong>{report.diffSummary.totalChangedLines}</strong> changed lines
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

      {report.testResult && report.testResult.status !== "skip" && (
        <div className="card">
          <h2>Tests</h2>
          <TestResultDetail testResult={report.testResult} />
        </div>
      )}

      <div className="actions">
        <button
          type="button"
          className="secondary"
          disabled={isRunning}
          onClick={onBack}
        >
          Back
        </button>
        <button
          type="button"
          className="primary-purple"
          disabled={isRunning}
          onClick={onRerun}
        >
          {isRunning ? "Re-running..." : "Re-run check"}
        </button>
      </div>
    </section>
  );
}

function TestResultDetail({ testResult }: { testResult: TestResult }) {
  const { status, ran, command, exitCode, durationMs, message, stdoutSnippet, stderrSnippet } =
    testResult;

  if (status === "warn" && !ran) {
    return (
      <>
        <p className="test-result-label">
          <span className="status status-warn">No test command configured</span>
        </p>
        <p className="hint">
          Add a test command on the session screen to run tests with future checks.
        </p>
      </>
    );
  }

  if (status === "error") {
    return (
      <>
        <p className="test-result-label">
          <span className="status status-error">Test command failed to start</span>
        </p>
        {command && (
          <p className="meta">
            Command: <code>{command}</code>
          </p>
        )}
        {message && <p>{message}</p>}
        {stderrSnippet && <pre className="test-output">{stderrSnippet}</pre>}
      </>
    );
  }

  if (status === "fail") {
    return (
      <>
        <p className="test-result-label">
          <span className="status status-fail">Tests failed</span>
        </p>
        {command && (
          <p className="meta">
            <code>{command}</code>
            {typeof exitCode === "number" ? ` · exit ${exitCode}` : ""}
            {typeof durationMs === "number" ? ` · ${durationMs}ms` : ""}
          </p>
        )}
        {message && <p>{message}</p>}
        {stdoutSnippet && <pre className="test-output">{stdoutSnippet}</pre>}
        {stderrSnippet && <pre className="test-output">{stderrSnippet}</pre>}
      </>
    );
  }

  if (status === "pass") {
    return (
      <>
        <p className="test-result-label">
          <span className="status status-pass">Tests passed</span>
        </p>
        {command && (
          <p className="meta">
            <code>{command}</code>
            {typeof durationMs === "number" ? ` · ${durationMs}ms` : ""}
          </p>
        )}
        {message && <p className="meta">{message}</p>}
      </>
    );
  }

  // Fallback for any unhandled status variant
  return (
    <p className="test-result-label">
      <span className={`status status-${status}`}>{status}</span>
      {message && <> — {message}</>}
    </p>
  );
}

function DiffList({ label, paths }: { label: string; paths: string[] }) {
  if (paths.length === 0) {
    return null;
  }

  const variant = label.toLowerCase();

  return (
    <div className={`diff-group diff-group-${variant}`}>
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
