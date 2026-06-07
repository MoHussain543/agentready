interface HelpModalProps {
  onClose: () => void;
}

export function HelpModal({ onClose }: HelpModalProps) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="card-header">
          <div>
            <p className="eyebrow">How it works</p>
            <h2 id="help-modal-title">AgentReady at a glance</h2>
          </div>
          <button type="button" className="secondary" onClick={onClose}>
            Close
          </button>
        </div>

        <p className="subtitle">
          AgentReady verifies AI-generated code before you commit by checking the current diff, the original request, and optional local tests.
        </p>

        <div className="modal-section">
          <h3>Core flow</h3>
          <ol className="modal-list">
            <li>Open a local git repository.</li>
            <li>Describe what you asked the AI to build.</li>
            <li>Run a readiness check before committing the diff.</li>
          </ol>
        </div>

        <div className="modal-section">
          <h3>Verdicts</h3>
          <ul className="modal-list">
            <li><strong>Ready to commit</strong> means the baseline checks passed.</li>
            <li><strong>Needs review</strong> means something should be inspected before committing.</li>
            <li><strong>Not ready</strong> means a blocking issue was found.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
