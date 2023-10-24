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
