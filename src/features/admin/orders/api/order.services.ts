import { supabase } from "@/utils/supabase/client";
import {
  mapOrdersFromDatabase,
  type AddressRow,
  type AdminOrder,
  type OrderItemRow,
  type OrderRow,
  type OrderStatus,
  type PaymentStatus,
  type ProductNameRow,
} from "./order.mappers";

// Runs in the browser with the admin's own session. RLS decides what comes
// back: only admins can read every order and change statuses.

export async function getAdminOrders(): Promise<AdminOrder[]> {
  const db = supabase();

  const { data: orders, error } = await db
    .from("Orders")
    .select("*")
    .order("createdAt", { ascending: false });
  if (error) throw new Error(error.message);
  if (!orders || orders.length === 0) return [];

  const orderIds = orders.map((o) => o.id);
  const addressIds = [...new Set(orders.map((o) => o.addressId))];

  const [addresses, items] = await Promise.all([
    db.from("Addresses").select("*").in("id", addressIds),
    db.from("Order items").select("*").in("orderId", orderIds),
  ]);
  if (addresses.error) throw new Error(addresses.error.message);
  if (items.error) throw new Error(items.error.message);

  const productIds = [...new Set((items.data ?? []).map((i) => i.productId))];
  const products = productIds.length
    ? await db.from("Products").select("id, name").in("id", productIds)
    : { data: [], error: null };
  if (products.error) throw new Error(products.error.message);

  return mapOrdersFromDatabase(
    orders as OrderRow[],
    (addresses.data ?? []) as AddressRow[],
    (items.data ?? []) as OrderItemRow[],
    (products.data ?? []) as ProductNameRow[],
  );
}

export async function updateOrder(
  id: string,
  patch: { status?: OrderStatus; paymentStatus?: PaymentStatus },
) {
  const { data, error } = await supabase()
    .from("Orders")
    .update({ ...patch, updatedAt: new Date().toISOString() })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) throw new Error(error.message);
  // RLS blocks the update silently (0 rows) when the user is not an admin
  if (!data) throw new Error("Update not allowed for this account.");
}
