import { NextApiRequest, NextApiResponse } from "next";
import { AppState } from "@/interfaces/game";
import { cors, runMiddleware } from "@/lib/middleware";
import { User } from "@supabase/supabase-js";
import { getSupabaseUser } from "@/lib/supabase";
import { getOrCreateProfile } from "@/lib/account-helpers";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, cors);

  // Validate that only a GET or POST is made
  if (req.method !== "GET" && req.method !== "POST") {
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
    profile = await getOrCreateProfile(uid);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "internal_error", message: "An internal error occurred" });
  }

  // If POST, get the input prompt from request
  const { userInput } = req.body;

  // TODO: Detect prompt injection with Rebuff
  const isPromptInjection = true;
  const isPasswordLeaked = false;

  // Get user level
  const userLevel = 1;

  // Get character
  const gameCharacter = GameCharacters[userLevel];

  let characterResponse = "";
  if (isPasswordLeaked) {
    characterResponse = gameCharacter.getPasswordResponse();
  } else {
    characterResponse = gameCharacter.getRandomQuip();
  }

  // Fetch or compute data for gameState
  const gameState = {
    level: 1,
    attempts: 0,
    character: {
      name: gameCharacter.name,
      image: gameCharacter.imageUrl,
      response: characterResponse,
    },
  };

  // Fetch or compute data for leaderboardState
  const leaderboardState = {
    // ...
  };

  // Fetch or compute data for playersEventState
  const playersEventState = {
    // ...
  };

  const promptLoading = false;

  // Construct the appState
  const appState: AppState = {
    gameState,
    leaderboardState,
    playersEventState,
    promptLoading,
  };

  // Return the appState
  return res.status(200).json(appState);
}
