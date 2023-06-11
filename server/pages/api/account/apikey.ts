import { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import generateApiKey from "@/utils/apikeys";
import { supabaseAdminClient } from "@/lib/supabase";
type MiddlewareCallback = (result: any) => void;

const cors = Cors({
  methods: ["POST", "GET", "HEAD"],
});

function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: (
    req: NextApiRequest,
    res: NextApiResponse,
    callback: MiddlewareCallback
  ) => void
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

const refreshUserApikeyInDb = async (
  user: any,
  apikey: string
): Promise<void> => {
  const { error } = await supabaseAdminClient
    .from("accounts")
    // eslint-disable-next-line camelcase
    .update({ user_apikey: apikey })
    .eq("id", user.id);
  if (error) {
    console.error(`Error updating apikey for user ${user.id}`);
    console.error(error);
    throw new Error("Error updating apikey");
  }
};

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
  } = await supabase.auth.getUser();

  // If user is null, return not authenticated
  if (!user) {
    return res
      .status(401)
      .json({ error: "not_authenticated", message: "not authenticated" });
  }
  try {
    const apikey = generateApiKey();
    await refreshUserApikeyInDb(user, apikey);
    return res.status(200).json({ apikey });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "server_error", message: "something went wrong" });
  }
}
