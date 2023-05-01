import { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "crypto";
import { v4 as uuidv4 } from "uuid";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

const supabaseAdminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_KEY || ""
);

const cors = Cors({
  methods: ["POST", "GET", "HEAD"],
});

function generateApiKey(length: number = 64): string {
  const apiKey = randomBytes(length).toString("hex");
  return apiKey;
}

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  await runMiddleware(req, res, cors);
  if (!["POST", "GET"].includes(req.method || "")) {
    return res
      .status(405)
      .json({ error: "not_allowed", message: "Method not allowed" });
  }
  // Create authenticated Supabase Client
  const supabase = createServerSupabaseClient({ req, res });

  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If no session, return not authenticated
  if (!session) {
    return res
      .status(401)
      .json({ error: "not_authenticated", message: "not authenticated" });
  }
  if (req.method === "GET" && !req.query.slug) {
    // check if a valid row exists in the accounts table and credits table
    // if not found, create a new row in the accounts table and credits table
    // return appstate to the UI
    return res.status(200).json({
      attempts: [],
      apikey: "",
      credits: {
        used: 0,
        total: 0,
      },
      loading: false,
      stats: {
        last24h: {
          attempts: 0,
          breaches: 0,
        },
        last7d: {
          attempts: 0,
          breaches: 0,
        },
        alltime: {
          attempts: 0,
          breaches: 0,
        },
      },
    });
  } else if (
    req.method === "POST" &&
    req.query.slug &&
    Array.isArray(req.query.slug) &&
    req.query.slug.length === 1 &&
    req.query.slug[0] === "apikey"
  ) {
    const apikey = generateApiKey();
    return res.status(200).json({ apikey });
  }
  return res.status(404);
}
