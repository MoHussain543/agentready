import type { FeatureSessionInput } from "../types";

interface StartSessionViewProps {
  repoPath: string;
  session: FeatureSessionInput;
  onSessionChange: (session: FeatureSessionInput) => void;
  onBack: () => void;
  onRunCheck: () => void;
}

export function StartSessionView({
  repoPath,
  session,
  onSessionChange,
  onBack,
  onRunCheck,
}: StartSessionViewProps) {
  const canRun =
    session.title.trim().length > 0 && session.description.trim().length > 0;

  return (
    <section className="view">
      <header className="view-header">
        <p className="eyebrow">Repository</p>
        <h1>Start feature session</h1>
        <p className="repo-path">{repoPath}</p>
      </header>

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
            onChange={(e) =>
              onSessionChange({ ...session, description: e.target.value })
            }
          />
        </label>

        <div className="actions">
          <button type="button" className="secondary" onClick={onBack}>
            Back
          </button>
          <button type="button" disabled={!canRun} onClick={onRunCheck}>
            Run readiness check
          </button>
        </div>
      </div>
    </section>
  );
}
