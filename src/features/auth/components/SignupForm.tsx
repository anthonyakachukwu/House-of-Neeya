"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components";
import Input from "@/components/ui/Input";
import { signupSchema, type SignupValues } from "../schema/auth.schema";
import { signInAsGuest, signUp } from "../api/auth.services";
import AuthShell, { AuthDivider, AuthMessage } from "./AuthShell";

const SignupForm = () => {
  const router = useRouter();
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [guestLoading, setGuestLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({ resolver: zodResolver(signupSchema) });

  const onSubmit = async (values: SignupValues) => {
    setFormError("");
    setNotice("");
    try {
      const { needsEmailConfirmation } = await signUp(values);
      if (needsEmailConfirmation) {
        setNotice("Check your inbox. We sent a link to confirm your email before you sign in.");
        return;
      }
      router.push("/shop");
      router.refresh();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Something went wrong. Try again.");
    }
  };

  const onGuest = async () => {
    setFormError("");
    setGuestLoading(true);
    try {
      await signInAsGuest();
      router.push("/shop");
      router.refresh();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Could not start a guest session.");
      setGuestLoading(false);
    }
  };

  return (
    <AuthShell tag="Join the house" title="Create your account" subtitle="Save your details for faster checkout.">
      <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        {formError && <AuthMessage>{formError}</AuthMessage>}
        {notice && <AuthMessage tone="success">{notice}</AuthMessage>}
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            id="firstName"
            type="text"
            label="First Name *"
            placeholder="James"
            autoComplete="given-name"
            error={errors.firstName?.message}
            {...register("firstName")}
          />
          <Input
            id="lastName"
            type="text"
            label="Last Name *"
            placeholder="Nasiru"
            autoComplete="family-name"
            error={errors.lastName?.message}
            {...register("lastName")}
          />
        </div>
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
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <Input
          id="confirmPassword"
          type="password"
          label="Confirm Password *"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
        <Button type="submit" disabled={isSubmitting || guestLoading}>
          {isSubmitting ? "Creating account..." : "Create Account"}
        </Button>
      </form>
      <AuthDivider>or</AuthDivider>
      <Button variant="secondary" type="button" onClick={onGuest} disabled={isSubmitting || guestLoading}>
        {guestLoading ? "Starting guest session..." : "Continue as Guest"}
      </Button>
      <p className="text-center text-xs text-foreground/60">
        Already have an account?{" "}
        <Link href="/login" className="text-foreground underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
};

export default SignupForm;
