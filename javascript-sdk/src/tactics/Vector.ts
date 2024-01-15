import { VectorStore } from "langchain/vectorstores/base";
import { RebuffError, TacticName } from "../interface";
import Tactic, { TacticExecution } from "./Tactic";


export default class Vector implements Tactic {
  name = TacticName.VectorDB;
  defaultThreshold: number;

  private vectorStore: VectorStore;

  constructor(threshold: number, vectorStore: VectorStore) {
    this.defaultThreshold = threshold;
    this.vectorStore = vectorStore;
  }

  async execute(input: string, thresholdOverride?: number): Promise<TacticExecution> {
    const threshold = thresholdOverride || this.defaultThreshold;
    try {
      const topK = 20;
      const results = await this.vectorStore.similaritySearchWithScore(input, topK);
  
      let topScore = 0;
      let countOverMaxVectorScore = 0;
  
      for (const [_, score] of results) {
        if (score == undefined) {
          continue;
        }
  
        if (score > topScore) {
          topScore = score;
        }
  
        if (score >= threshold) {
          countOverMaxVectorScore++;
        }
      }
  
      return { score: topScore, additionalFields: { countOverMaxVectorScore } };
    } catch (error) {
      throw new RebuffError(`Error in getting score for vector tactic: ${error}`);
    }
  }
}
