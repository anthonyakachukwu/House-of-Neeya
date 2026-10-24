import { supabase } from "@/utils/supabase/client";
import { mapProductFromDatabase } from "@/features/product/api/product.mappers";
import type { ProductVariant } from "@/features/product/types/product.types";
import type { CartProduct } from "../types/cart.types";

export async function loadCart(userId: string): Promise<CartProduct[]> {
  const db = supabase();

  const { data: rows, error } = await db
    .from("Cart items")
    .select("productId, variantId, quantity")
    .eq("cartId", userId);
  if (error) throw new Error(error.message);
  if (!rows?.length) return [];

  const ids = [...new Set(rows.map((r) => r.productId as string))];
  const { data: products, error: productError } = await db
    .from("Products")
    .select("*")
    .in("id", ids);
  if (productError) throw new Error(productError.message);

  const byId = new Map(
    (products ?? []).map((p) => [p.id as string, mapProductFromDatabase(p)]),
  );

  return rows.flatMap((row) => {
    const product = byId.get(row.productId);
    if (!product) return []; // product was deleted
    const variant = product.variants?.find((v) => v.id === row.variantId);
    return [
      {
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        discountedPrice: product.discountedPrice,
        image: product.image,
        stock: product.stock,
        tags: product.tags,
        color: variant?.color ?? "",
        size: variant?.size ?? "",
        quantity: row.quantity as number,
      },
    ];
  });
}

export async function saveCart(userId: string, items: CartProduct[]) {
  const db = supabase();

  const { error: cartError } = await db
    .from("Cart")
    .upsert(
      { id: userId, userId, updatedAt: new Date().toISOString() },
      { onConflict: "userId" },
    );
  if (cartError) throw new Error(cartError.message);

  const { error: deleteError } = await db
    .from("Cart items")
    .delete()
    .eq("cartId", userId);
  if (deleteError) throw new Error(deleteError.message);

  if (items.length === 0) return;

  // Cart rows store a variantId, but the cart store tracks color + size,
  // so look the variant up on the product.
  const ids = [...new Set(items.map((i) => i.id))];
  const { data: products, error: productError } = await db
    .from("Products")
    .select("id, variants")
    .in("id", ids);
  if (productError) throw new Error(productError.message);

  const variantsById = new Map(
    (products ?? []).map((p) => [p.id as string, (p.variants ?? []) as ProductVariant[]]),
  );

  const rows = items
    .filter((item) => variantsById.has(item.id)) // skip products that aren't in the database
    .map((item) => {
      const variant = variantsById
        .get(item.id)
        ?.find((v) => (v.color ?? "") === item.color && (v.size ?? "") === item.size);
      return {
        cartId: userId,
        productId: item.id,
        variantId: variant?.id ?? null,
        quantity: item.quantity,
      };
    });

  if (rows.length === 0) return;
  const { error: insertError } = await db.from("Cart items").insert(rows);
  if (insertError) throw new Error(insertError.message);
}