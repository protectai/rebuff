import fetch, { Response } from "node-fetch";

type DetectApiRequest = {
  input_base64: string;
  similarityThreshold?: number;
  runHeuristicCheck?: boolean;
  runVectorCheck?: boolean;
  runLanguageModelCheck?: boolean;
};

type DetectApiSuccessResponse = {
  heuristicScore: number;
  modelScore: number;
  vectorScore: Record<string, number>;
  runHeuristicCheck: boolean;
  runVectorCheck: boolean;
  runLanguageModelCheck: boolean;
};

type DetectApiFailureResponse = {
  error: string;
  message: string;
};

class Rebuff {
  private api_token: string;
  private api_url: string;

  constructor(api_token: string, api_url = "https://rebuff.ai") {
    this.api_token = api_token;
    this.api_url = api_url;
  }

  async is_injection_detected(
    user_input: string
  ): Promise<DetectApiSuccessResponse | DetectApiFailureResponse> {
    const headers = {
      Authorization: `Bearer ${this.api_token}`,
      "Content-Type": "application/json",
    };
    const user_input_bytes = new TextEncoder().encode(user_input);
    const user_input_base64 = Array.from(user_input_bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const request_data: DetectApiRequest = { input_base64: user_input_base64 };
    const response: Response = await fetch(`${this.api_url}/api/detect`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(request_data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const response_json = await response.json();
    return response_json as DetectApiSuccessResponse;
  }

  async detect_leakage(output_text: string, canary_word: string): Promise<any> {
    const headers = { Authorization: `Bearer ${this.api_token}` };
    const data = {
      action: "detectLeakage",
      outputText: output_text,
      canaryWord: canary_word,
    };
    const response: Response = await fetch(this.api_url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  add_canaryword(prompt_template: string): void {
    // Not implemented
  }

  is_canaryword_leaked(completion: string, canary_word: string): void {
    // Not implemented
  }
}

export default Rebuff;
