import { AppState, AppStateCtx, Attempt } from "@/interfaces/ui";
import React, {
  createContext,
  useState,
  FC,
  ReactNode,
  useEffect,
} from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import fetch from "node-fetch";

import { Rebuff } from "@/lib/rebuff";

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
  credits: {
    used: 0,
    total: 0,
  },
  loading: false,
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
  attempts: [] as Attempt[],
  refreshAppState: async () => undefined,
  refreshApikey: async () => undefined,
  submitPrompt: async (
    user_input: string,
    check_heuristic: boolean,
    check_vector: boolean,
    check_llm: boolean
  ) => undefined,
  setLoading: () => null,
});

// Create a provider component
export const AppProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [appState, setAppState] = useState<AppState>(initState);
  const [loading, setLoading] = useState<boolean>(false);
  const [rebuff, setRebuff] = useState<Rebuff | null>(null);
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
    setLoading(true);
    try {
      const response = await fetch("/api/account");
      const data = await response.json();
      setAppState(data);
      refreshRebuff();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const refreshRebuff = () => {
    if (appState.apikey) {
      const rebuff = new Rebuff(appState.apikey, "");
      setRebuff(rebuff);
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
      refreshRebuff();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const submitPrompt = async (
    user_input: string,
    check_heuristic: boolean = true,
    check_vector: boolean = true,
    check_llm: boolean = true
  ) => {
    if (!rebuff) {
      throw new Error("Rebuff not initialized"); //should not happen
    }
    setLoading(true);
    try {
      const [metrics, is_injection] = await rebuff.is_injection_detected(
        user_input,
        0.75,
        0.9,
        0.9,
        check_heuristic,
        check_vector,
        check_llm
      );
      setAttempts((prev) => [
        ...prev,
        {
          timestamp: getHumanFriendlyTimestamp(),
          input: user_input,
          metrics,
          is_injection,
        },
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const setApikey = (apikey: string) => {
    setAppState((prev) => ({ ...prev, apikey: apikey }));
  };
  //TODO: To be implemented
  const setCredits = (credits: { used: number; total: number }) => {
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
