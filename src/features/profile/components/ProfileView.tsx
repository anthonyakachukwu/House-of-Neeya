"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Package } from "lucide-react";
import { Button } from "@/components";
import SectionLayout from "@/components/layout/SectionLayout";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/SelectInput";
import Loader from "@/components/ui/Loader";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AuthMessage } from "@/features/auth/components/AuthShell";
import { signOut } from "@/features/auth/api/auth.services";
import { useAuthUser } from "@/features/auth/hooks/useAuthUser";
import { DELIVERY_STATE_NAMES } from "@/features/checkout/lib/checkout.constants";
import { updateProfile } from "../api/profile.services";
import { profileSchema, type ProfileValues } from "../schema/profile.schema";

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="uppercase text-[11px] text-primary pb-2 tracking-[0.22em] border-b border-b-foreground/20">
    {children}
  </h2>
);

export default function ProfileView() {
  const router = useRouter();
  const { profile, loading } = useAuthUser();
  const [message, setMessage] = useState<{
    tone: "success" | "error";
    text: string;
  } | null>(null);
  const filled = useRef(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileValues>({ resolver: zodResolver(profileSchema) });

  // Fill the form once. Later auth events (token refresh) must not wipe edits.
  useEffect(() => {
    if (!profile || filled.current) return;
    filled.current = true;
    const state = (DELIVERY_STATE_NAMES as readonly string[]).includes(
      profile.address.state,
    )
      ? (profile.address.state as ProfileValues["state"])
      : "";
    reset({
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone,
      street: profile.address.street,
      city: profile.address.city,
      state,
    });
  }, [profile, reset]);

  const onSubmit = async (values: ProfileValues) => {
    setMessage(null);
    try {
      await updateProfile(values);
      setMessage({ tone: "success", text: "Your details were saved." });
    } catch (e) {
      setMessage({
        tone: "error",
        text: e instanceof Error ? e.message : "Could not save your changes.",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error("Error signing out:", e);
    }
  };

  if (loading) return <Loader />;
  if (!profile) return null; // proxy.ts redirects signed-out visitors to /login

  return (
    <SectionLayout className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <SectionLayout.Tag>My account</SectionLayout.Tag>
        <SectionLayout.Heading className="italic mb-0!">
          {profile.isGuest ? "Guest account" : `Hello, ${profile.shortName}`}
        </SectionLayout.Heading>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        <aside className="flex flex-col gap-4 w-full md:w-72 shrink-0 bg-white p-6">
          <div className="flex items-center gap-3">
            <Avatar size="lg">
              <AvatarFallback className="bg-accent text-background">
                {profile.initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-serif text-lg font-semibold truncate">
                {profile.displayName}
              </p>
              {!profile.isGuest && (
                <p className="text-xs text-foreground/60 truncate">
                  {profile.email}
                </p>
              )}
            </div>
          </div>
          <Link href="/orders" className="block">
            <Button variant="secondary">
              <Package /> My orders
            </Button>
          </Link>
          <Button variant="outline" onClick={handleSignOut}>
            Log out
          </Button>
        </aside>

        {profile.isGuest ? (
          <div className="flex flex-col gap-4 flex-1 bg-white p-6 text-sm">
            <SectionTitle>Create an account</SectionTitle>
            <p className="text-foreground/60">
              You are using a guest session. Create an account to save your
              details for faster checkout and to keep your order history.
            </p>
            <Link href="/signup" className="block md:w-fit">
              <Button>Create account</Button>
            </Link>
          </div>
        ) : (
          <form
            className="flex flex-col gap-6 flex-1 w-full bg-white p-6"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            {message && (
              <AuthMessage tone={message.tone}>{message.text}</AuthMessage>
            )}

            <SectionTitle>Personal details</SectionTitle>
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                id="firstName"
                label="First name *"
                autoComplete="given-name"
                error={errors.firstName?.message}
                {...register("firstName")}
              />
              <Input
                id="lastName"
                label="Last name *"
                autoComplete="family-name"
                error={errors.lastName?.message}
                {...register("lastName")}
              />
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                id="email"
                type="email"
                label="Email"
                readOnly
                defaultValue={profile.email}
                className="bg-foreground/5"
              />
              <Input
                id="phone"
                type="tel"
                label="Phone number"
                placeholder="+234 800 000 0000"
                autoComplete="tel"
                error={errors.phone?.message}
                {...register("phone")}
              />
            </div>

            <SectionTitle>Delivery address</SectionTitle>
            <p className="text-xs text-foreground/60 -mt-3">
              We fill these in for you at checkout.
            </p>
            <Input
              id="street"
              label="Street address"
              placeholder="12 Allen Avenue, Maitama"
              autoComplete="street-address"
              error={errors.street?.message}
              {...register("street")}
            />
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                id="city"
                label="City"
                placeholder="Abuja"
                error={errors.city?.message}
                {...register("city")}
              />
              <Select
                id="state"
                label="State"
                className="w-full"
                error={errors.state?.message}
                {...register("state")}
              >
                <option value="">Select state</option>
                {DELIVERY_STATE_NAMES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </Select>
            </div>

            <Button type="submit" className="md:w-fit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </form>
        )}
      </div>
    </SectionLayout>
  );
}
