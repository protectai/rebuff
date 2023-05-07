import { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { AppState } from "@/interfaces/ui";
import { generateApiKey } from "@/utils/apikeys";
import {
  getUserAccountFromDb,
  refreshUserApikeyInDb,
  createNewAccountInDb,
} from "@/lib/account-helpers";
import { supabaseAdminClient, supabaseAnonClient } from "@/lib/supabase";

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
  // Get user
  const {
    data: { user },
  } = await supabaseAnonClient.auth.getUser();

  // If user is null, return not authenticated
  if (!user) {
    return res
      .status(401)
      .json({ error: "not_authenticated", message: "not authenticated" });
  }
  try {
    switch (req.method) {
      case "GET":
        if (!req.query.slug) {
          //only handle the /api/account endpoint
          const appState = await getUserAccountFromDb(user);
          return res.status(200).json(appState);
        }
      case "POST":
        if (
          //only handle /api/account/apikey endpoint
          Array.isArray(req.query.slug) &&
          req.query.slug.length === 1 &&
          req.query.slug[0] === "apikey"
        ) {
          const apikey = generateApiKey();
          await refreshUserApikeyInDb(user, apikey);
          return res.status(200).json({ apikey });
        }
        console.log(req.query.slug);
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "server_error", message: "something went wrong" });
  }
  console.log(req.method, req.query.slug);
  return res.status(404);
}
