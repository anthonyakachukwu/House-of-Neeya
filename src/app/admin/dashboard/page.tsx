"use client"

import { Button } from "@/components";
import AdminPageContent from "@/features/admin/components/AdminPageContent";
import AdminPageHeader from "@/features/admin/components/AdminPageHeader";
import ProductForm from "@/features/admin/products/components/ProductForm/ProductForm";
import ProductFormModal from "@/features/admin/products/components/ProductForm/ProductFormModal";
import SummaryTable from "@/features/admin/components/SummaryTable";
import { ArrowRight, ClipboardCheck, PackageCheck, ShoppingBag, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import StatCards from "@/features/admin/components/StatCards";
import { useAuthUser } from "@/features/auth/hooks/useAuthUser";

type MonthToStringMap = {
  [key: number]: string;
};

const monthtoStringMap: MonthToStringMap = {
  1: "Jan",
  2: "Feb",
  3: "Mar",
  4: "Apr",
  5: "May",
  6: "Jun",
  7: "Jul",
  8: "Aug",
  9: "Sep",
  10: "Oct",
  11: "Nov",
  12: "Dec"
}

export default function Page() {
  const { profile } = useAuthUser()
  const date = new Date()
  const month = monthtoStringMap[date.getMonth() + 1]
  const day = date.getDate()
  const year = date.getFullYear()
  const hour = date.getHours()
  let timeOfDay

  switch (true) {
    case (hour >= 5 && hour < 12):
      timeOfDay = "Morning"
      break;

    case (hour >= 12 && hour < 17):
      timeOfDay = "Afternoon"
      break;

    case (hour >= 17 && hour < 21):
      timeOfDay = "Evening"
      break;

    default:
      timeOfDay = "Night"
  }

  const router = useRouter()


  return (
    <>
      <AdminPageHeader>
        <AdminPageHeader.Content>
          <AdminPageHeader.Meta>Today • {month} {day}, {year}</AdminPageHeader.Meta>
          <AdminPageHeader.Title>Good {timeOfDay} {profile ? ` ${profile?.shortName}` : ""}</AdminPageHeader.Title>
          <AdminPageHeader.Description>
            Here&apos;s what&apos;s happening at House of Neeya right now.
          </AdminPageHeader.Description>
        </AdminPageHeader.Content>
        <AdminPageHeader.Actions>
          <Button variant="secondary" className="w-fit" onClick={() => router.push("/admin/orders")}>View Pending Orders</Button>
          <ProductFormModal.Open action="add" />
        </AdminPageHeader.Actions>
      </AdminPageHeader>
      <AdminPageContent>
        <ProductFormModal>
          <ProductForm />
        </ProductFormModal>
        <StatCards />
        <div className="flex flex-col md:flex-row gap-4 w-full">
          <SummaryTable className="flex-6">
            <SummaryTable.Header>
              <SummaryTable.Title>Need your attention</SummaryTable.Title>
              <SummaryTable.Action href="/admin/orders">View all orders <ArrowRight /></SummaryTable.Action>
            </SummaryTable.Header>
            <SummaryTable.Content>
              <SummaryTable.Empty>
                <ClipboardCheck />
                <p className="font-bold">No orders need attention</p>
                <p className="normal-case">You&apos;re all caught up!</p>
              </SummaryTable.Empty>
            </SummaryTable.Content>
          </SummaryTable>
          <SummaryTable className="flex-4">
            <SummaryTable.Header>
              <SummaryTable.Title>Low stock</SummaryTable.Title>
              <SummaryTable.Action href="/admin/products">Manage products <ArrowRight /></SummaryTable.Action>
            </SummaryTable.Header>
            <SummaryTable.Content>
              <SummaryTable.Empty>
                <PackageCheck />
                <p className="font-bold">No low stock items</p>
                <p className="normal-case">All products are sufficiently stocked!</p>
              </SummaryTable.Empty>
            </SummaryTable.Content>
          </SummaryTable>
        </div>
        <div className="flex flex-col md:flex-row gap-4 w-full">
          <SummaryTable className="flex-6">
            <SummaryTable.Header>
              <SummaryTable.Title>Recent Orders</SummaryTable.Title>
              <SummaryTable.Action href="/admin/orders">View all <ArrowRight /></SummaryTable.Action>
            </SummaryTable.Header>
            <SummaryTable.Content>
              <SummaryTable.Empty>
                <ShoppingBag />
                <p className="font-bold">No recent orders</p>
                <p className="normal-case">New orders will appear here when customers places them</p>
              </SummaryTable.Empty>
            </SummaryTable.Content>
          </SummaryTable>
          <SummaryTable className="flex-4">
            <SummaryTable.Header>
              <SummaryTable.Title>Top Products</SummaryTable.Title>
              <SummaryTable.Action href="/admin/products">View analytics <ArrowRight /></SummaryTable.Action>
            </SummaryTable.Header>
            <SummaryTable.Content>
              <SummaryTable.Empty>
                <Trophy />
                <p className="font-bold">No top product yet</p>
                <p className="normal-case">Start selling more to get featured!</p>
              </SummaryTable.Empty>
            </SummaryTable.Content>
          </SummaryTable>
        </div>
      </AdminPageContent>
    </>
  );
}
