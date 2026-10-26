"use client";

import AnnouncementBanner from "../shared/AnnouncementBanner";
// import Logo from "@/assets/Logo-Primary-Light.png";
import LogoLight from "@/assets/Logo-Primary-Light.png";
import Nav from "../ui/Nav";
import Image from "next/image";
import {
  Heart,
  CircleUser,
  MenuIcon,
  X,
  ShoppingCart,
  BellIcon,
  LogOutIcon,
  House,
  ShoppingBag,
  Info,
  Mail,
  User,
  Package,
  CircleHelp,
  Settings,
} from "lucide-react";
import { NavToggleProvider } from "@/providers/NavToggleContext";
import { FaFacebook, FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa6";
import { usePathname } from "next/navigation";
import SideMenu from "./SideMenu";
import { SideMenuProvider } from "@/providers/SideMenuToggleContext";
import Cart from "@/features/cart/components/Cart";
import Wishlist from "@/features/wishlist/components/Wishlist";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Link from "next/link";

const announcement = [
  "New collection just dropped - shop now 🔥",
  "Free shipping on orders over ₦50,000 🚢",
  "Get 20% off selected items this week 🎉",
  "Pay securely with card or bank transfer 💳",
];

const data = {
  user: {
    name: "Jane Mathews",
    email: "janematthew@hotmail.com",
    avatar: "/avatars/shadcn.jpg",    
  }
}

const NavBar = () => {
  const pathName = usePathname();
  const initials = data.user.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "A"

  return (
    <div className="sticky top-0 inset-x-0 z-10">
      <AnnouncementBanner announcement={announcement} />
      <NavToggleProvider>
        <SideMenuProvider>
          <header>
            <Nav className="bg-background text-foreground">
              <Nav.Hamburger className="mr-12">
                <MenuIcon width={18} strokeWidth={1.5} />
              </Nav.Hamburger>
              <Nav.Logo href="/">
                <Image src={LogoLight} alt="House of Neeya Logo" height={50} />
              </Nav.Logo>
              <Nav.Menu className="uppercase text-sm">
                <Nav.Item
                  href="/"
                  className={
                    pathName === "/" ? "text-primary after:w-full" : undefined
                  }
                >
                  Home
                </Nav.Item>
                <Nav.Item
                  href="/shop"
                  className={
                    pathName === "/shop"
                      ? "text-primary after:w-full"
                      : undefined
                  }
                >
                  Shop
                </Nav.Item>
                <Nav.Item
                  href="/about"
                  className={
                    pathName === "/about"
                      ? "text-primary after:w-full"
                      : undefined
                  }
                >
                  About
                </Nav.Item>
                <Nav.Item
                  href="/contact"
                  className={
                    pathName === "/contact"
                      ? "text-primary after:w-full"
                      : undefined
                  }
                >
                  Contact
                </Nav.Item>
              </Nav.Menu>
              <Nav.SideMenu>
                <div className="grid grid-cols-2 px-2 pb-8 border-b border-b-foreground/10">
                  <Nav.Logo href="/">
                    <Image
                      src={LogoLight}
                      alt="House of Neeya Logo"
                      height={50}
                    />
                  </Nav.Logo>
                  <Nav.CloseMenu>
                    <X size={24} strokeWidth={1} className="ml-auto" />
                  </Nav.CloseMenu>
                </div>
                <div className="flex flex-col gap-4 px-2 capitalize">
                  <Nav.SideItem href="/" className="mt-auto" closeMenuOnClick>
                    <House />
                    Home
                  </Nav.SideItem>
                  <Nav.SideItem href="/shop" closeMenuOnClick>
                    <ShoppingBag />
                    Shop
                  </Nav.SideItem>
                  <Nav.SideItem href="/about" closeMenuOnClick>
                    <Info />
                    About
                  </Nav.SideItem>
                  <Nav.SideItem href="/contact" closeMenuOnClick>
                    <Mail />
                    Contact
                  </Nav.SideItem>
                </div>
                <Nav.SideFooter className="flex flex-col px-5">
                  <p className="text-sm font-light">Follow us</p>
                  <Nav.SocialIcons>
                    <Nav.SocialIcon href="/">
                      <FaWhatsapp size={18} strokeWidth={1.5} />
                    </Nav.SocialIcon>
                    <Nav.SocialIcon href="/">
                      <FaTiktok size={18} strokeWidth={1.5} />
                    </Nav.SocialIcon>
                    <Nav.SocialIcon href="/">
                      <FaFacebook size={18} strokeWidth={1.5} />
                    </Nav.SocialIcon>
                    <Nav.SocialIcon href="/">
                      <FaInstagram size={18} strokeWidth={1.5} />
                    </Nav.SocialIcon>
                  </Nav.SocialIcons>
                </Nav.SideFooter>
              </Nav.SideMenu>
              <Nav.Actions>
                <SideMenu.OpenSideMenu menu="cart">
                  <ShoppingCart width={18} strokeWidth={1.5} />
                </SideMenu.OpenSideMenu>
                <SideMenu.OpenSideMenu menu="wishlist">
                  <Heart width={18} strokeWidth={1.5} />
                </SideMenu.OpenSideMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger render={
                    <button><CircleUser width={18} strokeWidth={1.5} /></button>
                  } />
                  <DropdownMenuContent>
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="p-0 font-normal">
                        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                          <Avatar>
                            <AvatarImage src={data.user.avatar} alt={data.user.name} />
                            <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>
                          <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-medium capitalize">{data.user.name}</span>
                            <span className="truncate text-xs lowercase">{data.user.email}</span>
                          </div>
                        </div>
                      </DropdownMenuLabel>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem render={<Link href="/admin/dashboard" />}>
                        <User
                        />
                        My Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem render={<Link href="/admin/orders" />}>
                        <Package
                        />
                        My Orders
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem render={<Link href="/admin/settings" />}>
                        <Settings
                        />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem render={<Link href="/help" />}>
                        <CircleHelp
                        />
                        Help & Support
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <BellIcon
                        />
                        Notifications
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem render={<Link href="/signup" />}>
                      <LogOutIcon
                      />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </Nav.Actions>
              <SideMenu>
                {
                  (activeMenu) => (activeMenu === "cart" ? <Cart /> : <Wishlist />)
                }
              </SideMenu>
            </Nav>
          </header>
        </SideMenuProvider>
      </NavToggleProvider>
    </div>
  );
};

export default NavBar;
