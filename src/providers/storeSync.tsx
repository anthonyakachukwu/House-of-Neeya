"use client";

import { useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { useCartStore } from "@/features/cart/store/cartStore";
import { useWishlistStore } from "@/features/wishlist/store/wishlistStore";
import { loadCart, saveCart } from "@/features/cart/api/cart.services";
import {
    addWishlistItem,
    loadWishlist,
    removeWishlistItem,
} from "@/features/wishlist/api/wishlist.services";
import type { CartProduct } from "@/features/cart/types/cart.types";

const cartKey = (i: CartProduct) => `${i.id}|${i.color}|${i.size}`;

// Guest items added before signing in get merged into the saved cart.
function mergeCarts(saved: CartProduct[], guest: CartProduct[]) {
    const merged = new Map(saved.map((i) => [cartKey(i), i]));
    for (const item of guest) {
        const existing = merged.get(cartKey(item));
        merged.set(
            cartKey(item),
            existing
                ? { ...existing, quantity: Math.min(existing.quantity + item.quantity, existing.stock) }
                : item,
        );
    }
    return [...merged.values()];
}

export default function StoreSync() {
    useEffect(() => {
        const db = supabase();
        let activeUser: string | null = null;
        let stopSync: (() => void) | null = null;

        async function start(userId: string) {
            if (activeUser === userId) return;
            activeUser = userId;
            const log = (e: unknown) => console.error("Store sync failed:", e);

            try {
                const [savedCart, savedWishlist] = await Promise.all([
                    loadCart(userId),
                    loadWishlist(userId),
                ]);
                if (activeUser !== userId) return;

                const cart = mergeCarts(savedCart, useCartStore.getState().items);
                const savedIds = new Set(savedWishlist.map((p) => p.id));
                const guestWishlist = useWishlistStore
                    .getState()
                    .items.filter((p) => !savedIds.has(p.id));

                useCartStore.getState().setItems(cart);
                useWishlistStore.getState().setItems([...savedWishlist, ...guestWishlist]);

                await saveCart(userId, cart);
                await Promise.all(guestWishlist.map((p) => addWishlistItem(userId, p.id)));
            } catch (e) {
                log(e);
            }
            if (activeUser !== userId) return;

            // Subscribe only after the first load so it doesn't echo itself back.
            let queue: Promise<unknown> = Promise.resolve();
            const enqueue = (task: () => Promise<unknown>) => {
                queue = queue.then(task).catch(log);
            };

            let timer: ReturnType<typeof setTimeout>;
            const unsubCart = useCartStore.subscribe((state, prev) => {
                if (state.items === prev.items) return;
                clearTimeout(timer);
                timer = setTimeout(
                    () => enqueue(() => saveCart(userId, useCartStore.getState().items)),
                    800,
                );
            });

            const unsubWishlist = useWishlistStore.subscribe((state, prev) => {
                if (state.items === prev.items) return;
                const before = new Set(prev.items.map((p) => p.id));
                const after = new Set(state.items.map((p) => p.id));
                state.items
                    .filter((p) => !before.has(p.id))
                    .forEach((p) => enqueue(() => addWishlistItem(userId, p.id)));
                prev.items
                    .filter((p) => !after.has(p.id))
                    .forEach((p) => enqueue(() => removeWishlistItem(userId, p.id)));
            });

            stopSync = () => {
                clearTimeout(timer);
                unsubCart();
                unsubWishlist();
            };
        }

        const {
            data: { subscription },
        } = db.auth.onAuthStateChange((event, session) => {
            const user = session?.user;
            if (user) {
                // Supabase warns against awaiting client calls inside this callback.
                setTimeout(() => void start(user.id), 0);
                return;
            }
            if (event === "INITIAL_SESSION") {
                // Signed-out visitor: restore the localStorage copy.
                void useCartStore.persist.rehydrate();
                void useWishlistStore.persist.rehydrate();
                return;
            }
            if (event === "SIGNED_OUT") {
                stopSync?.();
                stopSync = null;
                activeUser = null;
                useCartStore.getState().setItems([]);
                useWishlistStore.getState().setItems([]);
            }
        });

        return () => {
            subscription.unsubscribe();
            stopSync?.();
        };
    }, []);

    return null;
}