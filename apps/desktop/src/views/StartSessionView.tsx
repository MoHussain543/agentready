import { VerdictBadge } from "../components/VerdictBadge";
import type { CurrentSession } from "../lib/storage";
import type { FeatureSessionInput, Verdict } from "../types";

interface StartSessionViewProps {
  repoPath: string;
  session: FeatureSessionInput;
  testCommand: string;
  runTests: boolean;
  latestSession: CurrentSession | null;
  hasLatestReport: boolean;
  isRunning: boolean;
  error: string | null;
  onSessionChange: (session: FeatureSessionInput) => void;
  onTestCommandChange: (testCommand: string) => void;
  onRunTestsChange: (runTests: boolean) => void;
  onViewLatest: () => void;
  onBack: () => void;
  onRunCheck: () => void;
}

export function StartSessionView({
  repoPath,
  session,
  testCommand,
  runTests,
  latestSession,
  hasLatestReport,
  isRunning,
  error,
  onSessionChange,
  onTestCommandChange,
  onRunTestsChange,
  onViewLatest,
  onBack,
  onRunCheck,
}: StartSessionViewProps) {
  const latestVerdict = latestSession?.latestReportVerdict ?? null;
  const lastRunAt = latestSession?.lastReadinessRunAt ?? null;
  const canRun =
    session.title.trim().length > 0 &&
    session.description.trim().length > 0 &&
    !isRunning;

  return (
    <section className="view session-view">
      <header className="view-header">
        <p className="eyebrow">Repository</p>
        <h1>Start feature session</h1>
        <p className="repo-path">{repoPath}</p>
      </header>

      {error && (
        <div className="error-banner" role="alert">
          <strong>Could not run readiness check</strong>
          <p>{error}</p>
        </div>
      )}

      {latestVerdict && (
        <div className="card latest-report-card">
          <div className="card-header">
            <div>
              <h2>Latest saved check</h2>
              {lastRunAt && (
                <p className="meta">
                  {new Date(lastRunAt).toLocaleString()}
                </p>
              )}
            </div>
            <VerdictBadge verdict={latestVerdict as Verdict} />
          </div>
          {hasLatestReport && (
            <button
              type="button"
              className="secondary"
              disabled={isRunning}
              onClick={onViewLatest}
            >
              View latest report
            </button>
          )}
        </div>
      )}

      <div className="card">
        <h2>Original request</h2>
        <p className="hint">
          Describe what you asked your AI agent to build. This seeds keyword and
          status-code checks against the diff.
        </p>

        <label className="field">
          <span>Feature title</span>
          <input
            type="text"
            value={session.title}
            placeholder="Return 404 for missing users"
            disabled={isRunning}
            onChange={(e) =>
              onSessionChange({ ...session, title: e.target.value })
            }
          />
        </label>

        <label className="field">
          <span>Feature description</span>
          <textarea
            rows={5}
            value={session.description}
            placeholder="API should return 404 when user id is not found..."
            disabled={isRunning}
            onChange={(e) =>
              onSessionChange({ ...session, description: e.target.value })
            }
          />
        </label>

      </div>

      <div className="card">
        <h2>Local tests (optional)</h2>
        <p className="hint">
          Configure a single test command to run as part of the check. The
          command runs locally in your repo; failing tests block the commit.
        </p>

        <label className="field">
          <span>Test command</span>
          <input
            type="text"
            value={testCommand}
            placeholder="mvn test"
            disabled={isRunning}
            onChange={(e) => onTestCommandChange(e.target.value)}
          />
        </label>

        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={runTests}
            disabled={isRunning}
            onChange={(e) => onRunTestsChange(e.target.checked)}
          />
          <span>Run tests with this check</span>
        </label>
      </div>

      <div className="card">
        <div className="actions">
          <button
            type="button"
            className="secondary"
            disabled={isRunning}
            onClick={onBack}
          >
            Back
          </button>
          <button type="button" disabled={!canRun} onClick={onRunCheck}>
            {isRunning
              ? "Running check..."
              : runTests
                ? "Run check with tests"
                : "Run readiness check"}
          </button>
        </div>
      </div>
    </section>
  );
}
