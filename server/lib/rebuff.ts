import { RebuffSdk, VectorDbConfig } from "rebuff";
import { getEnvironmentVariable } from "./general-helpers";

let vectorDB: VectorDbConfig;
if (process.env["VECTOR_DB"] === "chroma") {
  vectorDB = {
    chroma: {
      url: getEnvironmentVariable("CHROMA_URL"),
      collectionName: getEnvironmentVariable("CHROMA_COLLECTION_NAME"),
    }
  }
} else {
  vectorDB = {
    pinecone: {
      environment: getEnvironmentVariable("PINECONE_ENVIRONMENT"),
      apikey: getEnvironmentVariable("PINECONE_API_KEY"),
      index: getEnvironmentVariable("PINECONE_INDEX_NAME"),
    }
  }
}

export const rebuff = new RebuffSdk({
  openai: {
    apikey: getEnvironmentVariable("OPENAI_API_KEY"),
    model: "gpt-3.5-turbo",
  },
  vectorDB: vectorDB,
});
