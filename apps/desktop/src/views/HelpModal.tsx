import homeLogo from "../assets/agentready-glyph.png";

interface HelpModalProps {
  onClose: () => void;
}

export function HelpModal({ onClose }: HelpModalProps) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="modal-card help-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="modal-close-button"
          aria-label="Close help"
          onClick={onClose}
        >
          ×
        </button>

        <div className="help-modal-header">
          <img src={homeLogo} alt="AgentReady logo" className="help-modal-logo" />
          <h2 id="help-modal-title">Verify before you commit.</h2>
          <p className="subtitle">
            AgentReady scans the current diff for obvious risks and optional local test failures before you commit.
          </p>
        </div>

        <div className="help-modal-pill">How AgentReady works</div>

        <div className="modal-section help-modal-section-card">
          <h3>Core flow</h3>
          <ol className="modal-list">
            <li>Open a local git repository.</li>
            <li>Describe what you asked the AI to build.</li>
            <li>Run a pre-commit check and review the verdict.</li>
          </ol>
        </div>

        <div className="modal-section help-modal-section-card">
          <h3>What gets checked</h3>
          <ul className="modal-list">
            <li><strong>Diff completeness</strong> — are there any uncommitted changes to check at all?</li>
            <li><strong>Obvious risk checks</strong> — deleted tests, suspicious secrets, dependency/config changes, placeholder content, and other deterministic red flags.</li>
            <li><strong>Tests</strong> — if you provide a test command, it runs and the result is included in the verdict.</li>
            <li><strong>Feature alignment</strong> — available in Pro for deeper review of whether the diff matches what you asked the AI to build.</li>
          </ul>
        </div>

        <div className="modal-section help-modal-section-card">
          <h3>Verdicts</h3>
          <ul className="modal-list">
            <li><strong>No obvious red flags</strong> — free checks did not find obvious risks in the diff.</li>
            <li><strong>Needs review</strong> — something deserves a closer look before committing.</li>
            <li><strong>Risk detected</strong> — a blocking issue was found in the diff or tests.</li>
          </ul>
        </div>

        <div className="modal-section help-modal-section-card">
          <h3>Repair prompt</h3>
          <p className="modal-body-text">
            Every report includes a repair prompt — a plain-language description of what needs to be fixed, written to be pasted directly into Cursor, Claude, or any AI agent. It describes the specific issue found, not just a restatement of your original request.
          </p>
        </div>

        <div className="help-modal-footer">
          <button type="button" className="primary-purple" onClick={onClose}>
            Got it
          </button>
        </div>
      </section>
    </div>
  );
}
