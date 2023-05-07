import { createClient } from "@supabase/supabase-js";
import { getEnvironmentVariable } from "@/lib/general-helpers";

export const supabaseAnonClient = createClient(
  getEnvironmentVariable("NEXT_PUBLIC_SUPABASE_URL"),
  getEnvironmentVariable("NEXT_PUBLIC_SUPABASE_ANON_KEY")
);

export const supabaseAdminClient = createClient(
  getEnvironmentVariable("NEXT_PUBLIC_SUPABASE_URL"),
  getEnvironmentVariable("SUPABASE_SERVICE_KEY")
);
