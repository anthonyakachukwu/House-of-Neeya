import { supabase } from "@/utils/supabase/client";
import type { ProfileValues } from "../schema/profile.schema";

// Profile details live in the auth user's user_metadata. That is fine for
// contact details. Never use user_metadata for permissions (the user can edit it).
export async function updateProfile(values: ProfileValues) {
  const { error } = await supabase().auth.updateUser({
    data: {
      firstName: values.firstName,
      lastName: values.lastName,
      phone: values.phone,
      address: {
        street: values.street,
        city: values.city,
        state: values.state,
      },
    },
  });
  if (error) throw new Error(error.message);
}
