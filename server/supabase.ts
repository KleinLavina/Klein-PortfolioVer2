import { createClient, type PostgrestError, type SupabaseClient } from "@supabase/supabase-js";

let serverSupabase: SupabaseClient | null = null;

function getEnvValue(...names: string[]): string {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) {
      return value;
    }
  }
  return "";
}

export function isServerSupabaseConfigured(): boolean {
  return Boolean(
    getEnvValue("SUPABASE_URL", "VITE_SUPABASE_URL") &&
      getEnvValue("SUPABASE_SERVICE_ROLE_KEY"),
  );
}

export function getServerSupabase(): SupabaseClient {
  if (serverSupabase) {
    return serverSupabase;
  }

  const supabaseUrl = getEnvValue("SUPABASE_URL", "VITE_SUPABASE_URL");
  const serviceRoleKey = getEnvValue("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Supabase server storage is not configured. Set SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  serverSupabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return serverSupabase;
}

export function unwrapSupabaseResult<T>(
  data: T,
  error: PostgrestError | null,
  context: string,
): T {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }

  return data;
}
