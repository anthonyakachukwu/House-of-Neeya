import { supabase } from "@/utils/supabase/client";
import { mapProductFromDatabase } from "@/features/product/api/product.mappers";
import type { Product } from "@/features/product/types/product.types";

export async function loadWishlist(userId: string): Promise<Product[]> {
  const db = supabase();

  const { data: rows, error } = await db
    .from("Wishlist items")
    .select("productId")
    .eq("userId", userId);
  if (error) throw new Error(error.message);
  if (!rows?.length) return [];

  const { data: products, error: productError } = await db
    .from("Products")
    .select("*")
    .in("id", rows.map((r) => r.productId as string));
  if (productError) throw new Error(productError.message);

  return (products ?? []).map(mapProductFromDatabase);
}

export async function addWishlistItem(userId: string, productId: string) {
  const { error } = await supabase()
    .from("Wishlist items")
    .upsert({ userId, productId }, { onConflict: "userId,productId", ignoreDuplicates: true });
  if (error) throw new Error(error.message);
}

export async function removeWishlistItem(userId: string, productId: string) {
  const { error } = await supabase()
    .from("Wishlist items")
    .delete()
    .eq("userId", userId)
    .eq("productId", productId);
  if (error) throw new Error(error.message);
}