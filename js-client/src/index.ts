import fetch from "node-fetch";
import crypto from "crypto";
import {
  DetectApiFailureResponse,
  DetectApiRequest,
  DetectApiSuccessResponse,
} from "@rebuff/types/src/api";

function generateCanaryWord(length = 8): string {
  // Generate a secure random hexadecimal canary word
  return crypto.randomBytes(length / 2).toString("hex");
}

export default class Rebuff {
  private readonly apiToken: string;

  private readonly apiUrl: string;

  private readonly headers: Record<string, string>;

  constructor(apiToken: string, apiUrl = "https://playground.rebuff.ai") {
    this.apiToken = apiToken;
    this.apiUrl = apiUrl;
    this.headers = {
      Authorization: `Bearer ${this.apiToken}`,
      "Content-Type": "application/json",
    };
  }

  async detectInjection(
    userInput: string,
    maxHeuristicScore = 0.75,
    maxVectorScore = 0.9,
    maxModelScore = 0.9,
    checkHeuristic = true,
    checkVector = true,
    checkLLM = true
  ): Promise<[DetectApiSuccessResponse, boolean]> {
    const requestData: DetectApiRequest = {
      input_base64: encodeString(userInput) /*eslint-disable-line*/,
      runHeuristicCheck: checkHeuristic,
      runVectorCheck: checkVector,
      runLanguageModelCheck: checkLLM,
      maxVectorScore,
      maxModelScore,
      maxHeuristicScore,
    };

    const response = await fetch(`${this.apiUrl}/api/detect`, {
      method: "POST",
      body: JSON.stringify(requestData),
      headers: this.headers,
    });

    const responseData = (await response.json()) as DetectApiSuccessResponse;

    if (!response.ok) {
      const error = responseData as unknown as DetectApiFailureResponse;
      throw new Error(`Error detecting injection: ${error.message}`);
    }
    const isInjection =
      responseData.heuristicScore > maxHeuristicScore ||
      responseData.modelScore > maxModelScore ||
      responseData.vectorScore.topScore > maxVectorScore;
    const detectionMetrics = responseData as DetectApiSuccessResponse;
    return [detectionMetrics, isInjection];
  }

  static addCanaryWord(
    prompt: string,
    canaryWord: string = generateCanaryWord(),
    canaryFormat = "<!-- {canary_word} -->"
  ): [string, string] {
    // Embed the canary word in the specified format
    const canaryComment = canaryFormat.replace("{canary_word}", canaryWord);
    const promptWithCanary = `${canaryComment}\n${prompt}`;
    return [promptWithCanary, canaryWord];
  }

  isCanaryWordLeaked(
    userInput: string,
    completion: string,
    canaryWord: string,
    logOutcome = true
  ): boolean {
    // Check if the canary word appears in the completion
    if (completion.includes(canaryWord)) {
      if (logOutcome) {
        this.logLeakage(userInput, completion, canaryWord);
      }
      return true;
    }
    return false;
  }

  async logLeakage(
    userInput: string,
    completion: string,
    canaryWord: string
  ): Promise<void> {
    const data = {
      user_input: userInput, //eslint-disable-line
      completion,
      canaryWord,
    };

    const response = await fetch(`${this.apiUrl}/api/log`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }
}

function encodeString(message: string): string {
  return Buffer.from(message, "utf-8").toString("hex");
}
