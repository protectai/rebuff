import { NextApiRequest, NextApiResponse } from "next";
import { AppState, Attempt } from "@/interfaces/game";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
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

    // Respond with appState
    res.status(200).json(appState);
  } catch (error) {
    res.status(500).json({ statusCode: 500, message: error.message });
  }
}
