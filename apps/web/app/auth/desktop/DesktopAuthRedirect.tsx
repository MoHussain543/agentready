"use client";

import { useEffect, useState } from "react";

export function DesktopAuthRedirect({ code }: { code: string }) {
  const [redirected, setRedirected] = useState(false);
  const deepLinkUrl = `agentready://auth?code=${code}`;

  useEffect(() => {
    window.location.href = deepLinkUrl;
    setRedirected(true);
  }, [deepLinkUrl]);

  return (
    <div className="min-h-screen bg-[#09090d] text-[#edf2ff] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="w-12 h-12 rounded-2xl bg-brand-600/15 border border-brand-600/25 flex items-center justify-center mx-auto mb-6">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-brand-400">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          {redirected ? "Opening AgentReady…" : "Signing you in…"}
        </h1>
        <p className="text-[#9aa5c4] text-sm mb-8">
          If the app doesn&apos;t open automatically, click the button below.
        </p>
        <a
          href={deepLinkUrl}
          className="inline-flex items-center px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold transition-colors"
        >
          Open AgentReady
        </a>
        <p className="text-[#9aa5c4] text-xs mt-6">
          You can close this tab after the app opens.
        </p>
      </div>
    </div>
  );
}
