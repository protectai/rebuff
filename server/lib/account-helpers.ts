import generateApiKey from "@/utils/apikeys";
import { supabaseAdminClient } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { PromptResponse, AppState } from "@types";

export const createNewAccountInDb = async (user: any): Promise<AppState> => {
  const { data, error } = await supabaseAdminClient
    .from("accounts")
    .insert({
      id: user.id,
      // eslint-disable-next-line camelcase
      user_apikey: generateApiKey(),
      name: user.email,
      // eslint-disable-next-line camelcase
      credits_total_cents_10k: 1000,
    })
    .select("*");
  if (error) {
    console.error(`Error creating account for user ${user.id}`);
    console.error(error);
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw error;
  }
  return {
    apikey: data[0].user_apikey,
    credits: data[0].credits_total_cents_10k,
  } as AppState;
};

export const getUserAccountFromDb = async (user: any): Promise<AppState> => {
  const { data, error } = await supabaseAdminClient
    .from("accounts")
    .select("user_apikey, credits_total_cents_10k")
    .eq("id", user.id)
    .single();

  if (error && error?.code === "PGRST116") {
    console.log("No account found for user, creating new account");
    return createNewAccountInDb(user);
  }
  if (error) {
    console.error("Error getting account for user");
    console.error(error);
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw error;
  }
  return {
    apikey: data.user_apikey,
    credits: data.credits_total_cents_10k,
  } as AppState;
};

export const refreshUserApikeyInDb = async (
  user: any,
  apikey: string
): Promise<void> => {
  const { error } = await supabaseAdminClient
    .from("accounts")
    // eslint-disable-next-line camelcase
    .update({ user_apikey: apikey })
    .eq("id", user.id);
  if (error) {
    console.error(`Error updating apikey for user ${user.id}`);
    console.error(error);
    throw new Error("Error updating apikey");
  }
};

export const getUserStats = async (user: any): Promise<AppState["stats"]> => {
  let stats = {
    breaches: { total: 0, user: 0 },
    detections: 0,
    requests: 0,
  } as AppState["stats"];
  const { data, error } = await supabaseAdminClient.rpc(
    "get_attempt_aggregates",
    // eslint-disable-next-line camelcase
    { user_id: user.id }
  );
  if (error) {
    console.error(`Error getting stats for user ${user.id}`);
    console.error(error);
    throw new Error("Error getting stats");
  }
  const updateObjectValues = (init: any, fromDb: any) => {
    for (const key in init) {
      if (fromDb.hasOwnProperty(key)) {
        if (typeof fromDb[key] === "number" && isFinite(fromDb[key])) {
          init[key] = fromDb[key];
        } else if (
          typeof fromDb[key] === "object" &&
          typeof init[key] === "object"
        ) {
          updateObjectValues(init[key], fromDb[key]);
        }
      }
    }
    return init as AppState["stats"];
  };
  stats = updateObjectValues(stats, data);
  return stats;
};

export const logAttempt = async (
  user: User,
  request: any,
  response: PromptResponse
): Promise<void> => {
  const { error } = await supabaseAdminClient.from("attempts").insert({
    // eslint-disable-next-line camelcase
    user_id: user.id,
    request: request,
    response: response,
    breach: response.breach,
  });
  if (error) {
    console.error(`Error logging attempt for user ${user.id}`);
    console.error(error);
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw error;
  }
};
