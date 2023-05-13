import { AppState, AppStateCtx, Attempt, PromptRequest } from "@/interfaces/ui";
import React, {
  createContext,
  useState,
  FC,
  ReactNode,
  useEffect,
} from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import fetch from "node-fetch";
import { DetectApiSuccessResponse } from "@/lib/rebuff";
import { PromptResponse } from "@/lib/playground";

function getHumanFriendlyTimestamp() {
  const date = new Date();

  // Get the date and time components from the date object
  const year = date.getFullYear();
  const month = date.toLocaleString("default", { month: "long" });
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();

  // Build the timestamp string using the date and time components
  const timestamp = `${month} ${day}, ${year} at ${hours}:${minutes}`;

  return timestamp;
}
const initState = {
  apikey: "",
  credits: 0,
  loading: false,
  accountLoading: false,
  stats: {
    last24h: {
      attempts: 0,
      breaches: 0,
    },
    last7d: {
      attempts: 0,
      breaches: 0,
    },
    alltime: {
      attempts: 0,
      breaches: 0,
    },
  },
} as AppState;
// Create a context object
export const AppContext = createContext<AppStateCtx>({
  appState: initState,
  loading: false,
  accountLoading: false,
  attempts: [] as Attempt[],
  refreshAppState: async () => undefined,
  refreshApikey: async () => undefined,
  submitPrompt: async (prompt: PromptRequest) => undefined,
  setLoading: () => null,
});

//TODO: Delete this once playground.ts is working
async function genRandomResponse(): Promise<PromptResponse> {
  const randomBool = () => Math.random() < 0.5;
  const randomScore = () => Math.random() * 10;
  await new Promise((resolve) => setTimeout(resolve, 2000));
  if (Math.random() < 0.2) {
    throw new Error("Random error");
  }
  return {
    metrics: {
      runHeuristicCheck: randomBool(),
      runLanguageModelCheck: randomBool(),
      runVectorCheck: randomBool(),
      vectorScore: {
        a: 0,
        b: 1,
      },
      heuristicScore: randomScore(),
      modelScore: randomScore(),
      maxHeuristicScore: 0,
      maxModelScore: 0,
      maxVectorScore: 0,
    },
    is_injection: randomBool(),
    llm_query: "query example",
    canary_word: "example",
    canary_word_leaked: randomBool(),
  };
}
// Create a provider component
export const AppProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [appState, setAppState] = useState<AppState>(initState);
  const [loading, setLoading] = useState<boolean>(false);
  const [accountLoading, setAccountLoading] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<Attempt[]>([] as Attempt[]);
  const session = useSession();
  const supabase = useSupabaseClient();
  useEffect(
    function onChange() {
      if (session) {
        refreshAppState();
      }
    },
    [session]
  );
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
  const refreshApikey = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/account/apikey", {
        method: "POST",
      });
      const data = await response.json();
      setApikey(data.apikey);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const submitPrompt = async (prompt: PromptRequest) => {
    setLoading(true);
    try {
      const body = JSON.stringify(prompt);
      // const response = await fetch("/api/playground", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body,
      // });

      // const data = await response.json();
      const data = await genRandomResponse();
      const {
        metrics = {
          runHeuristicCheck: false,
          runLanguageModelCheck: false,
          runVectorCheck: false,
          vectorScore: {},
          heuristicScore: 0,
          modelScore: 0,
          maxHeuristicScore: 0,
          maxModelScore: 0,
          maxVectorScore: 0,
        } as DetectApiSuccessResponse,
        is_injection = false,
        llm_query = "",
        canary_word = "",
        canary_word_leaked,
      } = data;

      setAttempts((prev) => [
        ...prev,
        {
          error: null,
          timestamp: new Date(),
          input: prompt.userInput || "",
          metrics,
          is_injection,
          llm_query: llm_query || "",
          canary_word,
          canary_word_leaked,
        },
      ]);
    } catch (error: any) {
      setAttempts((prev) => [
        ...prev,
        {
          error,
          timestamp: new Date(),
          input: prompt.userInput || "",
          metrics: {
            runHeuristicCheck: false,
            runLanguageModelCheck: false,
            runVectorCheck: false,
            vectorScore: {},
            heuristicScore: 0,
            modelScore: 0,
            maxHeuristicScore: 0,
            maxModelScore: 0,
            maxVectorScore: 0,
          },
          is_injection: false,
          llm_query: "",
          canary_word: "",
          canary_word_leaked: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const setApikey = (apikey: string) => {
    setAppState((prev) => ({ ...prev, apikey: apikey }));
  };

  const setCredits = (credits: number) => {
    setAppState((prev) => ({ ...prev, credits: credits }));
  };

  const setStats = (stats: any) => {
    setAppState((prev) => ({ ...prev, stats: stats }));
  };

  return (
    <AppContext.Provider
      value={{
        appState,
        loading,
        accountLoading,
        attempts,
        refreshAppState,
        refreshApikey,
        submitPrompt,
        setLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
