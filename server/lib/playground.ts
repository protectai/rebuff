import { DetectResponse } from "rebuff/src/interface";

export interface PromptResponse {
  canary_word: string;
  canary_word_leaked: boolean;
  breach: boolean;
  output: string;
  detection: DetectResponse;
}
