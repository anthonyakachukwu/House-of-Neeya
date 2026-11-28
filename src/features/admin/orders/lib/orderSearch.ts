import { matchesSearch } from "@/features/admin/lib/search";
import type { AdminOrder } from "../api/order.mappers";

export function orderMatches(order: AdminOrder, query: string) {
  const digits = order.customer.phone.replace(/\D/g, "");
  const localPhone = digits.startsWith("234") ? "0" + digits.slice(3) : digits;

  return matchesSearch(
    [
      order.reference,
      order.customer.name,
      order.customer.email,
      order.customer.address,
      order.customer.phone,
      digits,
      localPhone,
      ...order.items.map((i) => i.name),
    ],
    query,
  );
}