import { createContext, useState, FC, ReactNode, useEffect } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import {
  DetectResponse,
  PromptResponse,
  AppState,
  AppStateCtx,
  Attempt,
  PromptRequest,
} from "@types";

const initState = {
  apikey: "",
  credits: 0,
  promptLoading: false,
  accountLoading: false,
  stats: {
    breaches: {
      total: 0,
      user: 0,
    },
    detections: 0,
    requests: 0,
  },
} as AppState;
// Create a context object
export const AppContext = createContext<AppStateCtx>({
  appState: initState,
  promptLoading: false,
  accountLoading: false,
  attempts: [] as Attempt[],
  refreshAppState: async () => undefined,
  refreshApikey: async () => undefined,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  submitPrompt: async (prompt: PromptRequest) => undefined,
  setPromptLoading: () => null,
});

// Create a provider component
export const AppProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [appState, setAppState] = useState<AppState>(initState);
  const [promptLoading, setPromptLoading] = useState<boolean>(false);
  const [accountLoading, setAccountLoading] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<Attempt[]>([] as Attempt[]);
  const session = useSession();

  const setApikey = (apikey: string) => {
    setAppState((prev) => ({ ...prev, apikey: apikey }));
  };
  const refreshAppState = async () => {
    setAccountLoading(true);
    try {
      const response = await fetch("/api/account");
      const data = (await response.json()) as AppState;
      setAppState(data);
    } catch (error) {
      console.error(error);
    } finally {
      setAccountLoading(false);
    }
  };
  useEffect(
    function onChange() {
      if (session) {
        refreshAppState();
      }
    },
    [session]
  );
  const setStats = (stats: AppState["stats"]) => {
    setAppState((prev) => ({ ...prev, stats: stats }));
  };
  const refreshStats = async () => {
    setAccountLoading(true);
    try {
      const response = await fetch("/api/account/stats");
      const data = (await response.json()) as AppState["stats"];
      if (!data) return;
      if (
        typeof data?.breaches?.total ??
        (undefined === "number" && typeof data?.breaches?.user) ??
        (undefined === "number" && typeof data?.detections) ??
        (undefined === "number" && typeof data?.requests) ??
        undefined === "number"
      ) {
        setStats(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setAccountLoading(false);
    }
  };
  const refreshApikey = async () => {
    setPromptLoading(true);
    try {
      const response = await fetch("/api/account/apikey", {
        method: "POST",
      });
      const data = await response.json();
      setApikey((data as any).apikey);
    } catch (error) {
      console.error(error);
    } finally {
      setPromptLoading(false);
    }
  };
  const submitPrompt = async (prompt: PromptRequest) => {
    setPromptLoading(true);
    try {
      const body = JSON.stringify(prompt);

      const response = await fetch("/api/playground", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body,
      });

      const data = (await response.json()) as PromptResponse;
      const {
        detection = {
          runHeuristicCheck: false,
          runLanguageModelCheck: false,
          runVectorCheck: false,
          vectorScore: {},
          heuristicScore: 0,
          modelScore: 0,
          maxHeuristicScore: 0,
          maxModelScore: 0,
          maxVectorScore: 0,
          injectionDetected: false,
        } as DetectResponse,
        output = "",
        breach = false,
        // eslint-disable-next-line camelcase, @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars
        canary_word = "",
        // eslint-disable-next-line camelcase, @typescript-eslint/naming-convention
        canary_word_leaked,
      } = data;

      setAttempts((prev) => [
        {
          error: null,
          timestamp: new Date(),
          input: prompt.userInput || "",
          breach,
          detection,
          output: output || "",
          // eslint-disable-next-line camelcase, @typescript-eslint/naming-convention
          canary_word: "",
          // eslint-disable-next-line camelcase, @typescript-eslint/naming-convention
          canary_word_leaked,
        },
        ...prev,
      ]);
    } catch (error: any) {
      setAttempts((prev) => [
        {
          error,
          timestamp: new Date(),
          input: prompt.userInput || "",
          breach: false,
          detection: {
            runHeuristicCheck: false,
            runLanguageModelCheck: false,
            runVectorCheck: false,
            vectorScore: {},
            heuristicScore: 0,
            modelScore: 0,
            maxHeuristicScore: 0,
            maxModelScore: 0,
            maxVectorScore: 0,
            injectionDetected: false,
          },
          output: "",
          // eslint-disable-next-line camelcase, @typescript-eslint/naming-convention
          canary_word: "",
          // eslint-disable-next-line camelcase, @typescript-eslint/naming-convention
          canary_word_leaked: false,
        },
        ...prev,
      ]);
    } finally {
      refreshStats();
      setPromptLoading(false);
    }
  };

  // const setCredits = (credits: number) => {
  //   setAppState((prev) => ({ ...prev, credits: credits }));
  // };

  return (
    <AppContext.Provider
      value={{
        appState,
        promptLoading,
        accountLoading,
        attempts,
        refreshAppState,
        refreshApikey,
        submitPrompt,
        setPromptLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
