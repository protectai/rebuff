import { PineconeClient } from "@pinecone-database/pinecone";

export default async function initPinecone(
  environment: string,
  apiKey: string
): Promise<PineconeClient> {
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

    return pinecone;
  } catch (error) {
    console.log("error", error);
    throw new Error("Failed to initialize Pinecone Client");
  }
}
