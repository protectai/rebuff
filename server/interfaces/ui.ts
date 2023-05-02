import React from "react";
import { DetectApiSuccessResponse } from "@/lib/rebuff";

interface stat {
  breaches: number;
  attempts: number;
}
export interface GlobalStats {
  last24h: stat;
  last7d: stat;
  alltime: stat;
}

export interface AppState {
  apikey: string;
  credits: {
    total: number;
    used: number;
  };
  stats: GlobalStats;
}
export interface AppStateCtx {
  appState: AppState;
  loading: boolean;
  attempts: Attempt[];
  refreshAppState: () => Promise<void>;
  refreshApikey: () => Promise<void>;
  submitPrompt: (
    user_input: string,
    check_heuristic: boolean,
    check_vector: boolean,
    check_llm: boolean
  ) => Promise<void>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}
export interface Attempt {
  timestamp: string;
  input: string;
  metrics: DetectApiSuccessResponse;
  is_injection: boolean;
}
