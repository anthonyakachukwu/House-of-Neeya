"use client";

import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/features/product/api/product.services";
import { mapProductFromDatabase } from "@/features/product/api/product.mappers";

export const productKeys = {
  all: ["products"] as const,
};

export function useProducts() {
  return useQuery({
    queryKey: productKeys.all,
    queryFn: async () => {
      const { products } = await getProducts();
      return products.map(mapProductFromDatabase);
    },
    staleTime: 60_000,
  });
}