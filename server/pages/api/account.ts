import { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "crypto";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { AppState } from "@/interfaces/ui";

const supabaseAdminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_KEY || ""
);

const cors = Cors({
  methods: ["POST", "GET", "HEAD"],
});

<<<<<<< Updated upstream
function generateApiKey(length: number = 16): string {
  const apiKey = randomBytes(length).toString("hex");
  return apiKey;
=======
function generateApiKey(length: number = 64): string {
  // Generate half the number of bytes, since each byte is represented by two hexadecimal characters
  const numBytes = Math.ceil(length / 2);
  const apiKey = randomBytes(numBytes).toString("hex");
  // Truncate the result to the desired length in case of odd length values
  return apiKey.substring(0, length);
>>>>>>> Stashed changes
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
  console.log(req.query.slug);
  if (req.method === "GET" && !req.query.slug) {
    // check if a valid row exists in the accounts table and credits table
    try {
      const appState = await getAppStateFromDb(user);
      return res.status(200).json(appState);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: "server_error", message: "something went wrong" });
    }
  } else if (
    req.method === "POST" &&
    req.query.slug &&
    Array.isArray(req.query.slug) &&
    req.query.slug.length === 1 &&
    req.query.slug[0] === "apikey"
  ) {
    const apikey = generateApiKey();
    await refreshApikeyForUser(user, apikey);
    return res.status(200).json({ apikey });
  }
  return res.status(404);
}

const refreshApikeyForUser = async (
  user: any,
  apikey: string
): Promise<void> => {
  const appState = {} as AppState;
  const { data, error } = await supabaseAdminClient
    .from("accounts")
    .update({ apikey })
    .eq("id", user.id);
  if (error) {
    console.error(`Error updating apikey for user ${user.id}`);
    console.error(error);
    throw new Error("Error updating apikey");
  }
};

const getAppStateForUser = async (user: any): Promise<AppState> => {
  const appState = {} as AppState;
  const { data: accountData, error: accountError } = await supabaseAdminClient
    .from("accounts")
    .select("apikey, credits_total_cents")
    .eq("id", user.id)
    .single();

  if (accountError) {
    console.error(accountError);
  }
<<<<<<< Updated upstream
  if (!data || !data.apikey) {
    throw new Error("No account found");
  }
  if (!data.credits_total_cents) {
    throw new Error("No credits found");
  }
  appState.apikey = data.apikey;
  appState.credits = data.credits_total_cents;
=======
  if (!accountData) {
    console.error(`Error getting account for user ${user.id}`);
    throw new Error("No account found");
  }

  const apikey = accountData.apikey;

  const { data: creditData, error: creditError } = await supabaseAdminClient
    .from("credits")
    .select("total_credits_cents")
    .eq("id", user.id)
    .single();

  if (creditError) {
    console.error(`Error getting account for user ${user.id}`);
    console.error(creditError);
  }

  // Update the conditional check here
  if (!creditData || typeof creditData.total_credits_cents === "undefined") {
    throw new Error("No credits found");
  }
  appState.apikey = apikey;
  appState.credits = creditData.total_credits_cents;
>>>>>>> Stashed changes
  return appState;
};

const getAppStateFromDb = async (user: any): Promise<AppState> => {
  let appState = {} as AppState;
  try {
    appState = await getAppStateForUser(user);
    return appState;
  } catch (error) {
    console.error(error);
  }
  // if not found, create a new row in the accounts table and credits table
  const { error: accountsErr } = await supabaseAdminClient
    .from("accounts")
    .insert([
      {
        id: user.id,
        apikey: generateApiKey(),
        name: user.email,
        credits_total_cents: 1000,
      },
    ])
    .select();
  if (accountsErr) {
    console.error(accountsErr);
    throw new Error("Error creating account");
  }
  return await getAppStateForUser(user);
};
