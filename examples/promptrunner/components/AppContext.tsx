import {
  AppState,
  AppStateCtx,
  Attempt,
  LeaderboardEntry,
  PromptRequest,
  PromptResponse,
} from "@/interfaces/game";
import React, {
  createContext,
  useState,
  FC,
  ReactNode,
  useEffect,
  useRef,
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
    entries: [] as LeaderboardEntry[],
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

  function getLocalUserId(): string {
    const uid = localStorage.getItem("uid");
    if (!uid) {
      const userId = uuidv4();
      localStorage.setItem("uid", userId);
      return userId;
    }

    return uid;
  }

  const refreshAppState = async () => {
    // log to console that we are refreshing at current timestamp
    console.log("refreshing app state at", new Date().toLocaleTimeString());
    try {
      const uid = getLocalUserId();
      const response = await fetch("/api/game", {
        headers: { "X-Uid": uid },
      });
      const data = (await response.json()) as AppState;

      if (!data.gameState.character.response) {
        data.gameState.character.response =
          appState.gameState.character.response;
      }

      setAppState(data);
    } catch (error) {
      console.error(error);
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
