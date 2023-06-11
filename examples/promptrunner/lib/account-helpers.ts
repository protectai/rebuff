import { supabaseAdminClient } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import {
  adjectives,
  animals,
  uniqueNamesGenerator,
} from "unique-names-generator";
import { LeaderboardEntry } from "@/interfaces/game";

function generateAnimalName() {
  return uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
  });
}

export async function getProfile(uid: string) {
  let { data: profile, error } = await supabaseAdminClient
    .from("profiles")
    .select("*")
    .eq("id", uid);

  if (error) throw error;
  if (!profile || profile.length != 1) {
    throw new Error("Profile not found");
  }

  return profile[0];
}

export async function getLeaderboardEntries() {
  let { data: profiles, error } = await supabaseAdminClient
    .from("profiles")
    .select("*");

  if (error) throw error;
  if (!profiles) {
    throw new Error("Profiles not found");
  }

  // Create a LeaderboardEntry for each profile
  const leaderboardEntries = profiles.map((profile) => {
    return {
      name: profile.name,
      attempts: profile.attempts,
      level: profile.level,
      date: profile.last_updated,
    } as LeaderboardEntry;
  });

  // Rank by highest level then by lowest attempts
  leaderboardEntries.sort((a, b) => {
    if (a.level > b.level) return -1;
    if (a.level < b.level) return 1;
    if (a.attempts < b.attempts) return -1;
    if (a.attempts > b.attempts) return 1;
    return 0;
  });

  return leaderboardEntries;
}

export async function incrementUserAttempts(uid: string) {
  // TODO: use atomic increment (like RPC)

  let { data: profile, error } = await supabaseAdminClient
    .from("profiles")
    .select("attempts")
    .eq("id", uid);

  if (error) throw error;

  if (!profile || profile.length > 1 || profile.length == 0) {
    throw new Error("Multiple or no profiles found for user");
  }

  const current_time = new Date();

  const { error: insertError } = await supabaseAdminClient
    .from("profiles")
    .update({ attempts: profile[0].attempts + 1, last_updated: current_time })
    .eq("id", uid);

  if (insertError) throw insertError;
}

export async function incrementLevel(uid: string) {
  // TODO: use atomic increment (like RPC)

  let { data: profile, error } = await supabaseAdminClient
    .from("profiles")
    .select("level")
    .eq("id", uid);

  if (error) throw error;

  if (!profile || profile.length > 1 || profile.length == 0) {
    throw new Error("Multiple or no profiles found for user");
  }

  const { error: insertError } = await supabaseAdminClient
    .from("profiles")
    .update({ level: profile[0].level + 1 })
    .eq("id", uid);

  if (insertError) throw insertError;
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

// export const logAttempt = async (
//   user: User,
//   request: any,
//   response: PromptResponse
// ): Promise<void> => {
//   const { error } = await supabaseAdminClient.from("attempts").insert({
//     user_id: user.id,
//     request: request,
//     response: response,
//     breach: response.breach,
//   });
//   if (error) {
//     console.error(`Error logging attempt for user ${user.id}`);
//     console.error(error);
//     throw error;
//   }
// };
