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
  const [testsExpanded, setTestsExpanded] = useState(runTests);

  const isNoDiff = error?.includes("No uncommitted changes to check yet");
  const canRun = session.description.trim().length > 0 && !isRunning;

  const testCommandMissing = runTests && testCommand.trim().length === 0;
  const normalizedTestCwd = testCommandCwd.trim().replace(/^\.\/+/, "");
  const resolvedTestCwd = normalizedTestCwd.length > 0
    ? `${repoPath}/${normalizedTestCwd}`
    : repoPath;

  if (isRunning) {
    const repoName = repoPath.split("/").filter(Boolean).pop() ?? repoPath;
    return (
      <RunningOverlay
        repoName={repoName}
        specTitle={session.title.trim() || session.description.split("\n")[0].slice(0, 60).trim()}
        withTests={runTests && testCommand.trim().length > 0}
      />
    );
  }

  return (
    <section className={`view session-view${isPro ? " session-view-pro" : ""}`}>
      <header className="view-header">
        {isPro ? (
          <p className="eyebrow session-eyebrow-pro">
            <span className="session-pro-dot" aria-hidden="true" />
            Pro check
          </p>
        ) : (
          <p className="eyebrow">Pre-commit check</p>
        )}
        <h1>Check your diff</h1>
        <p className="repo-path">{repoPath}</p>
      </header>

      {isPro && (
        <div className="session-pro-banner">
          <div className="session-pro-banner-item">
            <span className="session-pro-banner-icon session-pro-banner-icon-check">
              <CheckMarkIcon />
            </span>
            <span>Diff &amp; security analysis</span>
          </div>
          <span className="session-pro-banner-divider" aria-hidden="true" />
          <div className="session-pro-banner-item session-pro-banner-item-highlight">
            <span className="session-pro-banner-icon session-pro-banner-icon-ai">
              <SparkSmallIcon />
            </span>
            <span>AI Alignment Review</span>
          </div>
          <span className="session-pro-banner-divider" aria-hidden="true" />
          <div className="session-pro-banner-item">
            <span className="session-pro-banner-icon session-pro-banner-icon-check">
              <CheckMarkIcon />
            </span>
            <span>Repair prompt</span>
          </div>
          <span className="session-pro-banner-divider" aria-hidden="true" />
          <div className="session-pro-banner-item">
            <span className="session-pro-banner-icon session-pro-banner-icon-check">
              <CheckMarkIcon />
            </span>
            <span>GitNarrator</span>
          </div>
        </div>
      )}

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

      <div className={`card${isPro ? " card-primary" : " card-session-free"}`}>
        <div className="session-card-header">
          <h2>What are you building?</h2>
          {isPro && <span className="session-ai-tag">feeds alignment review</span>}
        </div>
        <p className="hint">
          {isPro
            ? "Describe what you asked the AI to build — used for the repair prompt and AI alignment review."
            : "Describe what you asked the AI to build — used for the repair prompt and, in Pro, for alignment review."}
        </p>
        <label className="field">
          <textarea
            rows={7}
            value={session.description}
            placeholder={isPro
              ? "e.g. Add a 404 response for missing users. The API should return JSON with an error message and status 404 when a user ID is not found."
              : "e.g. Add a 404 response for missing users — describe what you asked the AI to build in enough detail to guide the repair prompt."}
            disabled={isRunning}
            onChange={(e) =>
              onSessionChange({ ...session, description: e.target.value })
            }
          />
        </label>
      </div>

      <div className="card card-secondary tests-card">
        <button
          type="button"
          className="tests-card-toggle"
          disabled={isRunning}
          aria-expanded={testsExpanded}
          onClick={() => setTestsExpanded((v) => !v)}
        >
          <h2>Tests</h2>
          <span className="tests-card-toggle-meta">
            {runTests && testCommand.trim() ? testCommand.trim() : "not configured"}
          </span>
          <span className="check-chevron" aria-hidden="true">
            {testsExpanded ? "▾" : "▸"}
          </span>
        </button>

        {testsExpanded && (
          <div className="tests-card-body">
            <label className="checkbox-field checkbox-field-inline">
              <input
                type="checkbox"
                checked={runTests}
                disabled={isRunning}
                onChange={(e) => onRunTestsChange(e.target.checked)}
              />
              <span>Run tests with this check</span>
            </label>

            {runTests && (
              <>
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
                  Tests will run from <code>{resolvedTestCwd}</code>. Leave directory blank for repo root.
                </p>
                {testCommandMissing && (
                  <p className="inline-warning" role="alert">
                    No test command saved. Enter one above or uncheck "Run tests" to skip.
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>

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

      {latestVerdict && (
        <div className="prior-check-strip">
          <VerdictBadge verdict={latestVerdict as Verdict} />
          <span className="prior-check-label">
            Last check{lastRunAt ? ` · ${new Date(lastRunAt).toLocaleDateString()}` : ""}
          </span>
          {hasLatestReport && (
            <button
              type="button"
              className="prior-check-view"
              disabled={isRunning}
              onClick={onViewLatest}
            >
              View report
            </button>
          )}
        </div>
      )}

      {!isPro && (
        <div className="session-free-upsell">
          <span className="session-free-upsell-text">
            <LockIcon /> AI Alignment Review not included — checks whether the AI built what you asked
          </span>
          <span className="session-free-upsell-cta">Upgrade to Pro</span>
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
          disabled={!canRun}
          onClick={onRunCheck}
        >
          {isPro
            ? runTests ? "Run Pro check with tests" : "Run Pro check"
            : runTests ? "Run check with tests" : "Run readiness check"}
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

function SparkSmallIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M8 1.8 9.16 5l3.06 1.14L9.16 7.3 8 10.5 6.84 7.3 3.78 6.14 6.84 5z"
        fill="currentColor"
      />
    </svg>
  );
}

function CheckMarkIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2.5 6l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <rect x="2" y="5.5" width="8" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4 5.5V3.5a2 2 0 0 1 4 0v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

const RUNNING_MESSAGES = [
  "Reading your diff…",
  "Running checks…",
  "Analysing changes…",
  "Almost done…",
];

function RunningOverlay({
  repoName,
  specTitle,
  withTests,
}: {
  repoName: string;
  specTitle: string;
  withTests: boolean;
}) {
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
      <div className="run-overlay-context">
        <span className="run-overlay-repo">{repoName}</span>
        {specTitle && (
          <span className="run-overlay-spec">{specTitle}</span>
        )}
        {withTests && (
          <span className="run-overlay-tests">including tests</span>
        )}
      </div>
      <div className="run-spinner" />
      <p className={`run-message${visible ? " run-message-visible" : ""}`}>
        {RUNNING_MESSAGES[index]}
      </p>
    </div>
  );
}
