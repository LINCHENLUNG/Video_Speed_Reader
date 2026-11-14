import { createClient } from "@supabase/supabase-js";

/**
 * SERVER-ONLY Supabase client using the Secret key (bypasses RLS).
 * Import only from Route Handlers / Server Components — never from a Client Component.
 * Every read through this client must re-impose the per-user filter itself.
 */
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
