export type DetectApiRequest = {
  input_base64: string;
  similarityThreshold?: number;
  runHeuristicCheck?: boolean;
  runVectorCheck?: boolean;
  runLanguageModelCheck?: boolean;
};

export type DetectApiSuccessResponse = {
  heuristicScore: number;
  modelScore: number;
  vectorScore: Record<string, number>;
  runHeuristicCheck: boolean;
  runVectorCheck: boolean;
  runLanguageModelCheck: boolean;
};

export type DetectApiFailureResponse = {
  error: string;
  message: string;
};
