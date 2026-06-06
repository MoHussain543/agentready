import { useState } from "react";
import { buildFeatureSpec, sessionInputFromSpec } from "./lib/featureSpec";
import { runReadinessCheck } from "./lib/readiness";
import {
  initRepoStorage,
  recordReadinessRun,
  saveFeatureSession,
  setTestCommand,
} from "./lib/storage";
import type { AppScreen, AppState, FeatureSessionInput } from "./types";
import { RepoSelectionView } from "./views/RepoSelectionView";
import { ResultsView } from "./views/ResultsView";
import { StartSessionView } from "./views/StartSessionView";

const INITIAL_SESSION: FeatureSessionInput = {
  title: "",
  description: "",
};

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function App() {
  const [state, setState] = useState<AppState>({
    screen: "repo",
    repoPath: "",
    session: INITIAL_SESSION,
    featureSpec: null,
    currentSession: null,
    report: null,
    testCommand: "",
    runTests: false,
  });
  const [isRunning, setIsRunning] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goTo = (screen: AppScreen) => {
    setState((current) => ({ ...current, screen }));
  };

  const handleContinue = async () => {
    const trimmedRepoPath = state.repoPath.trim();
    setIsBusy(true);
    setError(null);

    try {
      const repoState = await initRepoStorage(trimmedRepoPath);
      const hydratedSession = repoState.featureSpec
        ? sessionInputFromSpec(repoState.featureSpec)
        : state.session;

      setState((current) => ({
        ...current,
        repoPath: trimmedRepoPath,
        session: hydratedSession,
        featureSpec: repoState.featureSpec,
        currentSession: repoState.session,
        testCommand: repoState.session.testCommand ?? "",
        screen: "session",
      }));
    } catch (initError) {
      setError(
        errorMessage(initError, "Failed to initialize AgentReady storage."),
      );
    } finally {
      setIsBusy(false);
    }
  };

  const runCheck = async (navigateToResults: boolean) => {
    const trimmedRepoPath = state.repoPath.trim();
    const featureSpec = buildFeatureSpec(state.session, state.featureSpec);
    const trimmedTestCommand = state.testCommand.trim();
    setIsRunning(true);
    setError(null);

    try {
      const repoState = await saveFeatureSession(trimmedRepoPath, featureSpec);
      await setTestCommand(trimmedRepoPath, trimmedTestCommand || null);

      const report = await runReadinessCheck(
        trimmedRepoPath,
        state.session,
        featureSpec,
        {
          runTests: state.runTests,
          testCommand: trimmedTestCommand || null,
        },
      );

      let currentSession = repoState.session;
      let persistenceWarning: string | null = null;
      try {
        currentSession = await recordReadinessRun(
          trimmedRepoPath,
          report.verdict,
        );
      } catch (recordError) {
        persistenceWarning = errorMessage(
          recordError,
          "Readiness check completed, but session metadata could not be updated.",
        );
      }

      setError(persistenceWarning);
      setState((current) => ({
        ...current,
        repoPath: trimmedRepoPath,
        featureSpec,
        currentSession,
        report,
        screen: navigateToResults ? "results" : current.screen,
      }));
    } catch (checkError) {
      setError(errorMessage(checkError, "Readiness check failed."));
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <main className="app">
      {state.screen === "repo" && (
        <RepoSelectionView
          repoPath={state.repoPath}
          isBusy={isBusy}
          error={error}
          onRepoPathChange={(repoPath) =>
            setState((current) => ({ ...current, repoPath }))
          }
          onContinue={handleContinue}
        />
      )}

      {state.screen === "session" && (
        <StartSessionView
          repoPath={state.repoPath}
          session={state.session}
          testCommand={state.testCommand}
          runTests={state.runTests}
          isRunning={isRunning}
          error={error}
          onSessionChange={(session) =>
            setState((current) => ({ ...current, session }))
          }
          onTestCommandChange={(testCommand) =>
            setState((current) => ({ ...current, testCommand }))
          }
          onRunTestsChange={(runTests) =>
            setState((current) => ({ ...current, runTests }))
          }
          onBack={() => {
            setError(null);
            goTo("repo");
          }}
          onRunCheck={() => runCheck(true)}
        />
      )}

      {state.screen === "results" && state.report && (
        <ResultsView
          repoPath={state.repoPath}
          session={state.session}
          report={state.report}
          isRunning={isRunning}
          error={error}
          onBack={() => {
            setError(null);
            goTo("session");
          }}
          onRerun={() => runCheck(false)}
        />
      )}
    </main>
  );
}

export default App;
