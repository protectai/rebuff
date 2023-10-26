import { NextApiRequest, NextApiResponse } from "next";
import { Configuration, OpenAIApi } from "openai";
import { User } from "@supabase/auth-helpers-react";
import Cors from "cors";
import { getSupabaseUser } from "@/lib/supabase";
import { getUserAccountFromDb, logAttempt } from "@/lib/account-helpers";
import { RebuffApi } from "rebuff";
import { PromptResponse } from "@types";
import {
  getEnvironmentVariable,
  renderPromptForSQL,
  tryUntilDeadline,
} from "@/lib/general-helpers";
type MiddlewareCallback = (result: any) => void;

type ErrorResponse = {
  error: string;
  message: string;
};

const cors = Cors({
  methods: ["POST", "GET", "HEAD"],
});

const openai = new OpenAIApi(
  new Configuration({ apiKey: process.env.OPENAI_API_KEY })
);

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

async function callOpenAiToGetSQLQuery(
  inputText: string
): Promise<{ completion: string; error: Error | null }> {
  const renderedPrompt = await renderPromptForSQL(inputText);

  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: renderedPrompt }],
  });

  if (completion.data.choices[0].message === undefined) {
    console.log("completion.data.choices[0].message is undefined");
    return { completion: "", error: new Error("server_error") };
  }

  if (completion.data.choices.length === 0) {
    console.log("completion.data.choices.length === 0");
    return { completion: "", error: new Error("server_error") };
  }
  const proposedSQLQuery = completion.data.choices[0].message.content;
  return { completion: proposedSQLQuery, error: null };
}

const checkSqlBreach = (query: string) => {
  const lowerCaseQuery = query.toLowerCase();

  // Check for INSERT, UPDATE, or DELETE queries
  if (
    lowerCaseQuery.includes("insert") ||
    lowerCaseQuery.includes("update") ||
    lowerCaseQuery.includes("delete")
  ) {
    return true;
  }

  // Check if the query accesses the users table
  if (lowerCaseQuery.includes("users")) {
    return true;
  }

  // Check if the query refers to the passwords field
  if (lowerCaseQuery.includes("passwords")) {
    return true;
  }

  return false;
};

async function getResponse(
  apikey: string,
  userInput: string,
  runHeuristicCheck: boolean,
  runVectorCheck: boolean,
  runLanguageModelCheck: boolean,
  maxHeuristicScore: number,
  maxModelScore: number,
  maxVectorScore: number
): Promise<PromptResponse> {
  if (
    !(
      typeof userInput === "string" &&
      typeof runHeuristicCheck === "boolean" &&
      typeof runVectorCheck === "boolean" &&
      typeof runLanguageModelCheck === "boolean" &&
      typeof maxHeuristicScore === "number" &&
      typeof maxModelScore === "number" &&
      typeof maxVectorScore === "number"
    )
  ) {
    throw new Error("Invalid payload");
  }
  // get baseURL of server
  const rebuffApiUrl = getEnvironmentVariable("REBUFF_API") || undefined;
  // use rebuff to check if this is a prompt injection
  const rebuff = new RebuffApi({ apiKey: apikey, apiUrl: rebuffApiUrl });
  const detection = await rebuff.detectInjection({
    userInput,
    maxHeuristicScore,
    maxVectorScore,
    maxModelScore,
    runHeuristicCheck,
    runVectorCheck,
    runLanguageModelCheck,
  });

  if (detection.injectionDetected) {
    //if it is a prompt injection, return the metrics and don't proceed
    return {
      detection,
      breach: false,
      output: "Prompt injection detected",
      // eslint-disable-next-line camelcase
      canary_word: "",
      // eslint-disable-next-line camelcase
      canary_word_leaked: false,
    };
  }
  // if it is not a prompt injection, add a canary word to the prompt before we send it to the LLM
  const [promptWithCanary, canaryWord] = rebuff.addCanaryWord(userInput);
  const LLMResponse = await tryUntilDeadline(
    5000,
    callOpenAiToGetSQLQuery(promptWithCanary),
    (response: any) =>
      typeof response.completion === "string" && response.completion.length > 0
  );
  if (!LLMResponse.completion) {
    console.error("No response from LLM");
    if (LLMResponse.error) {
      console.error(LLMResponse.error);
    }
    throw new Error("No response from LLM");
  }
  // check if the canary word is in the response
  const canaryWordLeaked = rebuff.isCanaryWordLeaked(
    userInput,
    LLMResponse.completion,
    canaryWord
  );
  const sqlBreach = checkSqlBreach(LLMResponse.completion);

  //if we detected a breach, log it so we block further attempts that are similar
  if (sqlBreach) {
    console.log(`SQL breach detected!`);
    await rebuff.logLeakage(userInput, {
      completion: LLMResponse.completion,
      // eslint-disable-next-line camelcase
      canary_word: canaryWord,
    });
  }
  return {
    detection,
    breach: canaryWordLeaked || sqlBreach,
    output: LLMResponse.completion,
    // eslint-disable-next-line camelcase
    canary_word: canaryWord,
    // eslint-disable-next-line camelcase
    canary_word_leaked: canaryWordLeaked,
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response | ErrorResponse>
) {
  await runMiddleware(req, res, cors);
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ error: "not_allowed", message: "Method not allowed" });
  }
  let user: User;
  try {
    user = await getSupabaseUser(req, res);
    if (!user) {
      throw new Error("unauthorized");
    }
  } catch (e) {
    return res
      .status(401)
      .json({ error: "unauthorized", message: "Unauthorized" });
  }

  try {
    // check payload
    const {
      userInput,
      runHeuristicCheck = true,
      runVectorCheck = true,
      runLanguageModelCheck = true,
      maxHeuristicScore = 0.75,
      maxModelScore = 0.9,
      maxVectorScore = 0.9,
    } = req.body;
    const { apikey } = await getUserAccountFromDb(user);
    const response = await getResponse(
      apikey,
      userInput,
      runHeuristicCheck,
      runVectorCheck,
      runLanguageModelCheck,
      maxHeuristicScore,
      maxModelScore,
      maxVectorScore
    );
    logAttempt(
      user,
      {
        apikey,
        userInput,
        runHeuristicCheck,
        runVectorCheck,
        runLanguageModelCheck,
        maxHeuristicScore,
        maxModelScore,
        maxVectorScore,
      },
      response
    );
    return res.status(200).json(response as any);
    // Get user's apikey
    //TODO: allow the user to define the parameters for defining an injection
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ error: "server_error", message: "something went wrong" });
  }
}
