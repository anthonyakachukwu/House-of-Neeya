import type { OrderStatus, PaymentStatus } from "../api/order.mappers";
import { toneClass, type StatusTone } from "@/features/orders/lib/orderStatus";

const base = "px-2 py-1 rounded-full text-xs whitespace-nowrap";

export const PaymentBadge = ({ status }: { status: PaymentStatus }) => (
  <span className={`${toneClass[status === "paid" ? "green" : "orange"]} ${base}`}>
    {status === "paid" ? "Paid" : "Unpaid"}
  </span>
);

const fulfillment: Record<OrderStatus, { label: string; tone: StatusTone }> = {
  unfulfilled: { label: "Unfulfilled", tone: "orange" },
  shipped: { label: "Shipped", tone: "blue" },
  delivered: { label: "Delivered", tone: "green" },
  cancelled: { label: "Cancelled", tone: "red" },
};

export const FulfillmentBadge = ({ status }: { status: OrderStatus }) => (
  <span className={`${toneClass[fulfillment[status].tone]} ${base}`}>
    {fulfillment[status].label}
  </span>
);
