import { Configuration, OpenAIApi } from "openai";

export default function getOpenAIInstance(apiKey: string) {
  return new OpenAIApi(new Configuration({ apiKey }));
}
