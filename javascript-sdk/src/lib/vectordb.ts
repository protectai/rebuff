import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";
import { VectorStore } from "langchain/vectorstores/base";
import { PineconeClient } from "@pinecone-database/pinecone";
import { createClient } from "@supabase/supabase-js";
import { SdkConfig } from "./lib/config";


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

async function initSupabase(
  serviceKey: string,
  url: string,
  openaiEmbeddings: OpenAIEmbeddings,
): Promise<SupabaseVectorStore> {
  if (!serviceKey) {
    throw new Error("Supabase service key definition missing");
  }
  if (!url) {
    throw new Error("Supabase URL definition missing");
  }
  try {
    const client = createClient(url, serviceKey);
    const vectorStore = new SupabaseVectorStore(openaiEmbeddings, {
      client,
      tableName: "documents",
    });

    return vectorStore;
  } catch (error) {
    console.log("error", error);
    throw new Error("Failed to initialize Supabase client");
  }
}

export default async function initVectorStore(
  config: SdkConfig
): Promise<VectorStore> {
  const openaiEmbeddings = new OpenAIEmbeddings({
    openAIApiKey: config.openai.apikey,
    modelName: "text-embedding-ada-002" 
  });
  switch (config.vectorStore.toLowerCase()) {
    case "pinecone":
      return await initPinecone(
        config.pinecone.environment,
        config.pinecone.apikey,
        config.pinecone.index,
        openaiEmbeddings
      );
    case "supabase":
      return await initSupabase(
        config.supabase.serviceKey,
        config.supabase.url,
        openaiEmbeddings
      );
    default:
      throw new Error("Unsupported vector store: " + config.vectorStore);
  }
}
