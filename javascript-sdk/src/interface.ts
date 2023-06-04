export interface DetectRequest {
  userInput: string;
  userInputBase64?: string;
  runHeuristicCheck: boolean;
  runVectorCheck: boolean;
  runLanguageModelCheck: boolean;
  maxHeuristicScore: number;
  maxModelScore: number;
  maxVectorScore: number;
}

export interface DetectResponse {
  heuristicScore: number;
  modelScore: number;
  vectorScore: Record<string, number>;
  runHeuristicCheck: boolean;
  runVectorCheck: boolean;
  runLanguageModelCheck: boolean;
  maxHeuristicScore: number;
  maxVectorScore: number;
  maxModelScore: number;
  injectionDetected: boolean;
}

export class RebuffError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RebuffError";
  }
}

export interface Rebuff {
  detectInjection(request: DetectRequest): Promise<DetectResponse>;

  addCanaryWord(
    prompt: string,
    canaryWord?: string,
    canaryFormat?: string
  ): [string, string];

  isCanaryWordLeaked(
    userInput: string,
    completion: string,
    canaryWord: string,
    logOutcome?: boolean
  ): boolean;

  logLeakage(input: string, metaData: Record<string, string>): Promise<void>;
}
