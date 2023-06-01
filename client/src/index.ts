import fetch from "node-fetch";
import { randomBytes } from "crypto";
import {
  DetectApiFailureResponse,
  DetectApiRequest,
  DetectApiSuccessResponse,
} from "@rebuff/types/src/api";

function generateCanaryWord(length: number = 8): string {
  // Generate a secure random hexadecimal canary word
  return randomBytes(length / 2).toString("hex");
}

function encodeString(message: string): string {
  return Buffer.from(message, "utf-8").toString("hex");
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
    {
      maxHeuristicScore = 0.75,
      maxVectorScore = 0.9,
      maxModelScore = 0.9,
      checkHeuristic = true,
      checkVector = true,
      checkLLM = true,
    }: {
      maxHeuristicScore?: number;
      maxVectorScore?: number;
      maxModelScore?: number;
      checkHeuristic?: boolean;
      checkVector?: boolean;
      checkLLM?: boolean;
    } = {}
  ): Promise<[DetectApiSuccessResponse, boolean]> {
    const requestData: DetectApiRequest = {
      input_base64: encodeString(userInput),
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

    if (!response.ok) {
      const responseData = (await response.json()) as DetectApiFailureResponse;
      throw new Error(`Error detecting injection: ${responseData.message}`);
    }

    const responseData = (await response.json()) as DetectApiSuccessResponse;
    const { heuristicScore, modelScore, vectorScore } = responseData;

    const isInjection =
      heuristicScore > maxHeuristicScore ||
      modelScore > maxModelScore ||
      vectorScore.topScore > maxVectorScore;

    return [responseData, isInjection];
  }

  static addCanaryWord(
    prompt: string,
    canaryWord: string = generateCanaryWord(),
    canaryFormat = "<!-- {canary_word} -->"
  ): [string, string] {
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
      user_input: userInput,
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
