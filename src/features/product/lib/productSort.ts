import type { Product } from "../types/product.types";

export type SortOption = "featured" | "price-asc" | "price-desc" | "name-asc";

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Sort by: Featured" },
  { value: "price-asc", label: "Sort by: Price (Low to High)" },
  { value: "price-desc", label: "Sort by: Price (High to Low)" },
  { value: "name-asc", label: "Sort by: Name (A - Z)" },
];

// Same price the card shows: discounted if present, otherwise regular.
const effectivePrice = (p: Product) => p.discountedPrice || p.price;

export function sortProducts(products: Product[], sort: SortOption): Product[] {
  const sorted = [...products]; // don't mutate the cached query data

  switch (sort) {
    case "price-asc":
      return sorted.sort((a, b) => effectivePrice(a) - effectivePrice(b));
    case "price-desc":
      return sorted.sort((a, b) => effectivePrice(b) - effectivePrice(a));
    case "name-asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "featured":
    default:
      // Featured items first; the sort is stable, so the rest keep their order.
      return sorted.sort(
        (a, b) => Number(b.isFeatured ?? false) - Number(a.isFeatured ?? false),
      );
  }
}