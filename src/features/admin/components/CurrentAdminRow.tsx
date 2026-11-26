"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthUser } from "@/features/auth/hooks/useAuthUser";

/** The signed-in admin, for the Settings > Admin Users section. */
const CurrentAdminRow = () => {
  const { profile } = useAuthUser();
  if (!profile) return null;

  return (
    <div className="flex items-center gap-2 py-2 min-w-0">
      <Avatar>
        <AvatarFallback className="bg-accent text-background">
          {profile.initials}
        </AvatarFallback>
      </Avatar>
      <div className="grid flex-1 min-w-0 text-left text-sm leading-tight tracking-widest">
        <span className="truncate font-medium text-base font-serif">
          {profile.displayName}
        </span>
        <span className="truncate text-[10px] font-light">{profile.email}</span>
      </div>
      <span className="bg-accent/10 text-accent px-2 py-1 rounded-full text-[10px] uppercase">
        You
      </span>
    </div>
  );
};

export default CurrentAdminRow;
