import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { getEnvironmentVariable } from "@/lib/general-helpers";
import { NextApiRequest, NextApiResponse } from "next";

export const supabaseAnonClient = createClient(
  getEnvironmentVariable("NEXT_PUBLIC_SUPABASE_URL"),
  getEnvironmentVariable("NEXT_PUBLIC_SUPABASE_ANON_KEY")
);

export const supabaseAdminClient = createClient(
  getEnvironmentVariable("NEXT_PUBLIC_SUPABASE_URL"),
  getEnvironmentVariable("SUPABASE_SERVICE_KEY")
);

export const getSupabaseUser = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  // Create authenticated Supabase Client
  const supabase = createServerSupabaseClient({ req, res });

  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If no session, return not authenticated
  if (!session) {
    throw new Error("not authenticated");
  }

  // Get user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is null, return not authenticated
  if (!user) {
    throw new Error("not authenticated");
  }
  return user;
};
