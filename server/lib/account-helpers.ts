import { AppState } from "@/interfaces/ui";
import { generateApiKey } from "@/utils/apikeys";
import { supabaseAdminClient } from "@/lib/supabase";

export const getUserAccountFromDb = async (user: any): Promise<AppState> => {
  const { data, error } = await supabaseAdminClient
    .from("accounts")
    .select("user_apikey, credits_total_cents")
    .eq("id", user.id)
    .single();

  if (error && error?.code === "PGRST116") {
    console.log("No account found for user, creating new account");
    return await createNewAccountInDb(user);
  }
  if (error) {
    console.error("Error getting account for user");
    console.error(error);
    throw error;
  }
  return {
    apikey: data.user_apikey,
    credits: data.credits_total_cents,
  } as AppState;
};

export const createNewAccountInDb = async (user: any): Promise<AppState> => {
  const { data, error } = await supabaseAdminClient
    .from("accounts")
    .insert({
      id: user.id,
      user_apikey: generateApiKey(),
      name: user.email,
      credits_total_cents: 1000,
    })
    .select("*");
  if (error) {
    console.error(`Error creating account for user ${user.id}`);
    console.error(error);
    throw error;
  }
  return {
    apikey: data[0].user_apikey,
    credits: data[0].credits_total_cents,
  } as AppState;
};

export const refreshUserApikeyInDb = async (
  user: any,
  apikey: string
): Promise<void> => {
  const { data, error } = await supabaseAdminClient
    .from("accounts")
    .update({ user_apikey: apikey })
    .eq("id", user.id);
  if (error) {
    console.error(`Error updating apikey for user ${user.id}`);
    console.error(error);
    throw new Error("Error updating apikey");
  }
};
