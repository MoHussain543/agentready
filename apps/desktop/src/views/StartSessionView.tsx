import { useEffect, useState } from "react";
import { VerdictBadge } from "../components/VerdictBadge";
import type { CurrentSession } from "../lib/storage";
import type { FeatureSessionInput, Verdict } from "../types";

interface StartSessionViewProps {
  repoPath: string;
  session: FeatureSessionInput;
  testCommand: string;
  testCommandCwd: string;
  runTests: boolean;
  latestSession: CurrentSession | null;
  hasLatestReport: boolean;
  isRunning: boolean;
  error: string | null;
  onSessionChange: (session: FeatureSessionInput) => void;
  onTestCommandChange: (testCommand: string) => void;
  onTestCommandCwdChange: (testCommandCwd: string) => void;
  onRunTestsChange: (runTests: boolean) => void;
  onViewLatest: () => void;
  onBack: () => void;
  onRunCheck: () => void;
}

export function StartSessionView({
  repoPath,
  session,
  testCommand,
  testCommandCwd,
  runTests,
  latestSession,
  hasLatestReport,
  isRunning,
  error,
  onSessionChange,
  onTestCommandChange,
  onTestCommandCwdChange,
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
  const normalizedTestCwd = testCommandCwd.trim().replace(/^\.\/+/, "");
  const resolvedTestCwd = normalizedTestCwd.length > 0
    ? `${repoPath}/${normalizedTestCwd}`
    : repoPath;

  if (isRunning) {
    return <RunningOverlay />;
  }

  return (
    <section className="view session-view">
      <header className="view-header">
        <p className="eyebrow">Feature session</p>
        <h1>Start feature session</h1>
        <p className="repo-path">{repoPath}</p>
      </header>

      {error && !isNoDiff && (
        <div className="error-banner" role="alert">
          <strong>Could not run readiness check</strong>
          <p>{error}</p>
        </div>
      )}

      {isNoDiff && (
        <div className="nodiff-notice" role="status">
          <strong>No uncommitted changes detected</strong>
          <p>
            AgentReady analyzes your git diff. Make changes with your AI agent first, then come back and run a check.
          </p>
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
        <label className="field">
          <span>Test working directory</span>
          <input
            type="text"
            value={testCommandCwd}
            placeholder="apps/desktop"
            disabled={isRunning}
            onChange={(e) => onTestCommandCwdChange(e.target.value)}
          />
        </label>
        <p className="hint">
          Saved per repository. Leave the command blank to skip test execution. Leave the directory blank to run from the repo root.
        </p>
        <p className="hint">
          Tests will run from <code>{resolvedTestCwd}</code>.
        </p>

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
        <button
          type="button"
          className="primary-purple"
          disabled={!canRun}
          onClick={onRunCheck}
        >
          {runTests ? "Run check with tests" : "Run readiness check"}
        </button>
      </div>
    </section>
  );
}

const RUNNING_MESSAGES = [
  "Reading your diff…",
  "Checking feature alignment…",
  "Running analysis…",
  "Almost done…",
];

function RunningOverlay() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const interval = setInterval(() => {
      setVisible(false);
      timeoutId = setTimeout(() => {
        setIndex((i) => (i + 1) % RUNNING_MESSAGES.length);
        setVisible(true);
      }, 250);
    }, 2600);
    return () => {
      clearInterval(interval);
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  return (
    <div className="run-overlay">
      <div className="run-spinner" />
      <p className={`run-message${visible ? " run-message-visible" : ""}`}>
        {RUNNING_MESSAGES[index]}
      </p>
    </div>
  );
}
