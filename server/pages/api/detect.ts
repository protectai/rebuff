import { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";
import { createClient } from "@supabase/supabase-js";
import { Configuration, OpenAIApi } from "openai";
import { pinecone } from "@/lib/pinecone-client";
import crypto from "crypto";
import { render_prompt_for_pi_detection } from "@/lib/templates";
import { v4 as uuidv4 } from "uuid";

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

// Type definitions
type DetectApiRequest = {
  input_base64: string;
  similarityThreshold?: number;
  runHeuristicCheck?: boolean;
  runVectorCheck?: boolean;
  runLanguageModelCheck?: boolean;
};

type DetectApiSuccessResponse = {
  heuristicScore: number;
  modelScore: number;
  vectorScore: {
    topScore: number;
    overSimilarityThreshold: number;
  };
  runHeuristicCheck: boolean;
  runVectorCheck: boolean;
  runLanguageModelCheck: boolean;
};

type DetectApiFailureResponse = {
  error: string;
  message: string;
};

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

async function detectPiUsingVectorDatabase(
  input: string,
  similarityThreshold: number
): Promise<{ topScore: number; overSimilarityThreshold: number }> {
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
    let overSimilarityThreshold = 0;

    if (queryResponse.matches != undefined) {
      for (const match of queryResponse.matches) {
        if (match.score == undefined) {
          continue;
        }

        if (match.score >= similarityThreshold) {
          overSimilarityThreshold++;
        }

        if (match.score > topScore) {
          topScore = match.score;
        }
      }
    }

    return { topScore, overSimilarityThreshold };
  } catch (error) {
    console.error("Error in detectPiUsingVectorDatabase:", error);
    return { topScore: 0, overSimilarityThreshold: 0 };
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
    "directives",
    "commands",
    "context",
    "conversation",
    "input",
    "data",
    "messages",
    "communication",
    "responses",
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

function detectPromptInjectionUsingHeuristicOnInput(input: string): number {
  let highestScore = 0;
  const lowerCaseInput = input.toLowerCase();

  for (const keyword of injectionKeywords) {
    const lowerCaseKeyword = keyword.toLowerCase();
    const keywordParts = lowerCaseKeyword.split(" ");
    let matchedWordsCount = 0;

    for (const part of keywordParts) {
      if (lowerCaseInput.includes(part)) {
        matchedWordsCount++;
      }
    }

    let score = 0;
    if (matchedWordsCount === 1) {
      score = 0.5;
    } else if (matchedWordsCount === 2) {
      score = 0.7;
    } else if (matchedWordsCount == 3) {
      score = 0.8;
    } else if (matchedWordsCount == 4) {
      score = 0.85;
    } else if (matchedWordsCount >= 5) {
      score = 0.88;
    }

    if (score > highestScore) {
      highestScore = score;
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

  let {
    input_base64,
    similarityThreshold = null,
    runHeuristicCheck = true,
    runVectorCheck = true,
    runLanguageModelCheck = true,
  } = JSON.parse(req.body) as DetectApiRequest;

  // Use default values if the properties are null
  similarityThreshold =
    similarityThreshold === null ? SIMILARITY_THRESHOLD : similarityThreshold;
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
        (await callOpenAiToDetectPI(render_prompt_for_pi_detection(inputText)))
          .completion
      )
    : 0;

  const vectorScore = runVectorCheck
    ? await detectPiUsingVectorDatabase(inputText, similarityThreshold)
    : { topScore: 0, overSimilarityThreshold: 0 };

  const response: DetectApiSuccessResponse = {
    heuristicScore,
    modelScore,
    vectorScore,
    runHeuristicCheck,
    runVectorCheck,
    runLanguageModelCheck,
  };

  res.status(200).json(response);
}
