import { useEffect, useState } from "react";

import type { AppSettings } from "../lib/appSettings";

interface SettingsModalProps {
  settings: AppSettings | null;
  isSaving: boolean;
  error: string | null;
  onSaveJavaOverride: (value: string | null) => Promise<void>;
  onClose: () => void;
}

export function SettingsModal({
  settings,
  isSaving,
  error,
  onSaveJavaOverride,
  onClose,
}: SettingsModalProps) {
  const [javaOverride, setJavaOverride] = useState(settings?.javaBinaryOverride ?? "");

  useEffect(() => {
    setJavaOverride(settings?.javaBinaryOverride ?? "");
  }, [settings]);

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
