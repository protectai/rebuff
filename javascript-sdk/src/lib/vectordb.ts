import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";


export default async function initPinecone(
  environment: string,
  apiKey: string,
  index: string,
  openaiApiKey: string,
): Promise<PineconeStore> {
  if (!environment) {
    throw new Error("Pinecone environment definition missing");
  }
  if (!apiKey) {
    throw new Error("Pinecone apikey definition missing");
  }
  try {
    const pinecone = new PineconeClient();

    await pinecone.init({
      environment,
      apiKey,
    });
    const openaiEmbeddings = new OpenAIEmbeddings({
      openAIApiKey: openaiApiKey,
      modelName: "text-embedding-ada-002" 
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
