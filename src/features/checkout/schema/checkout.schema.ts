import { z } from "zod";
import { DELIVERY_STATE_NAMES } from "../lib/checkout.constants";

// Fields the customer types in
export const checkoutFormSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(60),
  lastName: z.string().trim().min(1, "Last name is required").max(60),
  email: z.email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(20, "Enter a valid phone number"),
  street: z.string().trim().min(3, "Street address is required").max(200),
  city: z.string().trim().min(2, "City is required").max(80),
  state: z.enum(DELIVERY_STATE_NAMES, { error: "Select a state" }),
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

// What the browser sends to /api/checkout. No prices: the server looks them up.
export const checkoutRequestSchema = checkoutFormSchema.extend({
  items: z
    .array(
      z.object({
        productId: z.uuid(),
        color: z.string().max(50).default(""),
        size: z.string().max(20).default(""),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1, "Your bag is empty")
    .max(50),
});

export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;
