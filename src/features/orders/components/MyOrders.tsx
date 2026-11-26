"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components";
import SectionLayout from "@/components/layout/SectionLayout";
import ErrorState from "@/components/ui/ErrorState";
import Loader from "@/components/ui/Loader";
import { useAuthUser } from "@/features/auth/hooks/useAuthUser";
import { getMyOrders } from "@/features/admin/orders/api/order.services";
import type { AdminOrder } from "@/features/admin/orders/api/order.mappers";
import { buildWhatsAppLink } from "@/features/checkout/lib/checkout.constants";
import formatCurrency from "@/lib/formatCurrency";
import { formatDate } from "@/lib/formatDate";
import { getOrderSummary, toneClass } from "../lib/orderStatus";
import OrderTracker from "./OrderTracker";

const filters = {
  All: () => true,
  "In progress": (o: AdminOrder) =>
    o.status === "unfulfilled" || o.status === "shipped",
  Delivered: (o: AdminOrder) => o.status === "delivered",
  Cancelled: (o: AdminOrder) => o.status === "cancelled",
} as const;
type FilterName = keyof typeof filters;

function OrderCard({ order }: { order: AdminOrder }) {
  const summary = getOrderSummary(order);
  const subtotal = order.total - order.shippingFee;

  return (
    <article className="flex flex-col gap-5 bg-white p-4 md:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-serif text-xl font-semibold">{order.reference}</p>
          <p className="text-xs text-foreground/60">
            Placed {formatDate(order.createdAt)}
          </p>
        </div>
        <span
          className={`${toneClass[summary.tone]} px-3 py-1 rounded-full text-xs whitespace-nowrap`}
        >
          {summary.label}
        </span>
      </header>

      <p className="text-sm text-foreground/70">{summary.message}</p>

      <OrderTracker order={order} />

      {order.paymentStatus === "pending" && order.status !== "cancelled" && (
        <a
          href={buildWhatsAppLink(order.reference, order.total)}
          target="_blank"
          rel="noopener noreferrer"
          className="block md:w-fit"
        >
          <Button variant="secondary">Send proof on WhatsApp</Button>
        </a>
      )}

      <details className="group border-t border-foreground/10 pt-4 text-sm">
        <summary className="cursor-pointer text-xs uppercase tracking-widest text-foreground/60 hover:text-foreground">
          View order details
        </summary>
        <div className="mt-4 flex flex-col gap-4">
          <ul className="flex flex-col gap-2">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-4">
                <span className="min-w-0">
                  {item.quantity} × {item.name}
                  {item.variant && (
                    <span className="block text-xs text-foreground/60">
                      {item.variant}
                    </span>
                  )}
                </span>
                <span className="shrink-0">
                  {formatCurrency(item.unitPrice * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <dl className="flex flex-col gap-1 border-t border-foreground/10 pt-3 text-foreground/70">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{formatCurrency(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Delivery</dt>
              <dd>{formatCurrency(order.shippingFee)}</dd>
            </div>
            <div className="flex justify-between text-foreground font-semibold">
              <dt>Total</dt>
              <dd>{formatCurrency(order.total)}</dd>
            </div>
          </dl>
          <div className="text-xs text-foreground/60">
            <p className="uppercase tracking-widest mb-1">Delivering to</p>
            <p>{order.customer.name}</p>
            <p>{order.customer.address}</p>
            <p>{order.customer.phone}</p>
          </div>
        </div>
      </details>
    </article>
  );
}

export default function MyOrders() {
  const { user, profile, loading } = useAuthUser();
  const [filter, setFilter] = useState<FilterName>("All");

  const {
    data: orders = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["my-orders", user?.id],
    queryFn: () => getMyOrders(user!.id),
    enabled: Boolean(user),
    staleTime: 30_000,
    refetchInterval: 60_000, // pick up status changes the admin makes
  });

  if (loading || (user && isLoading)) return <Loader />;
  if (!user) return null; // proxy.ts redirects signed-out visitors to /login

  const visible = orders.filter(filters[filter]);

  return (
    <SectionLayout className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <SectionLayout.Tag>Your orders</SectionLayout.Tag>
        <SectionLayout.Heading className="italic mb-0!">
          Track your orders
        </SectionLayout.Heading>
      </div>

      {profile?.isGuest && (
        <p className="border-l-2 border-accent bg-foreground/5 px-4 py-2 text-xs text-foreground/70">
          You are on a guest session. Keep your order reference numbers: once
          you log out, this list is no longer reachable.
        </p>
      )}

      {error && <ErrorState error={error.message} />}

      {!error && orders.length === 0 && (
        <div className="flex flex-col items-center gap-4 bg-white py-16 px-6 text-center">
          <p className="font-serif text-2xl italic">No orders yet</p>
          <p className="text-sm text-foreground/60">
            When you place an order you can follow it here.
          </p>
          <Link href="/shop" className="block">
            <Button>Start shopping</Button>
          </Link>
        </div>
      )}

      {orders.length > 0 && (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1" role="tablist">
            {(Object.keys(filters) as FilterName[]).map((name) => (
              <button
                key={name}
                type="button"
                role="tab"
                aria-selected={filter === name}
                onClick={() => setFilter(name)}
                className={`shrink-0 px-4 py-2 text-xs uppercase tracking-widest border cursor-pointer transition-colors ${
                  filter === name
                    ? "bg-foreground text-background border-foreground"
                    : "border-foreground/20 hover:border-foreground"
                }`}
              >
                {name} ({orders.filter(filters[name]).length})
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <p className="py-8 text-center text-sm text-foreground/60">
              No orders in this view.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {visible.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </>
      )}
    </SectionLayout>
  );
}
