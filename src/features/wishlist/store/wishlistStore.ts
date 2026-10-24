import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/features/product/types/product.types";

type WishlistState = {
  items: Product[];
  setItems: (items: Product[]) => void;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => void;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      setItems: (items) => set({ items }),
      isInWishlist: (productId) => get().items.some((item) => item.id === productId),
      toggleWishlist: (product) =>
        set((state) => {
          const exists = state.items.some((item) => item.id === product.id);
          return {
            items: exists
              ? state.items.filter((item) => item.id !== product.id)
              : [...state.items, product],
          };
        }),
    }),
    {
      name: "neeya-wishlist",
      skipHydration: true,
      partialize: (state) => ({ items: state.items }),
    },
  ),
);