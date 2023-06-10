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
import { v4 as uuidv4 } from "uuid";

export const initState = {
  promptLoading: false,
  attempts: [] as Attempt[],
  gameState: {
    level: 1,
    attempts: 0,
    character: {
      name: "Chad",
      image: "tech_bro_2.png",
      response: "I'm not telling you my password!",
    },
  },
  leaderboardState: {
    entries: [
      {
        id: 1,
        name: "John Doe",
        level: 2,
        date: "12/12/2023",
        attempts: 11,
      },
      {
        id: 2,
        name: "Jane Doe",
        level: 4,
        date: "12/11/2023",
        attempts: 12,
      },
    ],
  },
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

  function getLocalUserId(): string {
    const uid = localStorage.getItem("uid");
    if (!uid) {
      const userId = uuidv4();
      localStorage.setItem("uid", userId);
      return userId;
    }

    return uid;
  }

  useEffect(() => {
    getLocalUserId();

    refreshGameState();
    refreshLeaderboardState();
    refreshPlayerEventsState();
  }, []);

  const refreshAppState = async () => {
    // setAccountLoading(true);
    try {
      const uid = getLocalUserId();
      const response = await fetch("/api/game", {
        headers: { "X-Uid": uid },
      });
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
      const uid = getLocalUserId();
      const response = await fetch("/api/game", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Uid": uid,
        },
        body,
      });

      const appState = (await response.json()) as AppState;
      setAppState(appState);
    } catch (error: any) {
      console.error(error);
    } finally {
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
