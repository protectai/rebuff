import { NextApiRequest, NextApiResponse } from "next";
import { AppState } from "@/interfaces/game";
import { cors, runMiddleware } from "@/lib/middleware";
import { User } from "@supabase/supabase-js";
import { getSupabaseUser } from "@/lib/supabase";
import {
  getLeaderboardEntries,
  getOrCreateProfile,
  incrementUserAttempts,
} from "@/lib/account-helpers";
import { openai } from "@/lib/openai";
import { character_prompt } from "@/lib/templates";
import { GameCharacters } from "@/lib/characters";

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
  // Log to console that a request from uid is being processed
  console.log(`Request from uid: ${uid}`);

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
  let charResponse = "";
  // Get character
  const gameChar = GameCharacters[profile.level];

  if (req.method == "POST") {
    const { userInput } = req.body;

    await incrementUserAttempts(uid);

    // Make request to OpenAI API
    try {
      const prompt = character_prompt(
        gameChar.personality,
        gameChar.password,
        userInput,
        gameChar.quips
      );
      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        temperature: 1,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      if (completion.data.choices[0].message === undefined) {
        console.log("completion.data.choices[0].message is undefined");
        return { completion: "", error: "server_error" };
      }

      if (completion.data.choices.length === 0) {
        console.log("completion.data.choices.length === 0");
        return { completion: "", error: "server_error" };
      }

      charResponse = completion.data.choices[0].message.content;
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "internal_error",
        message: "An internal error occurred",
      });
    }
  }

  // Fetch or compute data for gameState
  const gameState = {
    level: 1,
    attempts: 0,
    character: {
      name: gameChar.name,
      image: gameChar.imageUrl,
      response: charResponse,
    },
  };

  // Fetch or compute data for leaderboardState
  const entries = await getLeaderboardEntries();
  const leaderboardState = {
    entries,
  };

  // Fetch or compute data for playersEventState
  const playersEventState = {};

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
