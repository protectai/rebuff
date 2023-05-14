import React from "react";
import { DetectApiSuccessResponse } from "@/lib/rebuff";
import { PromptResponse } from "@/lib/playground";

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
  credits: number;
  stats: GlobalStats;
}
export interface AppStateCtx {
  appState: AppState;
  promptLoading: boolean;
  accountLoading: boolean;
  attempts: Attempt[];
  refreshAppState: () => Promise<void>;
  refreshApikey: () => Promise<void>;
  submitPrompt: (prompt: PromptRequest) => Promise<void>;
  setPromptLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface PromptRequest {
  userInput: string;
  runHeuristicCheck: boolean;
  runVectorCheck: boolean;
  runLanguageModelCheck: boolean;
}

export interface Attempt extends PromptResponse {
  timestamp: Date;
  input: string;
  error: Error | null;
}
