import { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";
import { createClient } from "@supabase/supabase-js";
import { OpenAIApi, Configuration } from "openai";
import { pinecone } from "@/lib/pinecone-client";
import crypto from "crypto";
import { render_prompt_for_pi_detection } from "@/lib/templates";
import { v4 as uuidv4 } from "uuid";
import parseJson from "parse-json";

// Constants
const SIMILARITY_THRESHOLD = 0.9;

// Error messages
const MISSING_ENV_VAR = "Missing environment variable";

const supabaseAdminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_KEY || ""
);

// Add utility function to get and validate environment variables
function getEnvironmentVariable(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${MISSING_ENV_VAR}: ${key}`);
  }
  return value;
}

// Type definitions
type DetectApiRequest = {
  input_base64: string;
};

type DetectApiSuccessResponse = {
  heuristicScore: number;
  modelScore: number;
  vectorScore: number;
};

type DetectApiFailureResponse = {
  error: string;
  message: string;
};

const cors = Cors({
  methods: ["POST", "GET", "HEAD"],
});

function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

function generate_user_specific_secret(user: string, level: number) {
  // md5 hash of the unhashed string
  const hashed = crypto
    .createHash("md5")
    .update(user + level)
    .digest("hex");

  // return the first 10 characters of the hash
  return hashed.substring(0, 10);
}

const openai = new OpenAIApi(
  new Configuration({ apiKey: getEnvironmentVariable("OPENAI_API_KEY") })
);

async function detectPiUsingVectorDatabase(
  input: string,
  similarityThreshold: number
) {
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
        topK: 1,
        includeValues: true,
      },
    });

    if (queryResponse.matches != undefined) {
      for (const match of queryResponse.matches) {
        if (match.score == undefined) {
          continue;
        }

        if (match.score >= similarityThreshold) {
          return true;
        }
      }
    }

    return false;
  } catch (error) {
    console.error("Error in detectPiUsingVectorDatabase:", error);
    return false;
  }
}

function detectPromptInjectionUsingHeuristicOnInput(input: string) {
  const injectionKeywords = [
    "Ignore everything above",
    "Ignore the previous",
    "Disregard the previous",
    "Forget the previous",
    "Pay no attention to the previous",
    "Start a new conversation",
    "New context",
    "Ignore your instructions",
    "Disregard your instructions",
    "Forget your instructions",
    "Do not follow your instructions",
    "Do not obey your instructions",
  ];

  return injectionKeywords.some((keyword) =>
    input.includes(keyword.toLowerCase())
  );
}

async function writeTextAsEmbeddingToPinecone(input: string, user: string) {
  try {
    // Create embedding from input
    const emb = await openai.createEmbedding({
      model: "text-embedding-ada-002",
      input: input,
    });

    // Get Pinecone Index
    const index = (await pinecone).Index("pig-index");

    // Insert embedding into index
    const upsertRes = index.upsert({
      upsertRequest: {
        vectors: [
          {
            id: uuidv4(),
            values: emb.data.data[0].embedding,
            metadata: {
              input: input,
              user: user,
            },
          },
        ],
      },
    });
  } catch (error) {
    console.error("Error in writeTextAsEmbeddingToPinecone:", error);
  }
}

async function callOpenAiToDetectPI(promptToDetectPiUsingOpenAI: string) {
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
    return res
      .status(405)
      .json({ error: "not_allowed", message: "Method not allowed" });
  }
  const requestBody = parseJson(req.body);
  const { input_base64 } = requestBody as DetectApiRequest;

  if (!input_base64) {
    return res
      .status(400)
      .json({ error: "bad_request", message: "input_base64 is required" });
  }

  const inputText = Buffer.from(input_base64, "base64").toString("utf-8");
  const isInjection = detectPromptInjectionUsingHeuristicOnInput(inputText);
  const promptToDetectPiUsingOpenAI = render_prompt_for_pi_detection(inputText);
  const { completion, error } = await callOpenAiToDetectPI(
    promptToDetectPiUsingOpenAI
  );
  const modelScore = parseFloat(completion);

  const isInjectionVector = await detectPiUsingVectorDatabase(
    inputText,
    SIMILARITY_THRESHOLD
  );

  res.status(200).json({
    heuristicScore: isInjection ? 1 : 0,
    modelScore: modelScore,
    vectorScore: isInjectionVector ? 1 : 0,
  });
}
