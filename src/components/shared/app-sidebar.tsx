"use client";

import * as React from "react";

import { NavProjects } from "@/components/shared/nav-projects";
import { NavUser } from "@/components/shared/nav-user";
import LogoIconDarkAlt from "@/assets/Logo-Icon-Dark-Alt.png"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  ChartNoAxesCombined,
  Settings,
} from "lucide-react";
import Image from "next/image"
import Link from "next/link";

// This is sample data.
const data = {
  user: {
    name: "Jane Matthew",
    email: "janematthew@hotmail.com",
    avatar: "/avatars/shadcn.jpg",
  },
  projects: [
    {
      name: "Dashboard",
      url: "/admin/dashboard",
      icon: <LayoutDashboard />,
    },
    {
      name: "Products",
      url: "/admin/products",
      icon: <Package />,
    },
    {
      name: "Orders",
      url: "/admin/orders",
      icon: <ShoppingBag />,
    },
    {
      name: "Analytics",
      url: "/admin/analytics",
      icon: <ChartNoAxesCombined />,
    },
    {
      name: "Settings",
      url: "/admin/settings",
      icon: <Settings />,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="border-b border-b-foreground/10">
        <div className="flex items-center gap-2 py-5.25 min-w-fit">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
            <Link href="/"><Image src={LogoIconDarkAlt} alt="Logo" className="h-8 w-auto" loading="eager" /></Link>
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight tracking-widest">
            <span className="truncate font-medium text-base font-serif">House of Neeya</span>
            <span className="truncate text-[10px] font-light">Admin</span>
          </div>          
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
