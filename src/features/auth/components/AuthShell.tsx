import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import Logo from "@/assets/Logo-Primary-Light.png";
import LogoIcon from "@/assets/Logo-Icon-Dark.png";

type AuthShellProps = {
  tag: string;
  title: string;
  subtitle: string;
  children: ReactNode;
};

const AuthShell = ({ tag, title, subtitle, children }: AuthShellProps) => {
  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-background">
      <div className="flex flex-col gap-8 px-5 py-8 md:px-10">
        <Link href="/" className="w-fit">
          <Image src={Logo} alt="House of Neeya Logo" height={50} className="w-auto" />
        </Link>
        <div className="flex flex-1 items-center justify-center">
          <div className="flex w-full max-w-md flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="uppercase text-[10px] text-primary tracking-[0.22em]">{tag}</span>
              <h1 className="font-serif text-4xl italic">{title}</h1>
              <p className="text-sm font-light text-foreground/60">{subtitle}</p>
            </div>
            {children}
          </div>
        </div>
      </div>
      <div className="hidden lg:flex items-center justify-center bg-foreground text-background">
        <div className="flex h-110 w-80 flex-col items-center justify-end gap-3 rounded-t-full border-2 border-primary/30 px-8 pb-10 text-center">
          <Image src={LogoIcon} alt="House of Neeya Logo" height={200} className="w-auto" />
          <span className="font-serif text-primary italic">✦</span>
          <p className="font-serif text-3xl italic font-light leading-tight">Style is your story.</p>
          <span className="uppercase text-[10px] tracking-[0.22em] text-background/60">
            Style • Curated • Delivered
          </span>
        </div>
      </div>
    </div>
  );
};

export const AuthDivider = ({ children }: { children: ReactNode }) => (
  <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.22em] text-foreground/40">
    <span className="h-px flex-1 bg-foreground/20" />
    {children}
    <span className="h-px flex-1 bg-foreground/20" />
  </div>
);

export const AuthMessage = ({
  children,
  tone = "error",
}: {
  children: ReactNode;
  tone?: "error" | "success";
}) => (
  <p
    role={tone === "error" ? "alert" : "status"}
    className={`border-l-2 px-4 py-2 text-xs ${
      tone === "error"
        ? "border-destructive bg-destructive/10 text-destructive"
        : "border-secondary bg-secondary/10 text-secondary"
    }`}
  >
    {children}
  </p>
);

export default AuthShell;
