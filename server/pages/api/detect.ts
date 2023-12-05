import { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";
import { rebuff } from "@/lib/rebuff";
import {
  runMiddleware,
  checkApiKeyAndReduceBalance,
} from "@/lib/detect-helpers";
import { ApiFailureResponse } from "@types";

const cors = Cors({
  methods: ["POST"],
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  await runMiddleware(req, res, cors);
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "not_allowed",
      message: "Method not allowed",
    } as ApiFailureResponse);
  }
  try {
    // Extract the API key from the Authorization header
    const apiKey = req.headers.authorization?.split(" ")[1];

    // Assert that the API key is present
    if (!apiKey) {
      return res.status(401).json({
        error: "unauthorized",
        message: "Missing API key",
      } as ApiFailureResponse);
    }

    // Check if the API key is valid and reduce the account balance
    const { success, message } = await checkApiKeyAndReduceBalance(apiKey);

    if (!success) {
      return res.status(401).json({
        error: "unauthorized",
        message: message,
      } as ApiFailureResponse);
    }

    const {
      userInputBase64,
      runHeuristicCheck = true,
      runVectorCheck = true,
      runLanguageModelCheck = true,
      maxHeuristicScore = null,
      maxModelScore = null,
      maxVectorScore = null,
    } = req.body;
    try {
      const resp = await rebuff.detectInjection({
        userInput: "",
        userInputBase64,
        runHeuristicCheck,
        runVectorCheck,
        runLanguageModelCheck,
        maxHeuristicScore,
        maxModelScore,
        maxVectorScore,
      });
      return res.status(200).json(resp);
    } catch (error) {
      console.error("Error in detecting injection:");
      console.error(error);
      return res.status(400).json({
        error: "bad_request",
        message: error.message,
      } as ApiFailureResponse);
    }
  } catch (error) {
    console.error("Error in detect API:");
    console.error(error);
    return res.status(500).json({
      error: "server_error",
      message: "Internal server error",
    } as ApiFailureResponse);
  }
}
