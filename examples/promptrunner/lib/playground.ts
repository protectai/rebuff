import { DetectApiSuccessResponse } from "@/lib/rebuff";
export interface PromptResponse {
  canary_word: string;
  canary_word_leaked: boolean;
  breach: boolean;
  is_injection: boolean;
  output: string;
  metrics: DetectApiSuccessResponse;
}
