import {
  DetectRequest,
  DetectResponse,
  Rebuff,
  RebuffError,
} from "./interface";
import crypto from "crypto";
import { SdkConfig } from "./config";
import initPinecone from "./lib/vectordb";
import { v4 as uuidv4 } from "uuid";
import { PineconeClient } from "@pinecone-database/pinecone";
import {
  callOpenAiToDetectPI,
  detectPiUsingVectorDatabase,
  detectPromptInjectionUsingHeuristicOnInput,
} from "./lib/detect";
import getOpenAIInstance from "./lib/openai";
import { renderPromptForPiDetection } from "./lib/prompts";
import { OpenAIApi } from "openai";

function generateCanaryWord(length = 8): string {
  // Generate a secure random hexadecimal canary word
  return crypto.randomBytes(length / 2).toString("hex");
}

export default class RebuffSdk implements Rebuff {
  private pinecone: {
    conn?: PineconeClient;
    index: string;
  };

  private openai: {
    conn: OpenAIApi;
    model: string;
  };

  constructor(config: SdkConfig) {
    this.pinecone = { index: "" };
    this.openai = {
      conn: getOpenAIInstance(config.openai.apikey),
      model: config.openai.model || "gpt-3.5-turbo",
    };
    (async () => {
      this.pinecone = {
        conn: await initPinecone(
          config.pinecone.environment,
          config.pinecone.apikey
        ),
        index: config.pinecone.index,
      };
    })();
  }

  async detectInjection({
    userInput = "",
    userInputBase64 = "",
    maxHeuristicScore = 0.75,
    maxVectorScore = 0.9,
    maxModelScore = 0.9,
    runHeuristicCheck = true,
    runVectorCheck = true,
    runLanguageModelCheck = true,
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
    if (typeof runHeuristicCheck !== "boolean") {
      throw new RebuffError("runHeuristicCheck must be a boolean");
    }
    if (typeof runVectorCheck !== "boolean") {
      throw new RebuffError("runVectorCheck must be a boolean");
    }
    if (typeof runLanguageModelCheck !== "boolean") {
      throw new RebuffError("runLanguageModelCheck must be a boolean");
    }
    if (
      maxHeuristicScore === null ||
      maxModelScore === null ||
      maxVectorScore === null
    ) {
      throw new RebuffError(
        "maxHeuristicScore, maxModelScore, and maxVectorScore are required"
      );
    }

    runHeuristicCheck = runHeuristicCheck === null ? true : runHeuristicCheck;
    runVectorCheck = runVectorCheck === null ? true : runVectorCheck;
    runLanguageModelCheck =
      runLanguageModelCheck === null ? true : runLanguageModelCheck;

    if (!userInput) {
      throw new RebuffError("userInput is required");
    }

    const heuristicScore = runHeuristicCheck
      ? detectPromptInjectionUsingHeuristicOnInput(userInput)
      : 0;

    const modelScore = runLanguageModelCheck
      ? parseFloat(
          (
            await callOpenAiToDetectPI(
              renderPromptForPiDetection(userInput),
              this.openai.conn,
              this.openai.model
            )
          ).completion
        )
      : 0;

    const vectorScore = runVectorCheck
      ? await detectPiUsingVectorDatabase(
          userInput,
          maxVectorScore,
          await this.getPineconeConnection(),
          this.pinecone.index,
          this.openai.conn
        )
      : { topScore: 0, countOverMaxVectorScore: 0 };
    const injectionDetected =
      heuristicScore > maxHeuristicScore ||
      modelScore > maxModelScore ||
      vectorScore.topScore > maxVectorScore;

    return {
      heuristicScore,
      modelScore,
      vectorScore,
      runHeuristicCheck,
      runVectorCheck,
      runLanguageModelCheck,
      maxHeuristicScore,
      maxVectorScore,
      maxModelScore,
      injectionDetected,
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
        this.logLeakage(userInput, { completion, canaryWord });
      }
      return true;
    }
    return false;
  }

  // Calling functions immediately after constructor can cause issues if pinecone connection needs time
  async getPineconeConnection(): Promise<PineconeClient> {
    if (this.pinecone.conn) {
      return this.pinecone.conn;
    }
    // Wait 1 second for pinecone connection to be initialized by constructor
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // If pinecone connection is still not initialized, throw an error
    if (this.pinecone.conn) {
      return this.pinecone.conn;
    }
    throw new RebuffError("Pinecone connection not initialized yet");
  }

  async logLeakage(
    input: string,
    metaData: Record<string, string>
  ): Promise<void> {
    const emb = await this.openai.conn.createEmbedding({
      model: "text-embedding-ada-002",
      input: input,
    });

    // Get Pinecone Index
    const index = (await this.getPineconeConnection()).Index(
      this.pinecone.index
    );

    // Insert embedding into index
    await index.upsert({
      upsertRequest: {
        vectors: [
          {
            id: uuidv4(),
            values: emb.data.data[0].embedding,
            metadata: {
              input: input,
              ...metaData,
            },
          },
        ],
      },
    });
  }
}
