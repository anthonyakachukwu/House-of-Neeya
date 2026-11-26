"use client";

import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type {
  AdminOrder,
  OrderStatus,
  PaymentStatus,
} from "../api/order.mappers";

export type OrderPatch = { status?: OrderStatus; paymentStatus?: PaymentStatus };

const STATUSES: OrderStatus[] = ["unfulfilled", "shipped", "delivered", "cancelled"];

const OrderActions = ({
  order,
  disabled,
  onUpdate,
}: {
  order: AdminOrder;
  disabled?: boolean;
  onUpdate: (id: string, patch: OrderPatch) => void;
}) => {
  const isPaid = order.paymentStatus === "paid";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Actions for order ${order.reference}`}
        disabled={disabled}
        className="p-2 -m-2 cursor-pointer disabled:opacity-40"
      >
        <MoreHorizontal size={16} className="text-foreground/70" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Payment</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() =>
              onUpdate(order.id, { paymentStatus: isPaid ? "pending" : "paid" })
            }
          >
            {isPaid ? "Mark as unpaid" : "Mark as paid"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Delivery</DropdownMenuLabel>
          {STATUSES.filter((s) => s !== order.status).map((s) => (
            <DropdownMenuItem
              key={s}
              // Business rule: nothing ships until the payment is confirmed.
              disabled={(s === "shipped" || s === "delivered") && !isPaid}
              onClick={() => onUpdate(order.id, { status: s })}
            >
              Mark as {s}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default OrderActions;
