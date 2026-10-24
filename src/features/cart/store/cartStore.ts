import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartProduct } from "@/features/cart/types/cart.types";

type CartState = {
  items: CartProduct[];
  setItems: (items: CartProduct[]) => void;

  addToCart: (item: CartProduct, quantity?: number) => void;
  removeFromCart: (id: string, color: string, size: string) => void;
  clearCart: () => void;
  increaseQuantity: (id: string, color: string, size: string) => void;
  decreaseQuantity: (id: string, color: string, size: string) => void;

  getTotal: () => number;
  getSubtotal: (id: string, color: string, size: string) => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      setItems: (items) => set({ items }),

      addToCart: (item, quantity = 1) => {
        const existing = get().items.find(
          (i) =>
            i.id === item.id && i.color === item.color && i.size === item.size,
        );

        if (existing) {
          set({
            items: get().items.map((i) =>
              i.id === item.id && i.color === item.color && i.size === item.size
                ? { ...i, quantity: Math.min(i.quantity + quantity, i.stock) }
                : i,
            ),
          });
        } else {
          set({ items: [...get().items, { ...item, quantity }] });
        }
      },

      removeFromCart: (id, color, size) => {
        set({
          items: [
            ...get().items.filter(
              (item) =>
                !(item.id === id && item.color === color && item.size === size),
            ),
          ],
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      increaseQuantity: (id, color, size) => {
        set({
          items: get().items.map((item) =>
            item.id === id &&
            item.color === color &&
            item.size === size &&
            item.quantity < item.stock
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        });

        get().getTotal();
      },

      decreaseQuantity: (id, color, size) => {
        set({
          items: get()
            .items.map((item) =>
              item.id === id && item.color === color && item.size === size
                ? { ...item, quantity: item.quantity - 1 }
                : item,
            )
            .filter((item) => item.quantity > 0),
        });
      },

      getTotal: () => {
        return get().items.reduce(
          (total, item) =>
            item.discountedPrice
              ? total + item.quantity * item.discountedPrice
              : total + item.quantity * item.price,
          0,
        );
      },

      getSubtotal: (id, color, size) => {
        const item = get().items.find(
          (item) =>
            item.id === id && item.color === color && item.size === size,
        );

        return (
          (item &&
            (item.discountedPrice
              ? item.quantity * item.discountedPrice
              : item.quantity * item.price)) ||
          0
        );
      },
    }),
    {
      name: "neeya-cart",
      skipHydration: true, // StoreSync rehydrates after mount, avoiding hydration mismatches
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
