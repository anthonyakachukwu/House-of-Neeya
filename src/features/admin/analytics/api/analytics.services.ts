import { supabase } from "@/utils/supabase/client";
import { selectIn } from "@/lib/selectIn";
import type {
  RawAddress,
  RawAnalytics,
  RawItem,
  RawOrder,
  RawProduct,
} from "../lib/analytics";

// Table names and status values still live in one place.
export * from "@/features/admin/dashboard/api/dashboard.services";

/** Raw rows for the analytics page. Admin session only (RLS). */
export async function fetchAnalyticsData(): Promise<RawAnalytics> {
  const { data, error } = await supabase()
    .from("Orders")
    .select("id, userId, addressId, status, paymentStatus, total, createdAt");
  if (error) throw new Error(error.message);

  const orders = (data ?? []) as RawOrder[];
  const [addresses, items] = await Promise.all([
    selectIn<RawAddress>("Addresses", "id", orders.map((o) => o.addressId), "id, email, state"),
    selectIn<RawItem>("Order items", "orderId", orders.map((o) => o.id), "orderId, productId, quantity, priceAtPurchase"),
  ]);
  const products = await selectIn<RawProduct>(
    "Products",
    "id",
    items.map((i) => i.productId),
    "id, name, category",
  );

  return { orders, addresses, items, products };
}
