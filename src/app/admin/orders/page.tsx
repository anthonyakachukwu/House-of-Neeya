"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components";
import ErrorState from "@/components/ui/ErrorState";
import AdminSearch from "@/features/admin/components/AdminSearch";
import { orderMatches } from "@/features/admin/orders/lib/orderSearch";
import Loader from "@/components/ui/Loader";
import AdminPageContent from "@/features/admin/components/AdminPageContent";
import AdminPageHeader from "@/features/admin/components/AdminPageHeader";
import AdminTableTabs, { Tab } from "@/features/admin/components/AdminTableTabs";
import {
  getAdminOrders,
  updateOrder,
} from "@/features/admin/orders/api/order.services";
import type { AdminOrder } from "@/features/admin/orders/api/order.mappers";
import OrdersTable from "@/features/admin/orders/components/OrdersTable";
import type { OrderPatch } from "@/features/admin/orders/components/OrderActions";

const PAGE_SIZE = 20;

const tabs = {
  All: () => true,
  "Pending Payment": (o: AdminOrder) =>
    o.paymentStatus === "pending" && o.status !== "cancelled",
  Unfulfilled: (o: AdminOrder) =>
    o.paymentStatus === "paid" && o.status === "unfulfilled",
  Shipped: (o: AdminOrder) => o.status === "shipped",
  Delivered: (o: AdminOrder) => o.status === "delivered",
  Cancelled: (o: AdminOrder) => o.status === "cancelled",
} as const;
type TabName = keyof typeof tabs;

export default function Page() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabName>("All");
  const [search, setSearch] = useState("");
  const [shown, setShown] = useState(PAGE_SIZE);

  const {
    data: orders = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: getAdminOrders,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const mutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: OrderPatch }) =>
      updateOrder(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "analytics"] });
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter(
      (o) =>
        tabs[tab](o) &&
        (!q ||
          o.reference.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.phone.includes(q) ||
          o.customer.email.toLowerCase().includes(q)),
    );
  }, [orders, tab, search]);

  const needsAction =
    orders.filter(tabs["Pending Payment"]).length +
    orders.filter(tabs.Unfulfilled).length;

  const visible = useMemo(
    () => orders.filter((o) => tabs[tab](o) && orderMatches(o, search)),
    [orders, tab, search],
  );

  return (
    <>
      <AdminPageHeader>
        <AdminPageHeader.Content>
          <AdminPageHeader.Meta>Fulfillment</AdminPageHeader.Meta>
          <AdminPageHeader.Title>Orders</AdminPageHeader.Title>
          <AdminPageHeader.Description>
            {orders.length} orders total. {needsAction} need action.
          </AdminPageHeader.Description>
        </AdminPageHeader.Content>
      </AdminPageHeader>
      <AdminPageContent>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <AdminTableTabs>
            {(Object.keys(tabs) as TabName[]).map((name) => (
              <Tab key={name} active={name === tab} onClick={() => setTab(name)}>
                {name} ({orders.filter(tabs[name]).length})
              </Tab>
            ))}
          </AdminTableTabs>
          <AdminSearch
            label="Search orders"
            placeholder="Search reference, name, phone, item..."
            value={search}
            onChange={setSearch}
          />
        </div>
        {!isLoading && !error && (
          <p className="text-xs text-foreground/60" aria-live="polite">
            Showing {visible.length} of {orders.length} orders
          </p>
        )}

        {mutation.error && (
          <p role="alert" className="text-sm text-destructive">
            {mutation.error.message}
          </p>
        )}

        <div className="flex-1 rounded-xl bg-foreground/5">
          {error && <ErrorState error={error.message} />}
          {isLoading && <Loader />}
          {!isLoading && !error && filtered.length === 0 && (
            <p className="py-16 text-center text-sm text-foreground/60">
              {search.trim() ? `No orders match "${search.trim()}".` : "No orders in this view."}
            </p>
          )}
          {!isLoading && !error && filtered.length > 0 && (
            <>
              <OrdersTable
                orders={visible}
                busyId={mutation.isPending ? mutation.variables?.id : null}
                onUpdate={(id, patch) => mutation.mutate({ id, patch })}
              />
              <div className="flex flex-col items-center gap-2 p-4 text-xs text-foreground/60">
                <p>
                  Showing {visible.length} of {filtered.length}
                </p>
                {visible.length < filtered.length && (
                  <Button
                    variant="secondary"
                    className="w-fit"
                    onClick={() => setShown((n) => n + PAGE_SIZE)}
                  >
                    Load more
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </AdminPageContent>
    </>
  );
}
