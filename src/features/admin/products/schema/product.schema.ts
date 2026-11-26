// features/products/schemas/product.schema.ts

import { z } from "zod";

export const productSchema = z.object({
  name: z
    .string()
    .min(2, "Product name must be at least 2 characters")
    .max(100, "Product name is too long"),

  slug: z
    .string()
    .min(2, "Slug is required")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),

  description: z.string().min(10, "Description must be at least 10 characters"),

  category: z.enum([
    "Men's Footwear",
    "Women's Footwear",
    "Clothing",
    "Handbags",
  ]),

  brand: z.string().min(2, "Brand is required"),

  price: z.number().positive("Price must be greater than 0"),

  discountedPrice: z
    .number()
    .nonnegative("Discounted price must be greater than 0")
    .optional(),

  image: z.object({
    id: z.string(),
    src: z.url("Invalid image URL"),
    alt: z.string().min(2, "Image alt text is required"),
  }),

  variants: z.array(
    z.object({
      id: z.string(),
      color: z.string().optional(),
      size: z.string().optional(),
      stock: z.number().int().nonnegative("Stock cannot be negative"),
    }),
  ),

  tags: z.array(z.enum(["New", "Featured", "Sales", "Best-Seller"])).optional(),

  isFeatured: z.boolean().optional(),

  isNewArrival: z.boolean().optional(),

  stock: z.number().int().nonnegative("Stock cannot be negative"),

  sku: z.string().min(1, "SKU is required"),
});

export type ProductFormValues = z.infer<typeof productSchema>;
