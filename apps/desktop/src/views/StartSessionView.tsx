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
  const isFirstRun = !latestVerdict && !lastRunAt;
  const isNoDiff = error?.includes("No uncommitted changes to check yet");
  const canRun =
    session.title.trim().length > 0 &&
    session.description.trim().length > 0 &&
    !isRunning;

  const testCommandMissing = runTests && testCommand.trim().length === 0;

  return (
    <section className="view session-view">
      <header className="view-header">
        <p className="eyebrow">Feature session</p>
        <h1>Start feature session</h1>
        <p className="repo-path">{repoPath}</p>
      </header>

      {error && (
        <div className="error-banner" role="alert">
          <strong>{isNoDiff ? "Nothing to check yet" : "Could not run readiness check"}</strong>
          <p>{error}</p>
        </div>
      )}

      {isFirstRun && !error && (
        <p className="first-run-notice">
          No checks have been run for this repository yet. Fill in what you asked the AI to build, then run a readiness check.
        </p>
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
        <h2>What did you ask the AI to build?</h2>
        <p className="hint">
          Describe what you asked your AI agent to build.
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
        <h2>Tests</h2>
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={runTests}
            disabled={isRunning}
            onChange={(e) => onRunTestsChange(e.target.checked)}
          />
          <span>Run tests with this check</span>
        </label>

        <label className="field">
          <span>Test command</span>
          <input
            type="text"
            value={testCommand}
            placeholder="npm test"
            disabled={isRunning}
            onChange={(e) => onTestCommandChange(e.target.value)}
          />
        </label>
        <p className="hint">Saved per repository. Leave blank to skip test execution.</p>

        {testCommandMissing && (
          <p className="inline-warning" role="alert">
            No test command saved. Enter one above or uncheck "Run tests" to skip.
          </p>
        )}
      </div>

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
    </section>
  );
}
