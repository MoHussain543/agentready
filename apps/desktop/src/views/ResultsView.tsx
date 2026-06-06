import { VerdictBadge } from "../components/VerdictBadge";
import type { FeatureSessionInput, ReadinessReport } from "../types";

interface ResultsViewProps {
  repoPath: string;
  session: FeatureSessionInput;
  report: ReadinessReport;
  onBack: () => void;
  onRerun: () => void;
}

export function ResultsView({
  repoPath,
  session,
  report,
  onBack,
  onRerun,
}: ResultsViewProps) {
  return (
    <section className="view view-wide">
      <header className="view-header">
        <p className="eyebrow">{repoPath}</p>
        <div className="title-row">
          <h1>{session.title}</h1>
          <VerdictBadge verdict={report.verdict} />
        </div>
        <p className="meta">
          Generated {new Date(report.generatedAt).toLocaleString()} ·{" "}
          {report.checkSuite}
          {typeof report.durationMs === "number" ? ` · ${report.durationMs}ms` : ""}
        </p>
      </header>

      <div className="grid">
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
            {report.diffSummary.totalChangedLines} changed lines
          </p>
        </div>

        <div className="card">
          <h2>Check summary</h2>
          <ul className="stat-list">
            <li>Pass: {report.summary.pass}</li>
            <li>Warn: {report.summary.warn}</li>
            <li>Fail: {report.summary.fail}</li>
            <li>Skip: {report.summary.skip}</li>
          </ul>
          {report.git && (
            <p className="meta">
              {report.git.branch} @ {report.git.baseCommit}
              {report.git.isDirty ? " (dirty)" : ""}
            </p>
          )}
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
            {report.testResult.ran ? "Ran" : "Not run"} · status:{" "}
            {report.testResult.status}
          </p>
          {report.testResult.message && <p>{report.testResult.message}</p>}
        </div>
      )}

      <div className="card">
        <h2>Repair prompt</h2>
        <pre className="repair-prompt">{report.repairPrompt}</pre>
      </div>

      <div className="actions">
        <button type="button" className="secondary" onClick={onBack}>
          Edit session
        </button>
        <button type="button" onClick={onRerun}>
          Re-run check
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
