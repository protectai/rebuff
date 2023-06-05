import RebuffSdk from "@rebuff/sdk/src/sdk";
import { getEnvironmentVariable } from "./general-helpers";

export const rebuff = new RebuffSdk({
  openai: {
    apikey: getEnvironmentVariable("OPENAI_API_KEY"),
    model: "gpt-3.5-turbo",
  },
  pinecone: {
    environment: getEnvironmentVariable("PINECONE_ENVIRONMENT"),
    apikey: getEnvironmentVariable("PINECONE_API_KEY"),
    index: getEnvironmentVariable("PINECONE_INDEX_NAME"),
  },
});
