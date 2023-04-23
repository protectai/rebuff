import type { NextApiRequest, NextApiResponse } from "next";
import { pinecone } from "lib/pinecone-client";
import { Configuration, OpenAIApi } from "openai";
import { v4 as uuidv4 } from "uuid";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

const openai = new OpenAIApi(
  new Configuration({ apiKey: process.env.OPENAI_API_KEY })
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Create authenticated Supabase Client
  const supabase = createServerSupabaseClient({ req, res });
  // Check if we have a session
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session)
      return res.status(401).json({
        error: "not_authenticated",
        description: "Please login and try again.",
      });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Please try again, an unknown error occurred." });
  }

  const query = req.query;
  const { input } = query as { input: string };

  // Fail if "input" isn't provided
  if (!input) {
    res.status(400).json({ error: 'Missing "input" parameter' });
  }

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
            user: "test-user",
          },
        },
      ],
    },
  });

  // Query similar embeddings
  const queryResponse = await index.query({
    queryRequest: {
      vector: emb.data.data[0].embedding,
      topK: 3,
      includeValues: true,
    },
  });

  res.status(200).json({ output: queryResponse });
}
