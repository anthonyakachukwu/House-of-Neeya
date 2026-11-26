"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/utils/supabase/client";
import { getUserProfile } from "../lib/userProfile";

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const client = supabase();

    client.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const profile = useMemo(() => getUserProfile(user), [user]);

  // Role lives in app_metadata (users cannot edit it), same as the RLS policies
  const isAdmin = user?.app_metadata?.role === "admin";

  return { user, profile, loading, isAdmin };
}
