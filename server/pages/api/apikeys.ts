import { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "crypto";
import { v4 as uuidv4 } from "uuid";

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
  if (req.method === "GET") {
    res.status(200).json({ apikey: "TEST" });
    return;
  }
  // POST request, we refresh the APIKEY and then return it
  const apikey = generateApiKey();
  if (req.method === "GET") {
    res.status(200).json({ apikey });
    return;
  }
  //   const { data, error } = await supabaseAdminClient
  //   .from("profiles")
  //   .select("id, username")
  //   .in("id", ids);
}
