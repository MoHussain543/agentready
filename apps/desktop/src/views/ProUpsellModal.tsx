import { invoke } from "@tauri-apps/api/core";

interface ProUpsellModalProps {
  isSignedIn: boolean;
  onClose: () => void;
  onSignIn: () => void;
}

export function ProUpsellModal({ isSignedIn, onClose, onSignIn }: ProUpsellModalProps) {
  const handleUpgrade = async () => {
    try {
      await invoke("open_external_url", { url: "https://agentreadyai.dev/pricing" });
    } catch {
      // fallback — shouldn't happen for https URLs
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card pro-upsell-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="modal-close-button"
          aria-label="Close"
          onClick={onClose}
        >
          ✕
        </button>

        <div className="pro-upsell-header">
          <span className="pro-badge">
            <SparkIcon />
            Pro
          </span>
          <h2>Unlock Pro</h2>
          <p className="pro-upsell-subtitle">
            Advanced tools for teams shipping AI-generated code with confidence.
          </p>
        </div>

        <ul className="pro-upsell-features">
          <li className="pro-upsell-feature">
            <span className="pro-upsell-feature-icon pro-upsell-icon-review">
              <AlignIcon />
            </span>
            <div className="pro-upsell-feature-copy">
              <strong>AI Alignment Review</strong>
              <p>Checks whether the AI's changes actually match what you asked for — catches scope creep, missing pieces, and hallucinated logic.</p>
            </div>
          </li>
          <li className="pro-upsell-feature">
            <span className="pro-upsell-feature-icon pro-upsell-icon-forge">
              <ForgeIcon />
            </span>
            <div className="pro-upsell-feature-copy">
              <strong>AgentForge</strong>
              <p>Generates <code>.cursorrules</code> and <code>AGENTS.md</code> tailored to your detected stack — helps AI agents stay on track from the first prompt.</p>
            </div>
          </li>
          <li className="pro-upsell-feature">
            <span className="pro-upsell-feature-icon pro-upsell-icon-narrator">
              <NarratorIcon />
            </span>
            <div className="pro-upsell-feature-copy">
              <strong>AgentNarrator</strong>
              <p>Generates a commit message and PR description from your diff and readiness report — skip the context-switching.</p>
            </div>
          </li>
        </ul>

        <div className="pro-upsell-footer">
          {isSignedIn ? (
            <button
              type="button"
              className="primary-purple pro-upsell-cta"
              onClick={() => void handleUpgrade()}
            >
              Upgrade to Pro
            </button>
          ) : (
            <button
              type="button"
              className="primary-purple pro-upsell-cta"
              onClick={() => { onClose(); onSignIn(); }}
            >
              Sign in to upgrade
            </button>
          )}
          <button
            type="button"
            className="secondary"
            onClick={onClose}
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}

function SparkIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M8 1.8 9.16 5l3.06 1.14L9.16 7.3 8 10.5 6.84 7.3 3.78 6.14 6.84 5z"
        fill="currentColor"
      />
    </svg>
  );
}

function AlignIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 4h12M2 8h8M2 12h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="13" cy="8" r="2" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function ForgeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="9" width="12" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M6 9V6.5a2 2 0 0 1 4 0V9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="8" cy="4.5" r="1.5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function NarratorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 3.5h12v7a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 10.5v-7Z" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 6.5h6M5 9h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
