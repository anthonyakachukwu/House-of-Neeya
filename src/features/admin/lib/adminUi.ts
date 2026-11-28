import { toneClass, type StatusTone } from "@/features/orders/lib/orderStatus";

export const badge = (tone: StatusTone) =>
  `${toneClass[tone]} px-2 py-1 rounded-full text-xs capitalize whitespace-nowrap`;

export const statusTone = {
  unfulfilled: "orange",
  shipped: "blue",
  delivered: "green",
  cancelled: "red",
} as const;

// Reuses the existing formatter (handles the missing timezone on DB timestamps).
export { formatDate as formatOrderDate } from "@/lib/formatDate";