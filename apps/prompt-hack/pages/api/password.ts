import { NextApiRequest, NextApiResponse } from "next";
import { cors, runMiddleware } from "@/lib/middleware";
import { getProfile, incrementLevel } from "@/lib/account-helpers";
import { GameCharacters } from "@/lib/characters";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, cors);

  // Validate that only a  POST is made
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ error: "not_allowed", message: "Method not allowed" });
  }

  // Check if X-Uid header is set
  const uid = req.headers["x-uid"];
  if (!uid || typeof uid !== "string") {
    return res
      .status(401)
      .json({ error: "unauthorized", message: "X-Uid header is missing" });
  }

  let profile;
  try {
    profile = await getProfile(uid);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "internal_error", message: "An internal error occurred" });
  }

  const { password } = req.body;

  // Get character
  const gameChar = GameCharacters[profile.level];

  // Check if password is correct
  if (password == gameChar.password) {
    await incrementLevel(uid);
    // return 200
    return res.status(200).json({ message: "Correct password!" });
  } else {
    // return 400
    return res.status(400).json({ message: "Incorrect password!" });
  }
}
