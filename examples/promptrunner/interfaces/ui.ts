import React from "react";
import { PromptResponse } from "@/lib/playground";

interface PlaygroundStats {
  breaches: {
    total: number;
    user: number;
  };
  detections: number;
  requests: number;
}

export interface AppState {
  apikey: string;
  credits: number;
  stats: PlaygroundStats;
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
}

export interface Attempt extends PromptResponse {
  timestamp: Date;
  input: string;
  error: Error | null;
}
