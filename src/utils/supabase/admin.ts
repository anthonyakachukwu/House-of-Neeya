import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client. Bypasses RLS.
 * Import this ONLY from route handlers / server actions, never from a
 * "use client" file. The env var must NOT start with NEXT_PUBLIC_.
 */
export const createAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
