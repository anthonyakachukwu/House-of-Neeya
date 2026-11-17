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

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setNotice("")

    const form = new FormData(event.currentTarget)
    const fullName = String(form.get("name") ?? "").trim()
    const email = String(form.get("email") ?? "")
    const password = String(form.get("password") ?? "")
    const confirm = String(form.get("confirm-password") ?? "")

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.")
      return
    }
    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }

    const [firstName, ...rest] = fullName.split(/\s+/)
    setSubmitting(true)

    const { data, error } = await supabase().auth.signUp({
      email,
      password,
      options: { data: { firstName, lastName: rest.join(" ") } },
    })

    if (error) {
      setError(error.message)
      setSubmitting(false)
      return
    }

    // With email confirmation on, there is no session until the link is clicked
    if (!data.session) {
      setNotice("Check your email to confirm your account, then log in.")
      setSubmitting(false)
      return
    }

    router.replace("/")
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
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Fill in the form below to create your account
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="name">Full Name</FieldLabel>
          <Input id="name" name="name" type="text" placeholder="John Doe" required className="bg-background" />
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" name="email" type="email" placeholder="m@example.com" required className="bg-background" />
          <FieldDescription>
            We&apos;ll use this to contact you. We will not share your email
            with anyone else.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input id="password" name="password" type="password" required className="bg-background" />
          <FieldDescription>Must be at least 8 characters long.</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
          <Input id="confirm-password" name="confirm-password" type="password" required className="bg-background" />
        </Field>
        <FieldError>{error}</FieldError>
        {notice && <p role="status" className="text-sm">{notice}</p>}
        <Field>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating account..." : "Create Account"}
          </Button>
          <FieldDescription className="px-6 text-center">
            Already have an account?{" "}
            <Link href="/login" className="underline underline-offset-4">
              Sign in
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
