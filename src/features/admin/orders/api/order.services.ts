import { supabase } from "@/utils/supabase/client";
import { selectIn } from "@/lib/selectIn";
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

// Runs in the browser with the signed-in user's own session. RLS decides what
// comes back: admins see every order, customers only their own.

async function loadOrders(userId?: string): Promise<AdminOrder[]> {
  const db = supabase();

  let query = db
    .from("Orders")
    .select("*")
    .order("createdAt", { ascending: false });
  if (userId) query = query.eq("userId", userId);

  const { data: orders, error } = await query;
  if (error) throw new Error(error.message);
  if (!orders || orders.length === 0) return [];

  const [addresses, items] = await Promise.all([
    selectIn<AddressRow>("Addresses", "id", orders.map((o) => o.addressId)),
    selectIn<OrderItemRow>("Order items", "orderId", orders.map((o) => o.id)),
  ]);

  const products = await selectIn<ProductNameRow>(
    "Products",
    "id",
    items.map((i) => i.productId),
    "id, name",
  );

  return mapOrdersFromDatabase(orders as OrderRow[], addresses, items, products);
}

/** Every order. Only returns rows for admin accounts. */
export const getAdminOrders = () => loadOrders();

/** One customer's orders. */
export const getMyOrders = (userId: string) => loadOrders(userId);

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
