"use client";

import { Search, X } from "lucide-react";
import Input from "@/components/ui/Input";
import cn from "@/lib/cn";

type AdminSearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
  className?: string;
};

const AdminSearch = ({ value, onChange, placeholder, label, className }: AdminSearchProps) => (
  <div className={cn("relative w-full md:w-72", className)}>
    <Search
      size={14}
      aria-hidden
      className="absolute top-1/2 left-2.5 -translate-y-1/2 text-foreground/60"
    />
    <Input
      type="text"
      aria-label={label}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="pr-8 pl-8.5"
    />
    {value && (
      <button
        type="button"
        aria-label="Clear search"
        onClick={() => onChange("")}
        className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer text-foreground/60 hover:text-foreground"
      >
        <X size={14} />
      </button>
    )}
  </div>
);

export default AdminSearch;