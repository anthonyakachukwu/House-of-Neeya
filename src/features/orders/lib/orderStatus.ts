import type {
  OrderStatus,
  PaymentStatus,
} from "@/features/admin/orders/api/order.mappers";

type StatusInput = { status: OrderStatus; paymentStatus: PaymentStatus };

export type StatusTone = "green" | "orange" | "blue" | "red" | "gray";

export const toneClass: Record<StatusTone, string> = {
  green: "bg-green-100 text-green-800",
  orange: "bg-orange-100 text-orange-800",
  blue: "bg-blue-100 text-blue-800",
  red: "bg-red-100 text-red-800",
  gray: "bg-gray-100 text-gray-800",
};

export const TRACKING_STEPS = [
  { key: "placed", label: "Order placed" },
  { key: "paid", label: "Payment confirmed" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
] as const;

/** Index of the last finished step, or -1 when the order is cancelled. */
export function getProgress({ status, paymentStatus }: StatusInput): number {
  if (status === "cancelled") return -1;
  if (status === "delivered") return 3;
  if (status === "shipped") return 2;
  if (paymentStatus === "paid") return 1;
  return 0;
}

export function getOrderSummary(order: StatusInput): {
  label: string;
  tone: StatusTone;
  message: string;
} {
  switch (getProgress(order)) {
    case -1:
      return { label: "Cancelled", tone: "red", message: "This order was cancelled." };
    case 3:
      return { label: "Delivered", tone: "green", message: "Your order has been delivered." };
    case 2:
      return { label: "Shipped", tone: "blue", message: "Your order is on its way." };
    case 1:
      return { label: "Preparing", tone: "orange", message: "Payment confirmed. We are packing your order." };
    default:
      return {
        label: "Awaiting payment",
        tone: "orange",
        message: "Transfer the total, then send your proof of payment on WhatsApp.",
      };
  }
}
