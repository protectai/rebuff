import { NextApiRequest, NextApiResponse } from "next";
import { pinecone } from "@/lib/pinecone-client";
import stringSimilarity from "string-similarity";
import { supabaseAdminClient } from "@/lib/supabase";
import { openai } from "@/lib/openai";
import { getEnvironmentVariable, normalizeString } from "@/lib/general-helpers";
type MiddlewareCallback = (result: any) => void;

export function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: (
    req: NextApiRequest,
    res: NextApiResponse,
    callback: MiddlewareCallback
  ) => void
): Promise<any> {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}
async function deductCredits(
  apiKey: string,
  billingRate: number
): Promise<{ success: boolean; message: string }> {
  const { data, error } = await supabaseAdminClient.rpc("deduct_rate", {
    // eslint-disable-next-line camelcase
    input_api_key: apiKey,
    rate: billingRate,
  });

  if (error) {
    console.log("Error in deduct_rate:", error);
    return {
      success: false,
      message: "Invalid API key or insufficient credits",
    };
  }

  if (!data) {
    console.log("Error in deduct_rate: no data returned");
    return { success: false, message: "Error processing request" };
  }

  if (data <= 0) {
    console.log("Error in deduct_rate: no credits left");
    return { success: false, message: "Insufficient credits" };
  }

  return { success: true, message: "API key accepted and credits deducted" };
}

export async function checkApiKeyAndReduceBalance(
  apiKey: string
): Promise<{ success: boolean; message: string }> {
  const billingRate = parseInt(getEnvironmentVariable("BILLING_RATE_INT_10K"));

  // Get the master credit amount from the environment variable
  if (process.env.MASTER_API_KEY && apiKey === process.env.MASTER_API_KEY) {
    if (!process.env.MASTER_CREDIT_AMOUNT) {
      return {
        success: false,
        message: "Master API key defined but no master credit amount",
      };
    }

    const masterCreditAmount = parseInt(
      getEnvironmentVariable("MASTER_CREDIT_AMOUNT")
    );

    if (masterCreditAmount >= billingRate) {
      return { success: true, message: "Master API key accepted" };
    }

    if (masterCreditAmount < billingRate) {
      return {
        success: false,
        message: "Master API key has insufficient credits",
      };
    }
  }

  return deductCredits(apiKey, billingRate);
}

export async function checkApiKey(
  apiKey: string
): Promise<{ success: boolean; message: string; account_id?: string }> {
  // Get the master credit amount from the environment variable
  if (process.env.MASTER_API_KEY && apiKey === process.env.MASTER_API_KEY) {
    return { success: true, message: "Master API key accepted" };
  }

  const { data, error } = await supabaseAdminClient
    .from("accounts")
    .select("id")
    .eq("user_apikey", apiKey);

  if (error || !data) {
    return {
      success: false,
      message: "Invalid API key",
    };
  }

  // eslint-disable-next-line camelcase
  return { success: true, message: "API key accepted", account_id: data[0].id };
}

export async function detectPiUsingVectorDatabase(
  input: string,
  similarityThreshold: number
): Promise<{ topScore: number; countOverMaxVectorScore: number }> {
  try {
    // Create embedding from input
    const emb = await openai.createEmbedding({
      model: "text-embedding-ada-002",
      input: input,
    });

    // Get Pinecone Index
    const index = (await pinecone).Index(
      getEnvironmentVariable("PINECONE_INDEX_NAME")
    );

    // Query similar embeddings
    const queryResponse = await index.query({
      queryRequest: {
        vector: emb.data.data[0].embedding,
        topK: 20,
        includeValues: true,
      },
    });

    let topScore = 0;
    let countOverMaxVectorScore = 0;

    if (queryResponse.matches != undefined) {
      for (const match of queryResponse.matches) {
        if (match.score == undefined) {
          continue;
        }

        if (match.score > topScore) {
          topScore = match.score;
        }

        if (match.score >= similarityThreshold && match.score > topScore) {
          countOverMaxVectorScore++;
        }
      }
    }

    return { topScore, countOverMaxVectorScore };
  } catch (error) {
    console.error("Error in detectPiUsingVectorDatabase:", error);
    return { topScore: 0, countOverMaxVectorScore: 0 };
  }
}

export function generateInjectionKeywords() {
  // Define lists of verbs, adjectives, prepositions, and objects
  const verbs = [
    "Ignore",
    "Disregard",
    "Skip",
    "Forget",
    "Neglect",
    "Overlook",
    "Omit",
    "Bypass",
    "Pay no attention to",
    "Do not follow",
    "Do not obey",
  ];

  const adjectives = [
    "",
    "prior",
    "previous",
    "preceding",
    "above",
    "foregoing",
    "earlier",
    "initial",
  ];

  const prepositions = [
    "",
    "and start over",
    "and start anew",
    "and begin afresh",
    "and start from scratch",
  ];

  const objects = [
    "content",
    "text",
    "instructions",
    "instruction",
    "directives",
    "directive",
    "commands",
    "command",
    "context",
    "conversation",
    "input",
    "inputs",
    "data",
    "message",
    "messages",
    "communication",
    "response",
    "responses",
    "request",
    "requests",
  ];

  // Generate all possible combinations of sentences
  const injectionKeywords = [];
  for (const verb of verbs) {
    for (const adjective of adjectives) {
      for (const object of objects) {
        for (const preposition of prepositions) {
          injectionKeywords.push(
            `${verb} ${adjective} ${object} ${preposition}`.trim()
          );
        }
      }
    }
  }

  return injectionKeywords;
}

// Generate and print the injection keywords
const injectionKeywords = generateInjectionKeywords();

// Return the highest score, ensure the score is normalized between 0 and 1
// based on the amount of consecutive words matched and the similarity score
export function detectPromptInjectionUsingHeuristicOnInput(
  input: string
): number {
  let highestScore = 0;
  const normalizedInput = normalizeString(input);

  for (const keyword of injectionKeywords) {
    const normalizedKeyword = normalizeString(keyword);
    const keywordParts = normalizedKeyword.split(" ");
    const keywordLength = keywordParts.length;

    // Generate substrings of similar length in the input string
    const inputParts = normalizedInput.split(" ");
    const inputSubstrings = [];
    for (let i = 0; i <= inputParts.length - keywordLength; i++) {
      inputSubstrings.push(inputParts.slice(i, i + keywordLength).join(" "));
    }

    // Calculate the similarity score between the keyword and each substring
    for (const substring of inputSubstrings) {
      const similarityScore = stringSimilarity.compareTwoStrings(
        normalizedKeyword,
        substring
      );

      // Calculate the score based on the number of consecutive words matched
      const matchedWordsCount = keywordParts.filter(
        (part, index) => substring.split(" ")[index] === part
      ).length;
      const maxMatchedWords = 5;
      const baseScore =
        matchedWordsCount > 0
          ? 0.5 + 0.5 * Math.min(matchedWordsCount / maxMatchedWords, 1)
          : 0;

      // Adjust the score using the similarity score
      const adjustedScore =
        baseScore - similarityScore * (1 / (maxMatchedWords * 2));

      // Update the highest score if the current adjusted score is higher
      if (adjustedScore > highestScore) {
        highestScore = adjustedScore;
      }
    }
  }

  return highestScore;
}

export async function callOpenAiToDetectPI(
  promptToDetectPiUsingOpenAI: string
): Promise<{ completion: string; error?: string }> {
  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: promptToDetectPiUsingOpenAI }],
    });

    if (completion.data.choices[0].message === undefined) {
      console.log("completion.data.choices[0].message is undefined");
      return { completion: "", error: "server_error" };
    }

    if (completion.data.choices.length === 0) {
      console.log("completion.data.choices.length === 0");
      return { completion: "", error: "server_error" };
    }

    return {
      completion: completion.data.choices[0].message.content,
      error: undefined,
    };
  } catch (error) {
    console.error("Error in callOpenAiToDetectPI:", error);
    return { completion: "", error: "server_error" };
  }
}
