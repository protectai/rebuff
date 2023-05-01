import { AppState } from "@/interfaces/ui";
import React, {
  createContext,
  useState,
  FC,
  ReactNode,
  useEffect,
} from "react";
import {
  Session,
  useSession,
  useSupabaseClient,
} from "@supabase/auth-helpers-react";
import fetch from "node-fetch";
import { DetectApiRequest } from "@/interfaces/api";

interface AppStateCtx {
  appState: AppState;
  loading: boolean;
  refreshAppState: () => Promise<void>;
  refreshApikey: () => Promise<void>;
  submitPrompt: (prompt: DetectApiRequest) => Promise<void>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const initState = {
  attempts: [],
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
  refreshAppState: async () => undefined,
  refreshApikey: async () => undefined,
  submitPrompt: async (req: DetectApiRequest) => undefined,
  setLoading: () => null,
});

// Create a provider component
export const AppProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [appState, setAppState] = useState<AppState>(initState);
  const [loading, setLoading] = useState<boolean>(false);
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
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
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
  const submitPrompt = async (req: DetectApiRequest) => {
    return;
  };

  const setApikey = (apikey: string) => {
    setAppState((prev) => ({ ...prev, apikey: apikey }));
  };
  const setCredits = (credits: { used: number; total: number }) => {
    setAppState((prev) => ({ ...prev, credits: credits }));
  };
  const setAttempts = (attempts: any[]) => {
    setAppState((prev) => ({ ...prev, attempts: attempts }));
  };
  const setStats = (stats: any) => {
    setAppState((prev) => ({ ...prev, stats: stats }));
  };

  return (
    <AppContext.Provider
      value={{
        appState,
        loading,
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
