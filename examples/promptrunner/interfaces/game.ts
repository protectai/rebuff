import React from "react";

export interface AppState {
  gameState: GameState;
  leaderboardState: LeaderboardState;
  playersEventState: PlayersEventState;
  promptLoading: boolean;
}

export interface AppStateCtx {
  appState: AppState;
  promptLoading: boolean;
  promptRequested: boolean;
  refreshAppState: () => Promise<void>;
  submitPrompt: (prompt: PromptRequest) => Promise<void>;
  submitPassword: (password: string) => Promise<void>;
  setPromptLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface GameState {
  username: string;
  level: number;
  attempts: number;
  character: Character;
}

interface Character {
  name: string;
  image: string;
  response: string;
  password: string;
}

export interface LeaderboardState {
  entries: LeaderboardEntry[];
}

export interface LeaderboardEntry {
  name: string;
  attempts: number;
  level: number;
  date: string;
}

export interface PlayersEventState {}

export interface PromptRequest {
  userInput: string;
}

export interface Attempt extends PromptResponse {
  timestamp: Date;
  input: string;
  error: Error | null;
}

export interface PromptResponse {
  canary_word: string;
  canary_word_leaked: boolean;
  breach: boolean;
  is_injection: boolean;
  output: string;
}
