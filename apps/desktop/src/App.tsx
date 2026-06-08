import { useEffect, useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { listen } from "@tauri-apps/api/event";

import { loadAppSettings, saveAppSettings, type AppSettings } from "./lib/appSettings";
import { getAuthToken, clearAuthToken, openSignIn } from "./lib/auth";
import { buildFeatureSpec, sessionInputFromSpec } from "./lib/featureSpec";
import {
  loadRecentProjects,
  projectsWithReports,
  syncRecentProjectFromSession,
  type RecentProjectEntry,
} from "./lib/recentProjects";
import { runReadinessCheck } from "./lib/readiness";
import {
  deleteReport,
  initRepoStorage,
  listReports,
  loadLatestReport,
  loadReportByPath,
  saveFeatureSession,
  saveReport,
  setTestCommand,
} from "./lib/storage";
import type { AppScreen, AppState, FeatureSessionInput } from "./types";
import type { ReportHistoryEntry } from "./lib/storage";
import { HelpModal } from "./views/HelpModal";
import { HomeView } from "./views/HomeView";
import { ReportsView } from "./views/ReportsView";
import { ResultsView } from "./views/ResultsView";
import { SettingsModal } from "./views/SettingsModal";
import { StartSessionView } from "./views/StartSessionView";

const INITIAL_SESSION: FeatureSessionInput = {
  title: "",
  description: "",
};

type ResultsBackTarget = "session" | "reports";

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function friendlyRepoError(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes("not a git repository")) {
    return "That folder isn't a git repository. Select the root folder of a project that uses git.";
  }
  if (lower.includes("does not exist")) {
    return "That path doesn't exist. Check the folder path or choose a different project.";
  }
  if (lower.includes("permission denied") || lower.includes("access denied")) {
    return "AgentReady doesn't have permission to read that folder.";
  }
  return raw;
}

function App() {
  const [state, setState] = useState<AppState>({
    screen: "home",
    repoPath: "",
    session: INITIAL_SESSION,
    featureSpec: null,
    currentSession: null,
    report: null,
    isLatestReport: false,
    history: [],
    testCommand: "",
    testCommandCwd: "",
    runTests: false,
  });
  const [recentProjects, setRecentProjects] = useState<RecentProjectEntry[]>(
    () => loadRecentProjects(),
  );
  const [reportBrowserProject, setReportBrowserProject] =
    useState<RecentProjectEntry | null>(null);
  const [reportBrowserEntries, setReportBrowserEntries] = useState<
    ReportHistoryEntry[]
  >([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [resultsBackTarget, setResultsBackTarget] =
    useState<ResultsBackTarget>("session");
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    void loadAppSettings()
      .then(setAppSettings)
      .catch(() => {
        // Keep the home screen usable even if the settings file is unavailable.
      });

    void getAuthToken().then(setAuthToken).catch(() => null);

    // Rust emits this event after saving the token (via HTTP callback or deep link)
    const unlistenPromise = listen("auth-token-saved", () => {
      void getAuthToken().then(setAuthToken);
    });
    return () => { void unlistenPromise.then((fn) => fn()); };
  }, []);

  const versionLabel = `v${appSettings?.appVersion ?? "0.1.0"}`;

  const goTo = (screen: AppScreen) => {
    setState((current) => ({ ...current, screen }));
  };

  const refreshRecentProjects = () => {
    setRecentProjects(loadRecentProjects());
  };

  const rememberRepo = (repoPath: string, latestSession: AppState["currentSession"]) => {
    syncRecentProjectFromSession(repoPath, latestSession);
    refreshRecentProjects();
  };

  const loadHistory = async (
    repoPath: string,
  ): Promise<ReportHistoryEntry[]> => {
    try {
      return await listReports(repoPath);
    } catch {
      return [];
    }
  };

  const openRepo = async (repoPath: string) => {
    const trimmedRepoPath = repoPath.trim();
    if (!trimmedRepoPath) {
      return;
    }

    setIsBusy(true);
    setError(null);

    try {
      const repoState = await initRepoStorage(trimmedRepoPath);
      const hydratedSession = repoState.featureSpec
        ? sessionInputFromSpec(repoState.featureSpec)
        : state.session;
      const history = await loadHistory(trimmedRepoPath);

      setState((current) => ({
        ...current,
        screen: "session",
        repoPath: trimmedRepoPath,
        session: hydratedSession,
        featureSpec: repoState.featureSpec,
        currentSession: repoState.session,
        report: repoState.latestReport,
        isLatestReport: repoState.latestReport !== null,
        history,
        testCommand: repoState.session.testCommand ?? "",
        testCommandCwd: repoState.session.testCommandCwd ?? "",
      }));
      rememberRepo(trimmedRepoPath, repoState.session);
    } catch (initError) {
      setError(
        friendlyRepoError(
          errorMessage(initError, "Failed to initialize AgentReady storage."),
        ),
      );
    } finally {
      setIsBusy(false);
    }
  };

  const handleOpenProject = async () => {
    try {
      const selected = await open({ directory: true, multiple: false });
      if (typeof selected === "string") {
        await openRepo(selected);
      }
    } catch {
      // Leave the home screen as-is if the native picker is unavailable.
    }
  };

  const runCheck = async (navigateToResults: boolean) => {
    const trimmedRepoPath = state.repoPath.trim();
    const featureSpec = buildFeatureSpec(state.session, state.featureSpec);
    const trimmedTestCommand = state.testCommand.trim();
    const trimmedTestCommandCwd = state.testCommandCwd.trim();
    setIsRunning(true);
    setError(null);

    try {
      const repoState = await saveFeatureSession(trimmedRepoPath, featureSpec);
      await setTestCommand(
        trimmedRepoPath,
        trimmedTestCommand || null,
        trimmedTestCommandCwd || null,
      );

      const report = await runReadinessCheck(
        trimmedRepoPath,
        state.session,
        featureSpec,
        {
          runTests: state.runTests,
          testCommand: trimmedTestCommand || null,
          testCommandCwd: trimmedTestCommandCwd || null,
        },
      );

      let currentSession = repoState.session;
      let history = state.history;
      let persistenceWarning: string | null = null;
      try {
        currentSession = await saveReport(trimmedRepoPath, report);
        history = await loadHistory(trimmedRepoPath);
      } catch (recordError) {
        persistenceWarning = errorMessage(
          recordError,
          "Readiness check completed, but the report could not be saved locally.",
        );
      }

      setError(persistenceWarning);
      setResultsBackTarget("session");
      setState((current) => ({
        ...current,
        repoPath: trimmedRepoPath,
        featureSpec,
        currentSession,
        report,
        isLatestReport: true,
        history,
        screen: navigateToResults ? "results" : current.screen,
      }));
      rememberRepo(trimmedRepoPath, currentSession);
    } catch (checkError) {
      setError(errorMessage(checkError, "Readiness check failed."));
    } finally {
      setIsRunning(false);
    }
  };

  const handleBrowseProjectsWithReports = () => {
    setError(null);
    setReportBrowserProject(null);
    setReportBrowserEntries([]);
    goTo("reports");
  };

  const handleSelectReportProject = async (project: RecentProjectEntry) => {
    setIsBusy(true);
    setError(null);
    try {
      const reports = await listReports(project.repoPath);
      setReportBrowserProject(project);
      setReportBrowserEntries(reports);
    } catch (loadError) {
      setError(errorMessage(loadError, "Failed to load saved reports."));
    } finally {
      setIsBusy(false);
    }
  };

  const handleOpenSavedReport = async (project: RecentProjectEntry, entry: ReportHistoryEntry) => {
    setIsBusy(true);
    setError(null);
    try {
      const repoState = await initRepoStorage(project.repoPath);
      const report = await loadReportByPath(project.repoPath, entry.path);
      const history = await loadHistory(project.repoPath);
      const hydratedSession = repoState.featureSpec
        ? sessionInputFromSpec(repoState.featureSpec)
        : INITIAL_SESSION;

      setResultsBackTarget("reports");
      setState((current) => ({
        ...current,
        screen: "results",
        repoPath: project.repoPath,
        session: hydratedSession,
        featureSpec: repoState.featureSpec,
        currentSession: repoState.session,
        report,
        isLatestReport: repoState.session.latestReportPath === entry.path,
        history,
        testCommand: repoState.session.testCommand ?? "",
        testCommandCwd: repoState.session.testCommandCwd ?? "",
      }));
      rememberRepo(project.repoPath, repoState.session);
    } catch (loadError) {
      setError(errorMessage(loadError, "Failed to open the saved report."));
    } finally {
      setIsBusy(false);
    }
  };

  const handleDeleteReport = async (entry: ReportHistoryEntry) => {
    if (!reportBrowserProject) return;
    setIsBusy(true);
    setError(null);
    try {
      await deleteReport(reportBrowserProject.repoPath, entry.path);
      const updated = await listReports(reportBrowserProject.repoPath);
      const repoState = await initRepoStorage(reportBrowserProject.repoPath);
      setReportBrowserEntries(updated);
      rememberRepo(reportBrowserProject.repoPath, repoState.session);
      setReportBrowserProject((current) =>
        current
          ? {
              ...current,
              latestVerdict: repoState.session.latestReportVerdict as RecentProjectEntry["latestVerdict"],
              latestReportPath: repoState.session.latestReportPath,
              reportHistoryCount: repoState.session.reportHistoryCount,
              lastCheckedAt: repoState.session.lastReadinessRunAt,
              lastOpenedAt: repoState.session.lastAccessedAt,
            }
          : current,
      );
      // If the user had been viewing this exact report in results, clear it so
      // back-navigation does not silently render a deleted report's data.
      if (resultsBackTarget === "reports" && state.report?.generatedAt === entry.generatedAt) {
        setState((current) => ({ ...current, report: null }));
      }
    } catch (deleteError) {
      setError(errorMessage(deleteError, "Failed to delete the report."));
    } finally {
      setIsBusy(false);
    }
  };

  const handleSignIn = async () => {
    await openSignIn();
  };

  const handleSignOut = async () => {
    await clearAuthToken();
    setAuthToken(null);
  };

  const handleSaveSettings = async (javaBinaryOverride: string | null) => {
    setIsSavingSettings(true);
    setSettingsError(null);
    try {
      const next = await saveAppSettings(javaBinaryOverride);
      setAppSettings(next);
    } catch (saveError) {
      setSettingsError(errorMessage(saveError, "Failed to save desktop settings."));
    } finally {
      setIsSavingSettings(false);
    }
  };

  return (
    <main className="app">
      {state.screen === "home" && (
        <HomeView
          recentProjects={recentProjects}
          versionLabel={versionLabel}
          isBusy={isBusy}
          error={error}
          onOpenProject={handleOpenProject}
          onOpenRecentProject={(repoPath) => void openRepo(repoPath)}
          onViewSavedReports={handleBrowseProjectsWithReports}
          onOpenHelp={() => setIsHelpOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}

      {state.screen === "reports" && (
        <ReportsView
          projects={projectsWithReports(recentProjects)}
          selectedProject={reportBrowserProject}
          reports={reportBrowserEntries}
          isBusy={isBusy}
          error={error}
          onBackHome={() => {
            setError(null);
            goTo("home");
          }}
          onSelectProject={(project) => void handleSelectReportProject(project)}
          onBackToProjects={() => {
            setError(null);
            setReportBrowserProject(null);
            setReportBrowserEntries([]);
          }}
          onOpenReport={(entry) => {
            if (reportBrowserProject) {
              void handleOpenSavedReport(reportBrowserProject, entry);
            }
          }}
          onDeleteReport={(entry) => void handleDeleteReport(entry)}
        />
      )}

      {state.screen === "session" && (
        <StartSessionView
          repoPath={state.repoPath}
          session={state.session}
          testCommand={state.testCommand}
          testCommandCwd={state.testCommandCwd}
          runTests={state.runTests}
          latestSession={state.currentSession}
          hasLatestReport={state.report !== null}
          isRunning={isRunning}
          error={error}
          onSessionChange={(session) =>
            setState((current) => ({ ...current, session }))
          }
          onTestCommandChange={(testCommand) =>
            setState((current) => ({ ...current, testCommand }))
          }
          onTestCommandCwdChange={(testCommandCwd) =>
            setState((current) => ({ ...current, testCommandCwd }))
          }
          onRunTestsChange={(runTests) =>
            setState((current) => ({ ...current, runTests }))
          }
          onViewLatest={async () => {
            setError(null);
            try {
              const latestReport = await loadLatestReport(state.repoPath);
              if (!latestReport) {
                setError("No saved report is available for this repository yet.");
                return;
              }
              setResultsBackTarget("session");
              setState((current) => ({
                ...current,
                report: latestReport,
                screen: "results",
                isLatestReport: true,
              }));
            } catch (loadError) {
              setError(
                errorMessage(loadError, "Failed to load the latest saved report."),
              );
            }
          }}
          onBack={() => {
            setError(null);
            goTo("home");
          }}
          onRunCheck={() => void runCheck(true)}
        />
      )}

      {state.screen === "results" && state.report && (
        <ResultsView
          repoPath={state.repoPath}
          session={state.session}
          report={state.report}
          isLatestReport={state.isLatestReport}
          latestReportPath={state.currentSession?.latestReportPath ?? null}
          isRunning={isRunning}
          error={error}
          onBack={() => {
            setError(null);
            goTo(resultsBackTarget);
          }}
          onRerun={() => void runCheck(false)}
        />
      )}

      {isHelpOpen && <HelpModal onClose={() => setIsHelpOpen(false)} />}

      {isSettingsOpen && (
        <SettingsModal
          settings={appSettings}
          isSaving={isSavingSettings}
          error={settingsError}
          authToken={authToken}
          onSaveJavaOverride={handleSaveSettings}
          onSignIn={handleSignIn}
          onSignOut={handleSignOut}
          onClose={() => {
            setSettingsError(null);
            setIsSettingsOpen(false);
          }}
        />
      )}
    </main>
  );
}

export default App;
