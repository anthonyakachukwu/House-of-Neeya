"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import formatCurrency from "@/lib/formatCurrency";
import { formatDate } from "@/lib/formatDate";
import type { AdminOrder } from "../api/order.mappers";
import { FulfillmentBadge, PaymentBadge } from "./OrderBadges";
import OrderActions, { type OrderPatch } from "./OrderActions";

type Props = {
  orders: AdminOrder[];
  busyId?: string | null;
  onUpdate: (id: string, patch: OrderPatch) => void;
};

const MAX_ITEMS = 3;

const ItemList = ({ order }: { order: AdminOrder }) => (
  <>
    {order.items.slice(0, MAX_ITEMS).map((item) => (
      <p key={item.id}>
        {item.quantity} × {item.name}
        {item.variant && (
          <span className="text-foreground/60"> ({item.variant})</span>
        )}
      </p>
    ))}
    {order.items.length > MAX_ITEMS && (
      <p className="text-foreground/60">
        +{order.items.length - MAX_ITEMS} more
      </p>
    )}
  </>
);

const OrdersTable = ({ orders, busyId, onUpdate }: Props) => (
  <>
    {/* Tablet and desktop: table */}
    <div className="hidden md:block">
      <Table className="text-xs">
        <TableHeader>
          <TableRow>
            {["Order", "Customer", "Items", "Total", "Payment", "Fulfillment", ""].map(
              (h, i) => (
                <TableHead key={i} className="font-semibold">
                  {h}
                </TableHead>
              ),
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow
              key={order.id}
              className={busyId === order.id ? "opacity-50" : undefined}
            >
              <TableCell className="align-top whitespace-normal">
                <p className="font-semibold">{order.reference}</p>
                <p className="text-foreground/60">
                  {formatDate(order.createdAt)}
                  {order.isGuest && " • guest"}
                </p>
              </TableCell>
              <TableCell className="align-top whitespace-normal">
                <p>{order.customer.name}</p>
                <p className="text-foreground/60">{order.customer.phone}</p>
                <p className="text-foreground/60 max-w-56 wrap-break-word">
                  {order.customer.address}
                </p>
              </TableCell>
              <TableCell className="align-top whitespace-normal max-w-60">
                <ItemList order={order} />
              </TableCell>
              <TableCell className="align-top">
                <p>{formatCurrency(order.total)}</p>
                <p className="text-foreground/60">
                  incl. {formatCurrency(order.shippingFee)} delivery
                </p>
              </TableCell>
              <TableCell className="align-top">
                <PaymentBadge status={order.paymentStatus} />
              </TableCell>
              <TableCell className="align-top">
                <FulfillmentBadge status={order.status} />
              </TableCell>
              <TableCell className="align-top">
                <OrderActions
                  order={order}
                  disabled={busyId === order.id}
                  onUpdate={onUpdate}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>

    {/* Phones: one card per order */}
    <div className="flex flex-col gap-3 p-3 md:hidden">
      {orders.map((order) => (
        <article
          key={order.id}
          className={`flex flex-col gap-3 bg-white p-4 text-sm ${busyId === order.id ? "opacity-50" : ""}`}
        >
          <header className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{order.reference}</p>
              <p className="text-xs text-foreground/60">
                {formatDate(order.createdAt)}
                {order.isGuest && " • guest"}
              </p>
            </div>
            <OrderActions
              order={order}
              disabled={busyId === order.id}
              onUpdate={onUpdate}
            />
          </header>
          <div className="flex flex-wrap gap-2">
            <PaymentBadge status={order.paymentStatus} />
            <FulfillmentBadge status={order.status} />
          </div>
          <div className="text-xs">
            <p>{order.customer.name}</p>
            <p className="text-foreground/60">{order.customer.phone}</p>
            <p className="text-foreground/60 wrap-break-word">
              {order.customer.address}
            </p>
          </div>
          <div className="text-xs border-t border-foreground/10 pt-3">
            <ItemList order={order} />
          </div>
          <div className="flex justify-between border-t border-foreground/10 pt-3">
            <span className="text-foreground/60">Total</span>
            <span className="font-semibold">{formatCurrency(order.total)}</span>
          </div>
        </article>
      ))}
    </div>
  </>
);

export default OrdersTable;
