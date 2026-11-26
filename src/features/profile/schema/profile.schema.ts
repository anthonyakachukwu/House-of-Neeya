import { z } from "zod";
import { DELIVERY_STATE_NAMES } from "@/features/checkout/lib/checkout.constants";

export const profileSchema = z.object({
  firstName: z.string().trim().min(2, "First name is required").max(60),
  lastName: z.string().trim().min(2, "Last name is required").max(60),
  phone: z
    .string()
    .trim()
    .max(20, "Enter a valid phone number")
    .refine((v) => v === "" || v.length >= 7, "Enter a valid phone number"),
  street: z.string().trim().max(200),
  city: z.string().trim().max(80),
  state: z.enum(DELIVERY_STATE_NAMES).or(z.literal("")),
});

export type ProfileValues = z.infer<typeof profileSchema>;
