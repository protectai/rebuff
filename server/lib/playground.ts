import { DetectApiSuccessResponse } from "@/lib/rebuff";
export interface PromptResponse {
  canary_word: string;
  canary_word_leaked: boolean;
  is_injection: boolean;
  llm_query: string;
  metrics: DetectApiSuccessResponse;
}
