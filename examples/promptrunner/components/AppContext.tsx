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
    username: "",
    level: 0,
    attempts: 0,
    character: {
      name: "",
      image: "",
      response: "",
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
  firstLoad: false,
  promptRequested: false,
  refreshAppState: async () => undefined,
  submitPrompt: async (prompt: PromptRequest) => undefined,
  submitPassword: async (password: string) => undefined,
  setPromptLoading: () => null,
});

// Create a provider component
export const AppProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [appState, setAppState] = useState<AppState>(initState);
  const [promptLoading, setPromptLoading] = useState<boolean>(false);
  const [firstLoad, setFirstLoad] = useState<boolean>(true);
  const [promptRequested, setPromptRequested] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<Attempt[]>([] as Attempt[]);
  const session = useSession();
  const supabase = useSupabaseClient();

  useEffect(() => {
    refreshAppState();
  }, []);

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
      setFirstLoad(false);
      console.error(error);
    }
  };

  const submitPrompt = async (prompt: PromptRequest) => {
    setPromptLoading(true);
    setPromptRequested(true);
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

  const submitPassword = async (password: string) => {
    try {
      try {
        const uid = getLocalUserId();
        const response = await fetch("/api/password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Uid": uid,
          },
          body: JSON.stringify({ password }),
        });

        if (response.status === 200) {
          window.location.reload();
        }
        if (response.status === 400) {
          window.alert("Incorrect password!");
        }
      } catch (error) {
        console.error(error);
        window.alert("An error occurred submitting your password!");
      }
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
        promptRequested: promptRequested,
        refreshAppState,
        submitPrompt,
        submitPassword,
        setPromptLoading: setPromptLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
