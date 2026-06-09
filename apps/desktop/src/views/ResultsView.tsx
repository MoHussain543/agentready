import { useState } from "react";
import type { FeatureSessionInput, Finding, ProReview, ReadinessReport, TestResult } from "../types";
import { getStagedFiles, gitCommit } from "../lib/git";
import { generateNarrative, type NarrativeOutput } from "../lib/narrate";
import { getValidToken } from "../lib/auth";

interface ResultsViewProps {
  repoPath: string;
  session: FeatureSessionInput;
  report: ReadinessReport;
  isLatestReport: boolean;
  latestReportPath: string | null;
  isRunning: boolean;
  error: string | null;
  authToken: string | null;
  onBack: () => void;
  onRerun: () => void;
}

export function ResultsView({
  repoPath,
  session,
  report,
  isLatestReport,
  latestReportPath: _latestReportPath,
  isRunning,
  error,
  authToken,
  onBack,
  onRerun,
}: ResultsViewProps) {
  const [copied, setCopied] = useState(false);
  const [narrative, setNarrative] = useState<NarrativeOutput | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [narrativeError, setNarrativeError] = useState<string | null>(null);
  const [copiedCommit, setCopiedCommit] = useState(false);
  const [copiedPr, setCopiedPr] = useState(false);
  const [commitStage, setCommitStage] = useState<"idle" | "confirming" | "done">("idle");
  const [stagedFiles, setStagedFiles] = useState<string[]>([]);
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitResult, setCommitResult] = useState<string | null>(null);
  const [commitError, setCommitError] = useState<string | null>(null);
  const [expandedChecks, setExpandedChecks] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const check of report.checks) {
      if (check.status === "warn" || check.status === "fail") {
        initial.add(check.id);
      }
    }
    return initial;
  });
  const [diffExpanded, setDiffExpanded] = useState(report.diffSummary.totalFiles <= 5);

  const handleGenerateNarrative = async () => {
    setIsGenerating(true);
    setNarrativeError(null);
    try {
      const token = await getValidToken();
      const result = await generateNarrative({
        featureTitle: session.title || "Untitled feature",
        featureDescription: session.description,
        verdict: report.verdict,
        diffSummary: report.diffSummary,
        testResult: report.testResult,
        proReview: report.proReview,
        userToken: token,
      });
      setNarrative(result);
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err);
      setNarrativeError(
        raw === "SESSION_EXPIRED"
          ? "Session expired. Open Settings to sign in again."
          : raw.includes("Command generate_narrative not found")
            ? "Commit generation requires a fresh build — restart the app to enable GitNarrator."
            : raw,
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCommitClick = async () => {
    if (!narrative) return;
    setCommitError(null);
    setIsCommitting(true);
    try {
      const files = await getStagedFiles(repoPath);
      setStagedFiles(files);
      setCommitStage("confirming");
    } catch (err) {
      setCommitError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsCommitting(false);
    }
  };

  const handleCommitConfirm = async () => {
    if (!narrative) return;
    setIsCommitting(true);
    setCommitError(null);
    try {
      const output = await gitCommit(repoPath, narrative.commitMessage);
      setCommitResult(output || "Committed successfully.");
      setCommitStage("done");
    } catch (err) {
      setCommitError(err instanceof Error ? err.message : String(err));
      setCommitStage("idle");
    } finally {
      setIsCommitting(false);
    }
  };

  const copyText = async (text: string, setCopied: (v: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const copyRepairPrompt = async () => {
    try {
      await navigator.clipboard.writeText(report.repairPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const findingsByCheckId = new Map<string, Finding[]>();
  for (const finding of report.findings ?? []) {
    const list = findingsByCheckId.get(finding.checkId) ?? [];
    list.push(finding);
    findingsByCheckId.set(finding.checkId, list);
  }
  const orphanFindings = (report.findings ?? []).filter(
    (f) => !report.checks.some((c) => c.id === f.checkId),
  );

  const toggleCheck = (id: string) => {
    setExpandedChecks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const repairPromptSection = (
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
      <div className="repair-prompt">{report.repairPrompt}</div>
    </div>
  );

  const narratorSection = (
    <div className="card narrator-card">
      <div className="narrator-header">
        <div>
          <h2>Commit message</h2>
          <p className="hint">AI-generated from this check's spec and results.</p>
        </div>
        <span className="narrator-badge">GitNarrator</span>
      </div>

      {narrativeError && (
        <p className="narrator-error">{narrativeError}</p>
      )}

      {narrative ? (
        <div className="narrator-result">
          <div className="narrator-section">
            <div className="narrator-section-header">
              <span className="narrator-section-label">Commit message</span>
              <button
                type="button"
                className="secondary copy-button"
                onClick={() => void copyText(narrative.commitMessage, setCopiedCommit)}
              >
                {copiedCommit ? "Copied" : "Copy"}
              </button>
            </div>
            <pre className="narrator-commit">{narrative.commitMessage}</pre>
          </div>
          <div className="narrator-section">
            <div className="narrator-section-header">
              <span className="narrator-section-label">PR description</span>
              <button
                type="button"
                className="secondary copy-button"
                onClick={() => void copyText(`# ${narrative.prTitle}\n\n${narrative.prBody}`, setCopiedPr)}
              >
                {copiedPr ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="narrator-pr-title">{narrative.prTitle}</div>
            <pre className="narrator-commit">{narrative.prBody}</pre>
          </div>
          {commitError && (
            <p className="narrator-error">{commitError}</p>
          )}

          {commitStage === "confirming" && (
            <div className="narrator-confirm">
              <p className="narrator-confirm-label">
                Commit {stagedFiles.length} staged {stagedFiles.length === 1 ? "file" : "files"}:
              </p>
              <ul className="narrator-staged-list">
                {stagedFiles.slice(0, 6).map((f) => (
                  <li key={f}>{f}</li>
                ))}
                {stagedFiles.length > 6 && (
                  <li className="narrator-staged-more">+{stagedFiles.length - 6} more</li>
                )}
              </ul>
            </div>
          )}

          {commitStage === "done" && commitResult && (
            <p className="narrator-commit-success">{commitResult}</p>
          )}

          <div className="narrator-actions">
            {commitStage === "idle" && (
              <button
                type="button"
                className="primary-purple"
                disabled={isCommitting || isGenerating}
                onClick={() => void handleCommitClick()}
              >
                {isCommitting ? "Checking…" : "Commit"}
              </button>
            )}
            {commitStage === "confirming" && (
              <>
                <button
                  type="button"
                  className="primary-purple"
                  disabled={isCommitting || stagedFiles.length === 0}
                  onClick={() => void handleCommitConfirm()}
                >
                  {isCommitting ? "Committing…" : "Confirm commit"}
                </button>
                <button
                  type="button"
                  className="secondary"
                  disabled={isCommitting}
                  onClick={() => { setCommitStage("idle"); setCommitError(null); }}
                >
                  Cancel
                </button>
              </>
            )}
            {commitStage !== "done" && (
              <button
                type="button"
                className="secondary"
                disabled={isCommitting || isGenerating}
                onClick={() => {
                  setCommitStage("idle");
                  setCommitResult(null);
                  setCommitError(null);
                  void handleGenerateNarrative();
                }}
              >
                {isGenerating ? "Regenerating…" : "Regenerate"}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="narrator-empty">
          {authToken ? (
            <button
              type="button"
              className="primary-purple"
              disabled={isGenerating}
              onClick={() => void handleGenerateNarrative()}
            >
              {isGenerating ? (
                <span className="narrator-generating">
                  <span className="narrator-spinner" />
                  Generating…
                </span>
              ) : (
                "Generate commit message"
              )}
            </button>
          ) : (
            <p className="hint">Sign in to generate commit messages and PR descriptions.</p>
          )}
        </div>
      )}
    </div>
  );

  return (
    <section className="view view-wide results-view">
      <div className={`verdict-hero verdict-hero-${report.verdict.toLowerCase()}`}>
        <p className="eyebrow verdict-hero-repo">{repoPath}</p>
        <span className="verdict-hero-label">{verdictLabel(report.verdict)}</span>
        <h1 className="verdict-hero-title">{session.title || session.description.split("\n")[0].slice(0, 120) || "Untitled check"}</h1>
        {report.verdictExplanation && (
          <p className="verdict-hero-explanation">{report.verdictExplanation}</p>
        )}
        <div className="verdict-hero-stats">
          <span>{report.diffSummary.totalFiles} file{report.diffSummary.totalFiles === 1 ? "" : "s"} changed</span>
          {report.summary.warn > 0 && (
            <span className="verdict-hero-stat-warn">{report.summary.warn} warning{report.summary.warn === 1 ? "" : "s"}</span>
          )}
          {report.summary.fail > 0 && (
            <span className="verdict-hero-stat-fail">{report.summary.fail} failure{report.summary.fail === 1 ? "" : "s"}</span>
          )}
          {report.summary.warn === 0 && report.summary.fail === 0 && (
            <span className="verdict-hero-stat-clean">All checks passed</span>
          )}
        </div>
      </div>

      <header className="view-header view-header-compact">
        <p className="meta">
          Generated {new Date(report.generatedAt).toLocaleString()}
          {report.git ? ` · ${report.git.branch}@${(report.git.baseCommit ?? "").slice(0, 7)}` : ""}
          {" · "}{report.checkSuite}
          {typeof report.durationMs === "number" ? ` · ${report.durationMs}ms` : ""}
          {" · "}engine {report.engineVersion}
          {report.git?.isDirty ? " · dirty working tree" : ""}
        </p>
        {!isLatestReport && (
          <p className="archived-note">Archived report — not the latest saved check.</p>
        )}
      </header>

      {error && (
        <div className="error-banner" role="alert">
          <strong>{error.includes("No uncommitted changes to check yet") ? "Nothing to check yet" : "Re-run failed"}</strong>
          <p>{error}</p>
        </div>
      )}

      <div className="card">
        <h2>Checks</h2>
        <ul className="checks-list">
          {report.checks.map((check) => {
            const checkFindings = findingsByCheckId.get(check.id) ?? [];
            const isExpanded = expandedChecks.has(check.id);
            const hasDetail = check.message || check.remediation || checkFindings.length > 0;
            return (
              <li key={check.id}>
                <button
                  type="button"
                  className={`check-row${isExpanded ? " check-row-expanded" : ""}`}
                  onClick={() => hasDetail && toggleCheck(check.id)}
                  aria-expanded={isExpanded}
                >
                  <span className={`status status-${check.status}`}>{check.status}</span>
                  <span className="check-name-group">
                    <span className="check-name">{check.name}</span>
                    {!isExpanded && check.message && (
                      <span className="check-preview">{check.message}</span>
                    )}
                  </span>
                  {hasDetail && (
                    <span className="check-chevron" aria-hidden="true">
                      {isExpanded ? "▾" : "▸"}
                    </span>
                  )}
                </button>
                {isExpanded && hasDetail && (
                  <div className="check-body">
                    {check.message && <p>{check.message}</p>}
                    {check.remediation && (
                      <p className="remediation">{check.remediation}</p>
                    )}
                    {checkFindings.length > 0 && (
                      <ul className="check-findings">
                        {checkFindings.map((finding) => (
                          <li
                            key={`${finding.checkId}-${finding.message}`}
                            className={`check-finding-item check-finding-item-${finding.severity}`}
                          >
                            <span className={`severity severity-${finding.severity}`}>
                              {finding.severity}
                            </span>
                            <span className="check-finding-detail">
                              {finding.message}
                              {finding.paths && finding.paths.length > 0 && (
                                <span className="paths"> — {finding.paths.join(", ")}</span>
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        {orphanFindings.length > 0 && (
          <ul className="findings-list findings-orphan">
            {orphanFindings.map((finding) => (
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
        )}
      </div>

      {report.proReview ? (
        <div className="card pro-review-card">
          <div className="pro-review-header">
            <div>
              <h2>Alignment review</h2>
              <p className="pro-review-subtitle">
                Did the agent actually build the right thing?
              </p>
            </div>
            <span className="pro-badge">
              <LockIcon />
              Pro
            </span>
          </div>
          {report.proReview.skipped ? (
            <p className="hint">{report.proReview.skipReason ?? "Alignment review was skipped for this check."}</p>
          ) : (
            <ProReviewDetail review={report.proReview} />
          )}
        </div>
      ) : (
        <div className="card pro-review-card">
          <div className="pro-review-header">
            <div>
              <h2>Alignment review</h2>
              <p className="pro-review-subtitle">
                Did the agent actually build the right thing?
              </p>
            </div>
            <span className="pro-badge">
              <LockIcon />
              Pro
            </span>
          </div>
          <ul className="pro-review-capabilities">
            <li>
              <span className="pro-cap-icon">◆</span>
              <div>
                <strong>Feature alignment</strong>
                <p>Does the diff match what you asked the AI to build?</p>
              </div>
            </li>
            <li>
              <span className="pro-cap-icon">◆</span>
              <div>
                <strong>Unrelated file detection</strong>
                <p>Changed files that appear outside the feature scope.</p>
              </div>
            </li>
            <li>
              <span className="pro-cap-icon">◆</span>
              <div>
                <strong>Scope creep</strong>
                <p>Changes that go beyond what was requested.</p>
              </div>
            </li>
            <li>
              <span className="pro-cap-icon">◆</span>
              <div>
                <strong>Misleading UI copy</strong>
                <p>Text added to the UI that doesn't match the requested feature.</p>
              </div>
            </li>
          </ul>
          <div className="pro-review-footer">
            <p className="hint">Upgrade to Pro to unlock AI-powered alignment review.</p>
            <button type="button" className="secondary" disabled>
              Upgrade to Pro
            </button>
          </div>
        </div>
      )}

      {report.testResult && report.testResult.status !== "skip" && (
        <div className="card">
          <h2>Tests</h2>
          <TestResultDetail testResult={report.testResult} />
        </div>
      )}

      <div className="card">
        <button
          type="button"
          className="collapsible-card-header"
          onClick={() => setDiffExpanded((v) => !v)}
          aria-expanded={diffExpanded}
        >
          <h2>Diff summary</h2>
          <span className="collapsible-meta">
            {report.diffSummary.totalFiles} file{report.diffSummary.totalFiles === 1 ? "" : "s"} · {report.diffSummary.totalChangedLines} lines
          </span>
          <span className="check-chevron" aria-hidden="true">{diffExpanded ? "▾" : "▸"}</span>
        </button>
        {diffExpanded && (
          <>
            <DiffList label="Added" paths={report.diffSummary.added} />
            <DiffList label="Modified" paths={report.diffSummary.modified} />
            <DiffList label="Deleted" paths={report.diffSummary.deleted} />
          </>
        )}
      </div>

      {repairPromptSection}
      {narratorSection}

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

function ProReviewDetail({ review }: { review: ProReview }) {
  return (
    <div className="pro-review-result">
      <div className="pro-review-verdict">
        <span className={`pro-aligned-badge pro-aligned-${review.aligned ? "yes" : "no"}`}>
          {review.aligned ? "Aligned" : "Not aligned"}
        </span>
        <span className={`pro-confidence-badge pro-confidence-${review.confidence}`}>
          {review.confidence} confidence
        </span>
      </div>
      {review.summary && <p className="pro-review-summary">{review.summary}</p>}
      {review.unrelatedFiles.length > 0 && (
        <div className="pro-review-section">
          <h3>Unrelated files</h3>
          <ul className="pro-review-list">
            {review.unrelatedFiles.map((f) => (
              <li key={f}><code>{f}</code></li>
            ))}
          </ul>
        </div>
      )}
      {review.scopeCreep.length > 0 && (
        <div className="pro-review-section">
          <h3>Scope creep</h3>
          <ul className="pro-review-list">
            {review.scopeCreep.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
      {review.misleadingCopy.length > 0 && (
        <div className="pro-review-section">
          <h3>Misleading copy</h3>
          <ul className="pro-review-list">
            {review.misleadingCopy.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
      {review.suggestedFixes.length > 0 && (
        <div className="pro-review-section">
          <h3>Suggested fixes</h3>
          <ul className="pro-review-list">
            {review.suggestedFixes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function verdictLabel(verdict: ReadinessReport["verdict"]): string {
  switch (verdict) {
    case "READY_TO_COMMIT":
      return "No obvious red flags";
    case "NOT_READY":
      return "Risk detected";
    case "NEEDS_REVIEW":
      return "Needs review";
  }
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
          Add a test command on the check screen to run tests with future checks.
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

  return (
    <p className="test-result-label">
      <span className={`status status-${status}`}>{status}</span>
      {message && <> — {message}</>}
    </p>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 12 14" aria-hidden="true" width="11" height="11" fill="currentColor">
      <rect x="2" y="6" width="8" height="7" rx="1.5" />
      <path d="M4 6V4a2 2 0 1 1 4 0v2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
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
