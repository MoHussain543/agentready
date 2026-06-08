import sidebarLogo from "../assets/agentready-glyph.png";
import type { AppScreen } from "../types";

function activeSection(screen: AppScreen): "home" | "reports" {
  return screen === "reports" ? "reports" : "home";
}

interface AppSidebarProps {
  screen: AppScreen;
  authToken: string | null;
  isPro: boolean;
  versionLabel: string;
  onNavigateHome: () => void;
  onNavigateReports: () => void;
  onOpenHelp: () => void;
  onOpenSettings: () => void;
  onSignIn: () => void;
}

export function AppSidebar({
  screen,
  authToken,
  isPro,
  versionLabel,
  onNavigateHome,
  onNavigateReports,
  onOpenHelp,
  onOpenSettings,
  onSignIn,
}: AppSidebarProps) {
  const section = activeSection(screen);
  const isSignedIn = authToken !== null;

  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <img src={sidebarLogo} alt="AgentReady" className="sidebar-logo" />
      </div>

      <nav className="sidebar-nav" aria-label="Main navigation">
        <button
          type="button"
          className={`sidebar-nav-item${section === "home" ? " active" : ""}`}
          aria-label="Home"
          onClick={onNavigateHome}
        >
          <HomeIcon />
          <span className="sidebar-nav-label">Home</span>
        </button>
        <button
          type="button"
          className={`sidebar-nav-item${section === "reports" ? " active" : ""}`}
          aria-label="History"
          onClick={onNavigateReports}
        >
          <HistoryIcon />
          <span className="sidebar-nav-label">History</span>
        </button>
      </nav>

      <div className="sidebar-bottom">
        <button
          type="button"
          className="sidebar-nav-item"
          aria-label="Help"
          onClick={onOpenHelp}
        >
          <HelpIcon />
          <span className="sidebar-nav-label">Help</span>
        </button>
        {isSignedIn ? (
          <button
            type="button"
            className="sidebar-nav-item sidebar-account-btn"
            aria-label="Account & Settings"
            onClick={onOpenSettings}
          >
            <AccountIcon />
            <span
              className={`sidebar-account-dot ${isPro ? "sidebar-account-dot-pro" : "sidebar-account-dot-free"}`}
              aria-hidden="true"
            />
            <span className="sidebar-nav-label">Account</span>
          </button>
        ) : (
          <button
            type="button"
            className="sidebar-nav-item sidebar-signin-btn"
            aria-label="Sign in"
            onClick={onSignIn}
          >
            <SignInIcon />
            <span className="sidebar-nav-label">Sign in</span>
          </button>
        )}
        <span className="sidebar-version">{versionLabel}</span>
      </div>
    </aside>
  );
}

function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M3.75 7.7 9 3.75l5.25 3.95v5.4a.9.9 0 0 1-.9.9h-2.6V10a.75.75 0 0 0-.75-.75h-2a.75.75 0 0 0-.75.75v4H4.65a.9.9 0 0 1-.9-.9V7.7Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M9 6.5v2.75l1.75 1.75"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M6.8 6.1a1.7 1.7 0 1 1 2.1 1.64c-.58.18-.9.55-.9 1.06v.24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="8" cy="11.8" r=".7" fill="currentColor" />
      <circle cx="8" cy="8" r="6.1" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function AccountIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M3 16c0-3.314 2.686-5 6-5s6 1.686 6 5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SignInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M7 3.5H4a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h3"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M12 12.5l3-3.5-3-3.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M15 9H7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
