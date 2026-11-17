"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Search } from "lucide-react";
import { Button } from "@/components";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ErrorState from "@/components/ui/ErrorState";
import Input from "@/components/ui/Input";
import Loader from "@/components/ui/Loader";
import { TableCell, TableRow } from "@/components/ui/table";
import AdminPageContent from "@/features/admin/components/AdminPageContent";
import AdminPageHeader from "@/features/admin/components/AdminPageHeader";
import AdminTable from "@/features/admin/components/AdminTable";
import AdminTableTabs, { Tab } from "@/features/admin/components/AdminTableTabs";
import {
  getAdminOrders,
  updateOrder,
} from "@/features/admin/orders/api/order.services";
import type {
  AdminOrder,
  OrderStatus,
  PaymentStatus,
} from "@/features/admin/orders/api/order.mappers";
import formatCurrency from "@/lib/formatCurrency";

const rowHeaders = [
  "order",
  "customer",
  "items",
  "total",
  "payment",
  "fulfillment",
  "",
];

const tabs = {
  All: () => true,
  "Pending Payment": (o: AdminOrder) => o.paymentStatus === "pending",
  Unfulfilled: (o: AdminOrder) =>
    o.paymentStatus === "paid" && o.status === "unfulfilled",
  Shipped: (o: AdminOrder) => o.status === "shipped",
  Delivered: (o: AdminOrder) => o.status === "delivered",
} as const;
type TabName = keyof typeof tabs;

const badge = (tone: "green" | "orange" | "blue" | "red" | "gray") =>
  ({
    green: "bg-green-100 text-green-800",
    orange: "bg-orange-100 text-orange-800",
    blue: "bg-blue-100 text-blue-800",
    red: "bg-red-100 text-red-800",
    gray: "bg-gray-100 text-gray-800",
  })[tone] + " px-2 py-1 rounded-full text-xs capitalize";

const statusTone = {
  unfulfilled: "orange",
  shipped: "blue",
  delivered: "green",
  cancelled: "red",
} as const;

export default function Page() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabName>("All");
  const [search, setSearch] = useState("");

  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: getAdminOrders,
  });

  const mutation = useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string;
      patch: { status?: OrderStatus; paymentStatus?: PaymentStatus };
    }) => updateOrder(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter(
      (o) =>
        tabs[tab](o) &&
        (!q ||
          o.reference.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.phone.includes(q)),
    );
  }, [orders, tab, search]);

  const needsAction = orders.filter(tabs["Pending Payment"]).length +
    orders.filter(tabs.Unfulfilled).length;

  const set = (
    id: string,
    patch: { status?: OrderStatus; paymentStatus?: PaymentStatus },
  ) => mutation.mutate({ id, patch });

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
        <AdminPageHeader.Actions>
          <Button variant="secondary" disabled>
            Export CSV
          </Button>
        </AdminPageHeader.Actions>
      </AdminPageHeader>
      <AdminPageContent>
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <AdminTableTabs>
            {(Object.keys(tabs) as TabName[]).map((name) => (
              <div key={name} onClick={() => setTab(name)}>
                <Tab active={name === tab}>
                  {name} ({orders.filter(tabs[name]).length})
                </Tab>
              </div>
            ))}
          </AdminTableTabs>
          <div className="relative">
            <Search
              size={14}
              className="absolute -translate-y-1/2 top-1/2 left-2.5"
            />
            <Input
              type="text"
              placeholder="Search reference, name or phone..."
              className="pl-8.5"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {mutation.error && (
          <p role="alert" className="text-sm text-destructive">
            {mutation.error.message}
          </p>
        )}

        <div className="min-h-screen flex-1 rounded-xl bg-foreground/5 md:min-h-min">
          {error && <ErrorState error={error.message} />}
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <AdminTable rowHeaders={rowHeaders}>
              {visible.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={rowHeaders.length}>
                    No orders in this view.
                  </TableCell>
                </TableRow>
              ) : (
                visible.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <p className="font-semibold">{order.reference}</p>
                      <p className="text-foreground/60">
                        {new Date(order.createdAt + "Z").toLocaleDateString(
                          "en-NG",
                          { timeZone: "Africa/Lagos" },
                        )}
                        {order.isGuest && " • guest"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p>{order.customer.name}</p>
                      <p className="text-foreground/60">
                        {order.customer.phone}
                      </p>
                      <p className="text-foreground/60 max-w-60 truncate">
                        {order.customer.address}
                      </p>
                    </TableCell>
                    <TableCell>
                      {order.items.map((item) => (
                        <p key={item.id}>
                          {item.quantity} × {item.name}
                          {item.variant && (
                            <span className="text-foreground/60">
                              {" "}
                              ({item.variant})
                            </span>
                          )}
                        </p>
                      ))}
                    </TableCell>
                    <TableCell>{formatCurrency(order.total)}</TableCell>
                    <TableCell>
                      <span
                        className={badge(
                          order.paymentStatus === "paid" ? "green" : "orange",
                        )}
                      >
                        {order.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={badge(statusTone[order.status])}>
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <MoreHorizontal
                            size={14}
                            className="text-foreground/70"
                          />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuGroup>
                            <DropdownMenuLabel>Payment</DropdownMenuLabel>
                            {order.paymentStatus === "pending" ? (
                              <DropdownMenuItem
                                onClick={() =>
                                  set(order.id, { paymentStatus: "paid" })
                                }
                              >
                                Mark as paid
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() =>
                                  set(order.id, { paymentStatus: "pending" })
                                }
                              >
                                Mark as unpaid
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Delivery</DropdownMenuLabel>
                            {(
                              [
                                "unfulfilled",
                                "shipped",
                                "delivered",
                                "cancelled",
                              ] as OrderStatus[]
                            )
                              .filter((s) => s !== order.status)
                              .map((s) => (
                                <DropdownMenuItem
                                  key={s}
                                  onClick={() => set(order.id, { status: s })}
                                >
                                  Mark as {s}
                                </DropdownMenuItem>
                              ))}
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </AdminTable>
          )}
        </div>
      </AdminPageContent>
    </>
  );
}
