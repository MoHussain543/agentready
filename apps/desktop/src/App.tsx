import { useState } from "react";
import { buildMockReport } from "./mocks/readinessReport";
import type { AppScreen, AppState, FeatureSessionInput } from "./types";
import { RepoSelectionView } from "./views/RepoSelectionView";
import { ResultsView } from "./views/ResultsView";
import { StartSessionView } from "./views/StartSessionView";

const INITIAL_SESSION: FeatureSessionInput = {
  title: "",
  description: "",
};

function App() {
  const [state, setState] = useState<AppState>({
    screen: "repo",
    repoPath: "",
    session: INITIAL_SESSION,
    report: null,
  });

  const goTo = (screen: AppScreen) => {
    setState((current) => ({ ...current, screen }));
  };

  const handleRunCheck = () => {
    const trimmedRepoPath = state.repoPath.trim();
    const report = buildMockReport(trimmedRepoPath, state.session);
    setState((current) => ({
      ...current,
      repoPath: trimmedRepoPath,
      screen: "results",
      report,
    }));
  };

  const handleRerun = () => {
    const trimmedRepoPath = state.repoPath.trim();
    const report = buildMockReport(trimmedRepoPath, state.session);
    setState((current) => ({ ...current, repoPath: trimmedRepoPath, report }));
  };

  return (
    <main className="app">
      {state.screen === "repo" && (
        <RepoSelectionView
          repoPath={state.repoPath}
          onRepoPathChange={(repoPath) =>
            setState((current) => ({ ...current, repoPath }))
          }
          onContinue={() => goTo("session")}
        />
      )}

      {state.screen === "session" && (
        <StartSessionView
          repoPath={state.repoPath}
          session={state.session}
          onSessionChange={(session) =>
            setState((current) => ({ ...current, session }))
          }
          onBack={() => goTo("repo")}
          onRunCheck={handleRunCheck}
        />
      )}

      {state.screen === "results" && state.report && (
        <ResultsView
          repoPath={state.repoPath}
          session={state.session}
          report={state.report}
          onBack={() => goTo("session")}
          onRerun={handleRerun}
        />
      )}
    </main>
  );
}

export default App;
