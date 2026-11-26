import type { User } from "@supabase/supabase-js";

export type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  /** Full name, or the email name, or "Guest". Never empty. */
  displayName: string;
  /** First name, falling back to displayName. For greetings. */
  shortName: string;
  email: string;
  phone: string;
  initials: string;
  isGuest: boolean;
  address: { street: string; city: string; state: string };
};

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");

/** Reads the signed-in user's details from Supabase auth (user_metadata). */
export function getUserProfile(user: User | null): UserProfile | null {
  if (!user) return null;

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const address = (meta.address ?? {}) as Record<string, unknown>;
  const firstName = text(meta.firstName);
  const lastName = text(meta.lastName);
  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  const isGuest = Boolean(user.is_anonymous);
  const email = user.email ?? "";
  const displayName =
    fullName || (isGuest ? "Guest" : email.split("@")[0]) || "Account";
  const initials = (
    fullName
      ? [firstName, lastName].filter(Boolean).map((part) => part[0])
      : [displayName[0]]
  )
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return {
    id: user.id,
    firstName,
    lastName,
    fullName,
    displayName,
    shortName: firstName || displayName,
    email,
    phone: text(meta.phone),
    initials,
    isGuest,
    address: {
      street: text(address.street),
      city: text(address.city),
      state: text(address.state),
    },
  };
}
