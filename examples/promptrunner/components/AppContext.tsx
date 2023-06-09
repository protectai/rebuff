import {
  AppState,
  AppStateCtx,
  Attempt,
  PromptRequest,
  PromptResponse,
} from "@/interfaces/game";
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

export const initState = {
  promptLoading: false,
  attempts: [] as Attempt[],
  gameState: {
    level: 1,
    attempts: 0,
    character: {
      name: "",
      image: "",
      response: "",
    },
  },
  leaderboardState: {},
  playersEventState: {},
};

// Create a context object
export const AppContext = createContext<AppStateCtx>({
  appState: initState,
  promptLoading: false,
  refreshAppState: async () => undefined,
  submitPrompt: async (prompt: PromptRequest) => undefined,
  setPromptLoading: () => null,
});

// Create a provider component
export const AppProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [appState, setAppState] = useState<AppState>(initState);
  const [promptLoading, setPromptLoading] = useState<boolean>(false);
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

  useEffect(() => {
    refreshGameState();
    refreshLeaderboardState();
    refreshPlayerEventsState();
  }, []);

  const refreshAppState = async () => {
    // setAccountLoading(true);
    try {
      const response = await fetch("/api/appstate");
      const data = (await response.json()) as AppState;
      setAppState(data);
    } catch (error) {
      console.error(error);
    } finally {
      // setAccountLoading(false);
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
        is_injection = false,
        output = "",
        breach = false,
        canary_word = "",
        canary_word_leaked,
      } = data;

      setAttempts((prev) => [
        {
          error: null,
          timestamp: new Date(),
          input: prompt.userInput || "",
          breach,
          is_injection,
          output: output || "",
          canary_word,
          canary_word_leaked,
        },
        ...prev,
      ]);
    } catch (error: any) {
      console.error(error);
    } finally {
      await refreshGameState();
      await refreshLeaderboardState();
      await refreshPlayerEventsState();
      setPromptLoading(false);
    }
  };

  const setCredits = (credits: number) => {
    setAppState((prev) => ({ ...prev, credits: credits }));
  };

  const refreshGameState = async () => {
    // ...
    // Fetch gameState from server and update local state with setGameState
  };

  const refreshLeaderboardState = async () => {
    // ...
    // Fetch leaderboardState from server and update local state with setLeaderboardState
  };

  const refreshPlayerEventsState = async () => {
    // ...
    // Fetch playerEventsState from server and update local state with setPlayerEventsState
  };

  return (
    <AppContext.Provider
      value={{
        appState,
        promptLoading: promptLoading,
        refreshAppState,
        submitPrompt,
        setPromptLoading: setPromptLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
