export interface DetectApiRequest {
  input_base64: string;
  runHeuristicCheck: boolean;
  runVectorCheck: boolean;
  runLanguageModelCheck: boolean;
  maxHeuristicScore: number;
  maxModelScore: number;
  maxVectorScore: number;
}

export interface DetectApiSuccessResponse {
  heuristicScore: number;
  modelScore: number;
  vectorScore: Record<string, number>;
  runHeuristicCheck: boolean;
  runVectorCheck: boolean;
  runLanguageModelCheck: boolean;
  maxHeuristicScore: number;
  maxVectorScore: number;
  maxModelScore: number;
}

export interface DetectApiFailureResponse {
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
