import { NextApiRequest, NextApiResponse } from "next";
import { Configuration, OpenAIApi } from "openai";
import { User } from "@supabase/auth-helpers-react";
import Cors from "cors";
import { getSupabaseUser } from "@/lib/supabase";
import { getUserAccountFromDb } from "@/lib/account-helpers";
import { Rebuff } from "@/lib/rebuff";
import { PromptResponse } from "@/lib/playground";
import {
  getEnvironmentVariable,
  render_prompt_for_sql,
  tryUntilDeadline,
} from "@/lib/general-helpers";

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

async function callOpenAiToGetSQLQuery(
  inputText: string
): Promise<{ completion: string; error: Error | null }> {
  const rendered_prompt = await render_prompt_for_sql(inputText);

  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: rendered_prompt }],
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
    let {
      userInput,
      runHeuristicCheck = true,
      runVectorCheck = true,
      runLanguageModelCheck = true,
      maxHeuristicScore = 0.75,
      maxModelScore = 0.9,
      maxVectorScore = 0.9,
    } = req.body;
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
      return res
        .status(400)
        .json({ error: "bad_request", message: "Bad request" });
    }

    // Get user's apikey
    const { apikey } = await getUserAccountFromDb(user);
    let response: PromptResponse;
    // get baseURL of server
    const rebuffApiUrl = getEnvironmentVariable("REBUFF_API") || undefined;
    // use rebuff to check if this is a prompt injection
    const rebuff = new Rebuff(apikey, rebuffApiUrl);
    const [metrics, is_injection] = await rebuff.is_injection_detected(
      userInput,
      maxHeuristicScore,
      maxVectorScore,
      maxModelScore,
      runHeuristicCheck,
      runVectorCheck,
      runLanguageModelCheck
    );
    //TODO: allow the user to define the parameters for defining an injection
    if (is_injection) {
      //if it is a prompt injection, return the metrics and don't proceed
      response = {
        metrics,
        is_injection,
        output: "Prompt injection detected",
        canary_word: "",
        canary_word_leaked: false,
      };
      return res.status(200).json(response as any);
    }
    // if it is not a prompt injection, add a canary word to the prompt before we send it to the LLM
    const [prompt_with_canary, canary_word] = rebuff.add_canaryword(userInput);
    const llm_response = await tryUntilDeadline(
      5000,
      callOpenAiToGetSQLQuery(prompt_with_canary),
      (response: any) =>
        typeof response.completion === "string" &&
        response.completion.length > 0
    );
    if (!llm_response.completion) {
      console.error("No response from LLM");
      if (llm_response.error) {
        console.error(llm_response.error);
      }
      return res.status(500).json({
        error: "server_error",
        message: "something went wrong talking to LLM",
      });
    }
    // check if the canary word is in the response
    const canary_word_leaked = rebuff.is_canaryword_leaked(
      userInput,
      llm_response.completion,
      canary_word
    );
    response = {
      metrics,
      is_injection,
      output: llm_response.completion,
      canary_word,
      canary_word_leaked,
    };
    return res.status(200).json(response as any);
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ error: "server_error", message: "something went wrong" });
  }
}
