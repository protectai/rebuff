import { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";
import { render_prompt_for_pi_detection } from "@/lib/templates";
import {
  ApiFailureResponse,
  LogApiRequest,
  LogApiSuccessResponse,
} from "../../../sdk/dist";
import { runMiddleware, checkApiKey } from "@/lib/detect-helpers";
import { supabaseAdminClient } from "@/lib/supabase";
import { openai } from "@/lib/openai";
import { pinecone } from "@/lib/pinecone-client";
import { getEnvironmentVariable } from "@/lib/general-helpers";
import { v4 as uuidv4 } from "uuid";

const cors = Cors({
  methods: ["POST"],
});

type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

interface LogRow {
  account_id: string;
  canary_word?: string | null;
  completion?: string | null;
  created_at?: string;
  metadata_json?: Json | null;
  user_input: string;
}

async function writeTextAsEmbeddingToPinecone(input: string, user: string) {
  // Create embedding from input
  const emb = await openai.createEmbedding({
    model: "text-embedding-ada-002",
    input: input,
  });

  // Get Pinecone Index
  const index = (await pinecone).Index(
    getEnvironmentVariable("PINECONE_INDEX_NAME")
  );

  // Insert embedding into index
  const upsertRes = await index.upsert({
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

  console.log("Rows upserted", upsertRes);
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
    } as ApiFailureResponse);
  }
  try {
    // Extract the API key from the Authorization header
    const apiKey = req.headers.authorization?.split(" ")[1];

    // Assert that the API key is present
    if (!apiKey) {
      return res.status(401).json({
        error: "unauthorized",
        message: "Missing API key",
      } as ApiFailureResponse);
    }

    // Check if the API key is valid and reduce the account balance
    const { success, message, account_id } = await checkApiKey(apiKey);

    if (!success) {
      return res.status(401).json({
        error: "unauthorized",
        message: message,
      } as ApiFailureResponse);
    }

    // TODO: Add support for logging while using master key
    // Check if account id is present
    if (account_id === null || account_id === undefined) {
      console.log("ignoring log leak request, no account_id found");
      return res.status(200).json({
        success: true,
      } as LogApiSuccessResponse);
    }

    const { user_input, completion, canaryWord } = req.body as LogApiRequest;

    const { data, error } = await supabaseAdminClient.from("leak_logs").insert([
      {
        account_id: account_id,
        user_input: user_input,
        completion: completion,
        canary_word: canaryWord,
      },
    ]);

    if (error) {
      console.error(error);
      return res.status(500).json({
        error: "server_error",
        message: "Internal server error",
      } as ApiFailureResponse);
    }

    await writeTextAsEmbeddingToPinecone(user_input, account_id);

    return res.status(200).json({
      success: true,
    } as LogApiSuccessResponse);
  } catch (error) {
    console.error("Error in log API:");
    console.error(error);
    console.trace();
    return res.status(500).json({
      error: "server_error",
      message: "Internal server error",
    } as ApiFailureResponse);
  }
}
