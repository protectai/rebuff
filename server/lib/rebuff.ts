import RebuffSdk from "@rebuff/sdk/src/sdk";
import { getEnvironmentVariable } from "./general-helpers";

export const rebuff = new RebuffSdk({
  openai: {
    apikey: getEnvironmentVariable("OPENAI_API_KEY"),
    model: "gpt-3.5-turbo",
  },
  vectorStore: getEnvironmentVariable("VECTOR_STORE"),
  pinecone: {
    environment: process.env["PINECONE_ENVIRONMENT"],
    apikey: process.env["PINECONE_API_KEY"],
    index: process.env["PINECONE_INDEX_NAME"],
  },
  supabase: {
    serviceKey: process.env["SUPABASE_SERVICE_KEY"],
    url: process.env["NEXT_PUBLIC_SUPABASE_URL"],
  },
});
