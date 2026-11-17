"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import Input from "@/components/ui/Input"
import { supabase } from "@/utils/supabase/client"

// Only allow same-site paths so ?next= cannot send people to another domain
const safeNext = (value: string | null) =>
  value && value.startsWith("/") && !value.startsWith("//") ? value : null

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setSubmitting(true)

    const form = new FormData(event.currentTarget)
    const { data, error } = await supabase().auth.signInWithPassword({
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    })

    if (error || !data.user) {
      setError("Incorrect email or password.")
      setSubmitting(false)
      return
    }

    const next = safeNext(new URLSearchParams(window.location.search).get("next"))
    const isAdmin = data.user.app_metadata?.role === "admin"
    router.replace(next ?? (isAdmin ? "/admin/dashboard" : "/"))
    router.refresh()
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      {...props}
      onSubmit={handleSubmit}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your email below to login to your account
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" name="email" type="email" placeholder="m@example.com" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input id="password" name="password" type="password" required />
        </Field>
        <FieldError>{error}</FieldError>
        <Field>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Signing in..." : "Login"}
          </Button>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline underline-offset-4">
              Sign up
            </Link>
            {" · "}
            <Link href="/shop" className="underline underline-offset-4">
              Continue as guest
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
