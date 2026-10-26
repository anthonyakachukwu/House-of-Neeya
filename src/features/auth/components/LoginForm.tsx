"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components";
import Input from "@/components/ui/Input";
import { loginSchema, type LoginValues } from "../schema/auth.schema";
import { signIn, signInAsGuest } from "../api/auth.services";
import AuthShell, { AuthDivider, AuthMessage } from "./AuthShell";

const LoginForm = () => {
  const router = useRouter();
  const [formError, setFormError] = useState("");
  const [guestLoading, setGuestLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const goToStore = () => {
    router.push("/shop");
    router.refresh();
  };

  const onSubmit = async (values: LoginValues) => {
    setFormError("");
    try {
      await signIn(values);
      goToStore();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Something went wrong. Try again.");
    }
  };

  const onGuest = async () => {
    setFormError("");
    setGuestLoading(true);
    try {
      await signInAsGuest();
      goToStore();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Could not start a guest session.");
      setGuestLoading(false);
    }
  };

  return (
    <AuthShell tag="Welcome back" title="Sign in" subtitle="Sign in to track orders and keep your wishlist.">
      <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        {formError && <AuthMessage>{formError}</AuthMessage>}
        <Input
          id="email"
          type="email"
          label="Email *"
          placeholder="johnnasiru@mail.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          id="password"
          type="password"
          label="Password *"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <Button type="submit" disabled={isSubmitting || guestLoading}>
          {isSubmitting ? "Signing in..." : "Sign In"}
        </Button>
      </form>
      <AuthDivider>or</AuthDivider>
      <Button variant="secondary" type="button" onClick={onGuest} disabled={isSubmitting || guestLoading}>
        {guestLoading ? "Starting guest session..." : "Continue as Guest"}
      </Button>
      <p className="text-center text-xs text-foreground/60">
        New to House of Neeya?{" "}
        <Link href="/signup" className="text-foreground underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
};

export default LoginForm;
