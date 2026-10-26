import { supabase } from "@/utils/supabase/client";
import type { LoginValues, SignupValues } from "../schema/auth.schema";

export async function signUp({ firstName, lastName, email, password }: SignupValues) {
  const { data, error } = await supabase().auth.signUp({
    email,
    password,
    options: {
      data: { firstName, lastName },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw new Error(error.message);

  // No session means the project requires email confirmation first.
  return { needsEmailConfirmation: !data.session };
}

export async function signIn({ email, password }: LoginValues) {
  const { error } = await supabase().auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
}

/** Requires "Allow anonymous sign-ins" in Supabase > Authentication > Sign In / Providers. */
export async function signInAsGuest() {
  const { error } = await supabase().auth.signInAnonymously();
  if (error) throw new Error(error.message);
}

export async function signOut() {
  const { error } = await supabase().auth.signOut();
  if (error) throw new Error(error.message);
}
