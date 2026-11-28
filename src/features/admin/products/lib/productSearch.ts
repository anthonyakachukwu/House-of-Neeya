import { matchesSearch } from "@/features/admin/lib/search";
import { LOW_STOCK_THRESHOLD } from "@/features/admin/dashboard/api/dashboard.services";

export type AdminProductRow = {
  id: string;
  name: string;
  slug?: string | null;
  sku: string;
  category: string;
  brand?: string | null;
  price: number;
  discountedPrice?: number | null;
  stock: number;
  tags?: string[] | null;
  image?: { src: string; alt?: string } | null;
};

export const PRODUCT_TABS = {
  "All Products": () => true,
  "In Stock": (p: AdminProductRow) => p.stock > LOW_STOCK_THRESHOLD,
  "Low Stock": (p: AdminProductRow) => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD,
  "Sold Out": (p: AdminProductRow) => p.stock <= 0,
} as const;

export type ProductTabName = keyof typeof PRODUCT_TABS;

export function productMatches(p: AdminProductRow, query: string) {
  return matchesSearch(
    [p.name, p.sku, p.slug, p.category, p.brand, ...(p.tags ?? [])],
    query,
  );
}

export function stockStatus(stock: number): {
  label: string;
  tone: "green" | "orange" | "red";
} {
  if (stock <= 0) return { label: "Sold out", tone: "red" };
  if (stock <= LOW_STOCK_THRESHOLD) return { label: "Low stock", tone: "orange" };
  return { label: "In stock", tone: "green" };
}