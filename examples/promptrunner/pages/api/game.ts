import { NextApiRequest, NextApiResponse } from "next";
import { AppState } from "@/interfaces/game";
import { characterQuips } from "@/lib/quips";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const quips = characterQuips["Tech Bro"];

  // Fetch or compute data for gameState
  const gameState = {
    level: 1,
    attempts: 0,
    character: {
      name: "",
      image: "",
      response: "",
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
}
