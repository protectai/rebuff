import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { VectorStore } from "langchain/vectorstores/base";
import { PineconeClient } from "@pinecone-database/pinecone";
import { Chroma } from "langchain/vectorstores/chroma";
import { Document } from "langchain/document.js";
import { SdkConfig } from "../config";

// Our code expects a similarity score where similar vectors are close to 1, but Chroma returns a distance score
// where similar vectors are close to 0. Note that this class may not work if using a distance metric other than
// cosine.
class ChromaCosineSimilarity extends Chroma {
  async similaritySearchVectorWithScore(
    query: number[],
    k: number,
    filter?: this["FilterType"]
  ): Promise<[Document<Record<string, any>>, number][]> {
    const results = await super.similaritySearchVectorWithScore(query, k, filter);
    return results.map(([id, score]) => [id, 1 - score]);
  }
}

async function initPinecone(
  environment: string,
  apiKey: string,
  index: string,
  openaiEmbeddings: OpenAIEmbeddings,
): Promise<PineconeStore> {
  if (!environment) {
    throw new Error("Pinecone environment definition missing");
  }
  if (!apiKey) {
    throw new Error("Pinecone apikey definition missing");
  }
  if (!index) {
    throw new Error("Pinecone index definition missing");
  }
  try {
    const pinecone = new PineconeClient();

    await pinecone.init({
      environment,
      apiKey,
    });
    const pineconeIndex = pinecone.Index(index);
    const vectorStore = await PineconeStore.fromExistingIndex(
      openaiEmbeddings,
      { pineconeIndex }
    );

    return vectorStore;
  } catch (error) {
    console.log("error", error);
    throw new Error("Failed to initialize Pinecone Client");
  }
}

async function initChroma(
  collectionName: string,
  url: string,
  openaiEmbeddings: OpenAIEmbeddings,
): Promise<ChromaCosineSimilarity> {
  if (!url) {
    throw new Error("Chroma url definition missing");
  }
  if (!collectionName) {
    throw new Error("Chroma collectionName definition missing");
  }
  try {
    const vectorStore = new ChromaCosineSimilarity(
      openaiEmbeddings,
      {
        collectionName,
        url,
        numDimensions: 1536,
        collectionMetadata: { 
          "hnsw:space": "cosine"
        },
      }
    );
    await vectorStore.ensureCollection();
    return vectorStore;
  } catch (error) {
    console.log("error", error);
    throw new Error("Failed to initialize Chroma client");
  }
}

export default async function initVectorStore(
  config: SdkConfig
): Promise<VectorStore> {
  const openaiEmbeddings = new OpenAIEmbeddings({
    openAIApiKey: config.openai.apikey,
    modelName: "text-embedding-ada-002"
  });
  if ("pinecone" in config.vectorDB) {
    return await initPinecone(
      config.vectorDB.pinecone.environment,
      config.vectorDB.pinecone.apikey,
      config.vectorDB.pinecone.index,
      openaiEmbeddings
    );
  } else {
    return await initChroma(
      config.vectorDB.chroma.collectionName,
      config.vectorDB.chroma.url,
      openaiEmbeddings
    );
  }
}
