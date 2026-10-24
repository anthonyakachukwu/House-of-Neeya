import type { Product, ProductCategory } from "../types/product.types";

export type ProductFilters = {
  categories: ProductCategory[];
  maxPrice: number | null; // null = no price cap
  inStockOnly: boolean;
};

export const DEFAULT_FILTERS: ProductFilters = {
  categories: [],
  maxPrice: null,
  inStockOnly: false,
};

export function filterProducts(products: Product[], filters: ProductFilters) {
  return products.filter((product) => {
    if (
      filters.categories.length > 0 &&
      !filters.categories.includes(product.category)
    ) {
      return false;
    }

    // Same price the card shows: discounted if present, otherwise regular.
    const price = product.discountedPrice || product.price;
    if (filters.maxPrice !== null && price > filters.maxPrice) return false;

    if (filters.inStockOnly && product.stock <= 0) return false;

    return true;
  });
}