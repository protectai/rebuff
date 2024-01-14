import {
  DetectRequest,
  DetectResponse,
  Rebuff,
  RebuffError,
  TacticResult,
} from "./interface";
import crypto from "crypto";
import { SdkConfig } from "./config";
import initVectorStore from "./lib/vectordb";
import getOpenAIInstance from "./lib/openai";
import { OpenAIApi } from "openai";
import { VectorStore } from "langchain/vectorstores/base";
import { Document } from "langchain/document";
import Strategy from "./lib/Strategy";
import Heuristic from "./tactics/Heuristic";
import OpenAI from "./tactics/OpenAI";
import Vector from "./tactics/Vector";

function generateCanaryWord(length = 8): string {
  // Generate a secure random hexadecimal canary word
  return crypto.randomBytes(length / 2).toString("hex");
}

export default class RebuffSdk implements Rebuff {
  private sdkConfig: SdkConfig;
  private vectorStore: VectorStore | undefined;
  private strategies: Record<string, Strategy> | undefined;
  private defaultStrategy: string;

  private openai: {
    conn: OpenAIApi;
    model: string;
  };

  constructor(config: SdkConfig) {
    this.sdkConfig = config;
    this.openai = {
      conn: getOpenAIInstance(config.openai.apikey),
      model: config.openai.model || "gpt-3.5-turbo",
    };
    this.defaultStrategy = "standard";
  }

  private async getStrategies(): Promise<Record<string, Strategy>> {
    if (this.strategies) {
      return this.strategies;
    }
    const heuristicScoreThreshold = 0.75;
    const vectorScoreThreshold = 0.9;
    const openaiScoreThreshold = 0.9;
    const strategies: Record<string, Strategy> = {
      // For now, this is the only strategy.
      "standard": {
        tactics: [
          new Heuristic(heuristicScoreThreshold),
          new Vector(vectorScoreThreshold, await this.getVectorStore()),
          new OpenAI(openaiScoreThreshold, this.openai.model, this.openai.conn),
        ]
      },
    };
    this.strategies = strategies;
    return this.strategies;
  }

  async detectInjection({
    userInput = "",
    userInputBase64 = "",
    tacticOverrides = [],
  }: DetectRequest): Promise<DetectResponse> {
    if (userInputBase64) {
      // Create a buffer from the hexadecimal string
      const userInputBuffer = Buffer.from(userInputBase64, "hex");
      // Decode the buffer to a UTF-8 string
      userInput = userInputBuffer.toString("utf-8");
    }
    if (!userInput) {
      throw new RebuffError("userInput is required");
    }

    const strategies = await this.getStrategies();
    let injectionDetected = false;
    let tacticResults: TacticResult[] = [];
    for (const tactic of strategies[this.defaultStrategy].tactics) {
      const tacticOverride = tacticOverrides.find(t => t.name === tactic.name);
      if (tacticOverride && tacticOverride.run === false) {
        continue;
      }
      const threshold = tacticOverride?.threshold ?? tactic.defaultThreshold;
      const execution = await tactic.execute(userInput, threshold);
      const result = {
        name: tactic.name,
        score: execution.score,
        threshold,
        detected: execution.score > threshold,
        additionalFields: execution.additionalFields ?? {},
      } as TacticResult;
      if (result.detected) {
        injectionDetected = true;
      }
      tacticResults.push(result);
    }

    return {
      injectionDetected,
      tacticResults,
    } as DetectResponse;
  }

  addCanaryWord(
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
        this.logLeakage(userInput, { completion, "canary_word": canaryWord });
      }
      return true;
    }
    return false;
  }

  async getVectorStore(): Promise<VectorStore> {
    if (this.vectorStore) {
      return this.vectorStore;
    }
    this.vectorStore = await initVectorStore(this.sdkConfig);
    return this.vectorStore
  }

  async logLeakage(
    input: string,
    metaData: Record<string, string>
  ): Promise<void> {
    await (await this.getVectorStore()).addDocuments([new Document({
      metadata: metaData,
      pageContent: input,
    })]);
  }
}
