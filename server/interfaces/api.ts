export interface ApiResponse {
  prompt: string;
  sanitized_prompt: string;
  canary_word: string;
  is_prompt_safe: { heuristic: boolean; vectordb: number; llm: number };
  output: string;
}
