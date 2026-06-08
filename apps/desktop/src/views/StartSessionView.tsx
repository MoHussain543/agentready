import { useEffect, useState } from "react";
import { VerdictBadge } from "../components/VerdictBadge";
import type { ContextForgeStatus } from "../lib/contextforge";
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
  contextForgeStatus: ContextForgeStatus | null;
  isGeneratingContext: boolean;
  contextForgeError: string | null;
  isSignedIn: boolean;
  isPro: boolean;
  onSessionChange: (session: FeatureSessionInput) => void;
  onTestCommandChange: (testCommand: string) => void;
  onTestCommandCwdChange: (testCommandCwd: string) => void;
  onRunTestsChange: (runTests: boolean) => void;
  onViewLatest: () => void;
  onBack: () => void;
  onRunCheck: () => void;
  onGenerateContextFiles: () => void;
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
  contextForgeStatus,
  isGeneratingContext,
  contextForgeError,
  isSignedIn,
  isPro,
  onSessionChange,
  onTestCommandChange,
  onTestCommandCwdChange,
  onRunTestsChange,
  onViewLatest,
  onBack,
  onRunCheck,
  onGenerateContextFiles,
}: StartSessionViewProps) {
  const latestVerdict = latestSession?.latestReportVerdict ?? null;
  const lastRunAt = latestSession?.lastReadinessRunAt ?? null;
  const isFirstRun = !latestVerdict && !lastRunAt;
  const isNoDiff = error?.includes("No uncommitted changes to check yet");
  const canRun = session.description.trim().length > 0 && !isRunning;

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
        <p className="eyebrow">Pre-commit check</p>
        <h1>Check your diff</h1>
        <p className="repo-path">{repoPath}</p>
      </header>

      {error && !isNoDiff && (
        <div className="error-banner" role="alert">
          <strong>Could not run check</strong>
          <p>{error}</p>
        </div>
      )}

      {isNoDiff && (
        <div className="nodiff-notice" role="status">
          <strong>No uncommitted changes detected</strong>
          <p>
            AgentReady scans your uncommitted changes. Make some changes with your AI agent first, then come back and run a check.
          </p>
        </div>
      )}

      {isFirstRun && !error && (
        <p className="first-run-notice">
          No checks have been run for this repository yet. Describe what you asked the AI to build, then run a pre-commit check.
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

      {contextForgeStatus && contextForgeStatus.stack.detected && (
        <ContextForgeBanner
          status={contextForgeStatus}
          isGenerating={isGeneratingContext}
          error={contextForgeError}
          isSignedIn={isSignedIn}
          isPro={isPro}
          onGenerate={onGenerateContextFiles}
        />
      )}

      <div className="card">
        <h2>What are you building?</h2>
        <p className="hint">
          Used to generate the repair prompt and, in Pro, to verify feature alignment.
        </p>
        <label className="field">
          <textarea
            rows={6}
            value={session.description}
            placeholder="Describe what you asked the AI to build — e.g. add a 404 response for missing users in the API"
            disabled={isRunning}
            onChange={(e) => {
              const value = e.target.value;
              const title = value.split("\n")[0].slice(0, 120) || value.slice(0, 120);
              onSessionChange({ ...session, title, description: value });
            }}
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

function ContextForgeBanner({
  status,
  isGenerating,
  error,
  isSignedIn,
  isPro,
  onGenerate,
}: {
  status: ContextForgeStatus;
  isGenerating: boolean;
  error: string | null;
  isSignedIn: boolean;
  isPro: boolean;
  onGenerate: () => void;
}) {
  const bothPresent = status.hasCursorrules && status.hasAgentsMd;
  const partialPresent = status.hasCursorrules || status.hasAgentsMd;
  const canAct = status.canGenerate && isPro;

  return (
    <div className="contextforge-banner">
      <div className="contextforge-header">
        <div className="contextforge-title-row">
          <span className="contextforge-badge">ContextForge</span>
          <span className="contextforge-stack">{status.stack.summary}</span>
          {!isPro && <span className="contextforge-pro-tag">Pro</span>}
        </div>
        {bothPresent ? (
          <span className="contextforge-status-ok">Context files ready</span>
        ) : !isSignedIn ? (
          <p className="contextforge-desc">
            Sign in to generate .cursorrules and AGENTS.md for this stack.
          </p>
        ) : !isPro ? (
          <p className="contextforge-desc">
            Upgrade to Pro to generate .cursorrules and AGENTS.md for this stack.
          </p>
        ) : (
          <p className="contextforge-desc">
            {partialPresent
              ? "Some context files are missing. Regenerate to add them."
              : "Generate AI context files for this stack — writes .cursorrules and AGENTS.md to your repo."}
          </p>
        )}
      </div>

      {error && (
        <p className="contextforge-error" role="alert">{error}</p>
      )}

      {canAct && (
        <div className="contextforge-actions">
          <button
            type="button"
            className="secondary contextforge-btn"
            disabled={isGenerating}
            onClick={onGenerate}
          >
            {isGenerating ? (
              <>
                <span className="contextforge-spinner" />
                {bothPresent ? "Regenerating…" : "Generating…"}
              </>
            ) : bothPresent ? (
              "Regenerate"
            ) : partialPresent ? (
              "Regenerate context files"
            ) : (
              "Generate context files"
            )}
          </button>
        </div>
      )}
    </div>
  );
}

const RUNNING_MESSAGES = [
  "Reading your diff…",
  "Running checks…",
  "Analysing changes…",
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
