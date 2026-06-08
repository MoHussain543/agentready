import homeLogo from "../assets/agentready-glyph.png";

interface WelcomeViewProps {
  onSignIn: () => void;
}

export function WelcomeView({ onSignIn }: WelcomeViewProps) {
  return (
    <div className="welcome-view">
      <div className="welcome-inner">
        <img src={homeLogo} alt="AgentReady" className="welcome-logo" />
        <h1 className="welcome-title">AgentReady</h1>
        <p className="welcome-subtitle">
          Sign in to open a project, run local checks, and review saved history.
        </p>
        <button
          type="button"
          className="primary-purple welcome-signin-btn"
          onClick={onSignIn}
        >
          Sign in to continue
        </button>
        <p className="hint welcome-hint">
          Free checks on every commit. Pro unlocks AI-powered feature alignment review.
        </p>
      </div>
    </div>
  );
}
