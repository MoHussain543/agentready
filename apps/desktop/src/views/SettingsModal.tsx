import { useEffect, useState } from "react";

import type { AppSettings } from "../lib/appSettings";
import { decodeTokenClaims, isTokenExpired } from "../lib/auth";

interface SettingsModalProps {
  settings: AppSettings | null;
  isSaving: boolean;
  error: string | null;
  authToken: string | null;
  onSaveJavaOverride: (value: string | null) => Promise<void>;
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onClose: () => void;
}

export function SettingsModal({
  settings,
  isSaving,
  error,
  authToken,
  onSaveJavaOverride,
  onSignIn,
  onSignOut,
  onClose,
}: SettingsModalProps) {
  const [javaOverride, setJavaOverride] = useState(settings?.javaBinaryOverride ?? "");

  useEffect(() => {
    setJavaOverride(settings?.javaBinaryOverride ?? "");
  }, [settings]);

  const claims = authToken ? decodeTokenClaims(authToken) : null;
  const expired = claims ? isTokenExpired(claims) : false;
  const isPro = claims?.pro === true && !expired;
  const isSignedIn = authToken !== null && !expired;

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="card-header">
          <div>
            <p className="eyebrow">Settings</p>
            <h2 id="settings-modal-title">Desktop settings</h2>
          </div>
          <button type="button" className="secondary" onClick={onClose}>
            Close
          </button>
        </div>

        {error && (
          <div className="error-banner" role="alert">
            <strong>Could not save settings</strong>
            <p>{error}</p>
          </div>
        )}

        <div className="modal-section">
          <h3>Account</h3>
          {isSignedIn ? (
            <>
              <p className="hint">
                {isPro
                  ? "Pro plan active — AI alignment review is enabled on every check."
                  : "Free plan — upgrade at agentreadyai.dev to enable AI alignment review."}
              </p>
              <div className="actions">
                <span className={`badge ${isPro ? "badge-pro" : "badge-free"}`}>
                  {isPro ? "PRO" : "FREE"}
                </span>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => void onSignOut()}
                >
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="hint">
                {expired
                  ? "Your session has expired. Sign in again to re-enable AI alignment review."
                  : "Sign in to enable AI alignment review on every check."}
              </p>
              <div className="actions">
                <button
                  type="button"
                  className="primary-purple"
                  onClick={() => void onSignIn()}
                >
                  Sign in to AgentReady
                </button>
              </div>
            </>
          )}
        </div>

        <div className="modal-section">
          <h3>Java binary override</h3>
          <p className="hint">
            If AgentReady cannot find Java on your machine, set the full path to the <code>java</code> binary here.
          </p>

          <label className="field">
            <span>Java binary path</span>
            <input
              type="text"
              value={javaOverride}
              placeholder="/Library/Java/JavaVirtualMachines/.../bin/java"
              disabled={isSaving}
              onChange={(event) => setJavaOverride(event.target.value)}
            />
          </label>

          <div className="actions">
            <button
              type="button"
              className="secondary"
              disabled={isSaving}
              onClick={() => {
                void onSaveJavaOverride(null);
              }}
            >
              Clear override
            </button>
            <button
              type="button"
              className="primary-purple"
              disabled={isSaving}
              onClick={() => {
                void onSaveJavaOverride(javaOverride);
              }}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        <div className="modal-section">
          <h3>About</h3>
          <p className="meta">AgentReady desktop {settings?.appVersion ?? "0.1.0"}</p>
        </div>
      </section>
    </div>
  );
}
