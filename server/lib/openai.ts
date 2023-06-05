import { Configuration, OpenAIApi } from "openai";
import { getEnvironmentVariable } from "@/lib/general-helpers";

export const openai = new OpenAIApi(
  new Configuration({ apiKey: getEnvironmentVariable("OPENAI_API_KEY") })
);
