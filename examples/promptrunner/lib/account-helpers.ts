import { supabaseAdminClient } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import {
  adjectives,
  animals,
  uniqueNamesGenerator,
} from "unique-names-generator";

function generateAnimalName() {
  return uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
  });
}

export async function getOrCreateProfile(uid: string) {
  let { data: profile, error } = await supabaseAdminClient
    .from("profiles")
    .select("*")
    .eq("id", uid);

  if (error) throw error;
  if (profile && profile.length == 1) {
    return profile[0];
  }

  if (profile && profile.length > 1) {
    throw new Error("Multiple profiles found for user");
  }

  // if not exists, create a new one
  const { data: newProfile, error: insertError } = await supabaseAdminClient
    .from("profiles")
    .insert([{ id: uid, level: 1, name: generateAnimalName() }])
    .select()
    .single();

  if (insertError) throw insertError;
  return newProfile; // return the newly created profile
}

export const logAttempt = async (
  user: User,
  request: any,
  response: PromptResponse
): Promise<void> => {
  const { error } = await supabaseAdminClient.from("attempts").insert({
    user_id: user.id,
    request: request,
    response: response,
    breach: response.breach,
  });
  if (error) {
    console.error(`Error logging attempt for user ${user.id}`);
    console.error(error);
    throw error;
  }
};
