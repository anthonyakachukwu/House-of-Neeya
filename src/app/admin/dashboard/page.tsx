"use client"

import { Button } from "@/components";
import AdminPageContent from "@/features/admin/components/AdminPageContent";
import AdminPageHeader from "@/features/admin/components/AdminPageHeader";
import ProductForm from "@/features/admin/products/components/ProductForm/ProductForm";
import ProductFormModal from "@/features/admin/products/components/ProductForm/ProductFormModal";
import { useRouter } from "next/navigation";
import StatCards from "@/features/admin/components/StatCards";
import { useAuthUser } from "@/features/auth/hooks/useAuthUser";
import {
  LowStockPanel,
  NeedsAttentionPanel,
  RecentOrdersPanel,
  TopProductsPanel,
} from "@/features/admin/dashboard/components/DashboardPanels";

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
        <div className="flex w-full flex-col gap-4 md:flex-row">
          <NeedsAttentionPanel />
          <LowStockPanel />
        </div>
        <div className="flex w-full flex-col gap-4 md:flex-row">
          <RecentOrdersPanel />
          <TopProductsPanel />
        </div>
      </AdminPageContent>
    </>
  );
}
