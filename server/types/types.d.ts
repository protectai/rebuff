export interface ApiFailureResponse {
  error: string;
  message: string;
}

export interface LogApiRequest {
  user_input: string;
  completion: string;
  canaryWord: string;
}

export interface LogApiSuccessResponse {
  success: boolean;
}

export interface PromptResponse {
  canary_word: string;
  canary_word_leaked: boolean;
  breach: boolean;
  output: string;
  detection: DetectResponse;
}

export interface DetectResponse {
  tacticResults: TacticResult[];
  injectionDetected: boolean;
}

export interface TacticResult {
  name: string;
  score: number;
  detected: boolean;
  threshold: number;
  additionalFields: Record<string, any>;
}

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
  tacticOverrides: TacticOverride[];
}

export interface TacticOverride {
  name: string;
  threshold?: number;
  run?: boolean;
}

export interface Attempt extends PromptResponse {
  timestamp: Date;
  input: string;
  error: Error | null;
}
