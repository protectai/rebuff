import { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";
import { createClient } from "@supabase/supabase-js";
import { Configuration, OpenAIApi } from "openai";
import { pinecone } from "@/lib/pinecone-client";
import { render_prompt_for_pi_detection } from "@/lib/templates";
import stringSimilarity from "string-similarity";
import {
  DetectApiFailureResponse,
  DetectApiRequest,
  DetectApiSuccessResponse,
} from "@/lib/rebuff";

// Constants
const SIMILARITY_THRESHOLD = 0.9;

const supabaseAdminClient = createClient(
  getEnvironmentVariable("NEXT_PUBLIC_SUPABASE_URL"),
  getEnvironmentVariable("SUPABASE_SERVICE_KEY")
);

// Add utility function to get and validate environment variables
function getEnvironmentVariable(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

const cors = Cors({
  methods: ["POST"],
});

function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function
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

const openai = new OpenAIApi(
  new Configuration({ apiKey: getEnvironmentVariable("OPENAI_API_KEY") })
);

async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    // Query the database to check if the API key exists and is valid
    // Replace 'api_keys' with the name of the table that stores API keys
    const { data, error } = await supabaseAdminClient
      .from("accounts")
      .select()
      .filter("user_apikey", "eq", apiKey);

    // If there is an error or the API key is not found, return false
    if (error || !data) {
      return false;
    }

    // If the API key is found, return true
    return true;
  } catch (error) {
    console.error("Error in validateApiKey:", error);
    return false;
  }
}

async function detectPiUsingVectorDatabase(
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
    const index = (await pinecone).Index("pig-index");

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

        if (match.score >= similarityThreshold) {
          countOverMaxVectorScore++;

          if (match.score > topScore) {
            topScore = match.score;
          }
        }
      }
    }

    return { topScore, countOverMaxVectorScore };
  } catch (error) {
    console.error("Error in detectPiUsingVectorDatabase:", error);
    return { topScore: 0, countOverMaxVectorScore: 0 };
  }
}

function generateInjectionKeywords() {
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

// Normalize a string by converting to lowercase and removing extra spaces and punctuation
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s]|_/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Return the highest score, ensure the score is normalized between 0 and 1
// based on the amount of consecutive words matched and the similarity score
function detectPromptInjectionUsingHeuristicOnInput(input: string): number {
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

async function callOpenAiToDetectPI(
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  await runMiddleware(req, res, cors);
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "not_allowed",
      message: "Method not allowed",
    } as DetectApiFailureResponse);
  }
  try {
    // Extract the API key from the Authorization header
    const apiKey = req.headers.authorization?.split(" ")[1];

    // Assert that the API key is present
    if (!apiKey) {
      return res.status(401).json({
        error: "unauthorized",
        message: "Missing API key",
      } as DetectApiFailureResponse);
    }

    // Validate the API key
    const isValidApiKey = await validateApiKey(apiKey);
    if (!isValidApiKey) {
      return res.status(401).json({
        error: "unauthorized",
        message: "Invalid API key",
      } as DetectApiFailureResponse);
    }
    let {
      input_base64,
      runHeuristicCheck = true,
      runVectorCheck = true,
      runLanguageModelCheck = true,
      maxHeuristicScore = null,
      maxModelScore = null,
      maxVectorScore = null,
    } = req.body;

    if (
      maxHeuristicScore === null ||
      maxModelScore === null ||
      maxVectorScore === null
    ) {
      return res.status(400).json({
        error: "bad_request",
        message:
          "maxHeuristicScore, maxModelScore, and maxVectorScore are required",
      } as DetectApiFailureResponse);
    }

    runHeuristicCheck = runHeuristicCheck === null ? true : runHeuristicCheck;
    runVectorCheck = runVectorCheck === null ? true : runVectorCheck;
    runLanguageModelCheck =
      runLanguageModelCheck === null ? true : runLanguageModelCheck;

    if (!input_base64) {
      return res.status(400).json({
        error: "bad_request",
        message: "input_base64 is required",
      } as DetectApiFailureResponse);
    }

    // Create a buffer from the hexadecimal string
    const userInputBuffer = Buffer.from(input_base64, "hex");

    // Decode the buffer to a UTF-8 string
    const inputText = userInputBuffer.toString("utf-8");

    const heuristicScore = runHeuristicCheck
      ? detectPromptInjectionUsingHeuristicOnInput(inputText)
      : 0;

    const modelScore = runLanguageModelCheck
      ? parseFloat(
          (
            await callOpenAiToDetectPI(
              render_prompt_for_pi_detection(inputText)
            )
          ).completion
        )
      : 0;

    const vectorScore = runVectorCheck
      ? await detectPiUsingVectorDatabase(inputText, maxVectorScore)
      : { topScore: 0, countOverMaxVectorScore: 0 };

    const response: DetectApiSuccessResponse = {
      heuristicScore,
      modelScore,
      vectorScore,
      runHeuristicCheck,
      runVectorCheck,
      runLanguageModelCheck,
      maxHeuristicScore,
      maxVectorScore,
      maxModelScore,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error in detect API:");
    console.error(error);
    console.trace();
    return res.status(500).json({
      error: "server_error",
      message: "Internal server error",
    } as DetectApiFailureResponse);
  }
}
