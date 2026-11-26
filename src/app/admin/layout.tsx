"use client"

import { AppSidebar } from "@/components/shared/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { ReactNode } from "react"
import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AnnouncementBanner } from "@/components"
import { ProductFormProvider } from "@/features/admin/products/provider/ProductFormToggleContext"
import { useAuthUser } from "@/features/auth/hooks/useAuthUser"

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const pathName = usePathname();
  const path = pathName.split("/").at(-1)
  const { profile } = useAuthUser()
  const initials = profile?.displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "A"

  const announcement = [
    "New collection just dropped - shop now 🔥",
    "Free shipping on orders over ₦50,000 🚢",
    "Get 20% off selected items this week 🎉",
    "Pay securely with card or bank transfer 💳",
  ];

  return (
    <SidebarProvider>
      <ProductFormProvider>
        <AppSidebar />
        <SidebarInset>
          <AnnouncementBanner announcement={announcement} />
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-16 border-b border-b-foreground/10">
            <div className="flex w-full items-center gap-2 px-8">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-vertical:h-4 data-vertical:self-auto"
              />
              <Breadcrumb className="mr-auto">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage className="tracking-wide">{path}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <div className="flex items-center gap-2 py-2 min-w-fit">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
                  <Avatar>
                    <AvatarImage src="/avatar" alt="Jane Matthews" />
                    <AvatarFallback className="bg-accent text-background">{initials}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight tracking-widest">
                  <span className="truncate font-medium text-base font-serif">{profile?.displayName}</span>
                  <span className="truncate text-[10px] font-light">Admin</span>
                </div>
              </div>
            </div>
          </header>
          {children}
        </SidebarInset>
      </ProductFormProvider>
    </SidebarProvider>
  )
}

export default AdminLayout