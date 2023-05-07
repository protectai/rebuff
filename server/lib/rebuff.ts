import fetch from "node-fetch";
import crypto from "crypto";

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

export class Rebuff {
  private api_token: string;
  private api_url: string;
  private headers: Record<string, string>;

  constructor(api_token: string, api_url: string = "https://rebuff.ai") {
    this.api_token = api_token;
    this.api_url = api_url;
    this.headers = {
      Authorization: `Bearer ${this.api_token}`,
      "Content-Type": "application/json",
    };
  }

  async is_injection_detected(
    user_input: string,
    max_heuristic_score: number = 0.75,
    max_vector_score: number = 0.9,
    max_model_score: number = 0.9,
    check_heuristic: boolean = true,
    check_vector: boolean = true,
    check_llm: boolean = true
  ): Promise<[DetectApiSuccessResponse, boolean]> {
    const request_data: DetectApiRequest = {
      input_base64: encode_string(user_input),
      runHeuristicCheck: check_heuristic,
      runVectorCheck: check_vector,
      runLanguageModelCheck: check_llm,
      maxVectorScore: max_vector_score,
      maxModelScore: max_model_score,
      maxHeuristicScore: max_heuristic_score,
    };

    const response = await fetch(`${this.api_url}/api/detect`, {
      method: "POST",
      body: JSON.stringify(request_data),
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const success_response: DetectApiSuccessResponse = await response.json();

    if (
      success_response.heuristicScore > max_heuristic_score ||
      success_response.modelScore > max_model_score ||
      success_response.vectorScore["topScore"] > max_vector_score
    ) {
      // Injection detected
      return [success_response, true];
    } else {
      // No injection detected
      return [success_response, false];
    }
  }

  generate_canary_word(length: number = 8): string {
    // Generate a secure random hexadecimal canary word
    return crypto.randomBytes(length / 2).toString("hex");
  }

  add_canaryword(
    prompt: string,
    canary_word: string | null = null,
    canary_format: string = "<!-- {canary_word} -->"
  ): [string, string] {
    // Generate a canary word if not provided
    if (canary_word === null) {
      canary_word = this.generate_canary_word();
    }

    // Embed the canary word in the specified format
    const canary_comment = canary_format.replace("{canary_word}", canary_word);
    const prompt_with_canary: string = canary_comment + "\n" + prompt;
    return [prompt_with_canary, canary_word];
  }
  is_canaryword_leaked(
    user_input: string,
    completion: string,
    canary_word: string,
    log_outcome: boolean = true
  ): boolean {
    // Check if the canary word appears in the completion
    if (completion.includes(canary_word)) {
      if (log_outcome) {
        this.log_leakage(user_input, completion, canary_word);
      }
      return true;
    }
    return false;
  }

  async log_leakage(
    user_input: string,
    completion: string,
    canary_word: string
  ): Promise<void> {
    const data = {
      user_input: user_input,
      completion: completion,
      canaryWord: canary_word,
    };

    const response = await fetch(`${this.api_url}/api/log_leakage`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }
}

function encode_string(message: string): string {
  return Buffer.from(message, "utf-8").toString("hex");
}
