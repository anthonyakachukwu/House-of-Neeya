"use client"

import Checkbox from "@/components/ui/Checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ErrorState from "@/components/ui/ErrorState";
import Input from "@/components/ui/Input";
import Loader from "@/components/ui/Loader";
import Select from "@/components/ui/SelectInput";
import { TableCell, TableRow } from "@/components/ui/table";
import AdminPageContent from "@/features/admin/components/AdminPageContent";
import AdminPageHeader from "@/features/admin/components/AdminPageHeader";
import AdminTable from "@/features/admin/components/AdminTable";
import AdminTableTabs, { Tab } from "@/features/admin/components/AdminTableTabs";
import { REFRESH } from "@/features/admin/dashboard/hooks/useDashboardStats";
import ProductForm from "@/features/admin/products/components/ProductForm/ProductForm";
import ProductFormModal from "@/features/admin/products/components/ProductForm/ProductFormModal";
import { getProducts } from "@/features/product/api/product.services";
import formatCurrency from "@/lib/formatCurrency";
import { useQuery } from "@tanstack/react-query";
import { MoreHorizontal, Search } from "lucide-react";
import Image from "next/image";

const rowHeaders = [<Checkbox label="" key={1} />, "product", "category", "price", "stock", "badge", "status", ""]
// const products = [
//   {
//     name: "Product A",
//     category: "Category A",
//     price: "$100.00",
//     stock: "In Stock",
//     badge: "New",
//     status: "Active",
//   },
//   {
//     name: "Product A",
//     category: "Category A",
//     price: "$100.00",
//     stock: "In Stock",
//     badge: "New",
//     status: "Active",
//   },
//   {
//     name: "Product A",
//     category: "Category A",
//     price: "$100.00",
//     stock: "In Stock",
//     badge: "New",
//     status: "Active",
//   },
//   {
//     name: "Product A",
//     category: "Category A",
//     price: "$100.00",
//     stock: "In Stock",
//     badge: "New",
//     status: "Active",
//   },
//   {
//     name: "Product A",
//     category: "Category A",
//     price: "$100.00",
//     stock: "In Stock",
//     badge: "New",
//     status: "Active",
//   },
//   {
//     name: "Product A",
//     category: "Category A",
//     price: "$100.00",
//     stock: "In Stock",
//     badge: "New",
//     status: "Active",
//   },
// ]
const tableTabs = ["All Products", "Published", "Drafts", "Archived"]

export default function Page() {
  const {data, isLoading, error} = useQuery({
    queryKey: ["admin", "products"],
    queryFn: getProducts,
    ...REFRESH,
  })

  return (
    <>
      <AdminPageHeader>
        <AdminPageHeader.Content>
          <AdminPageHeader.Meta>Catalog</AdminPageHeader.Meta>
          <AdminPageHeader.Title>Products</AdminPageHeader.Title>
          <AdminPageHeader.Description>
            34 products in your catalog. Add new products to your store and manage existing ones.
          </AdminPageHeader.Description>
        </AdminPageHeader.Content>
        <AdminPageHeader.Actions>
          <ProductFormModal.Open action="add" />
        </AdminPageHeader.Actions>
      </AdminPageHeader>
      <AdminPageContent>
        <ProductFormModal>
          <ProductForm />
        </ProductFormModal>
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <AdminTableTabs>
            {tableTabs.map((tab) => (
              <Tab key={tab} active={tab === "All Products"}>
                {tab}
              </Tab>
            ))}
          </AdminTableTabs>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search size={14} className="absolute -translate-y-1/2 top-1/2 left-2.5" />
              <Input type="text" placeholder="Search products..." className="pl-8.5" />
            </div>
            <Select className="w-fit h-full text-xs">
              <option value="featured" className="text-xs w-12">
                All Categories
              </option>
              <option value="featured" className="text-xs w-12">
                Men&apos;s Footwear
              </option>
              <option value="featured" className="text-xs w-12">
                Women&apos;s Footwear
              </option>
              <option value="featured" className="text-xs w-12">
                Clothing
              </option>
              <option value="featured" className="text-xs w-12">
                Handbags
              </option>
            </Select>
          </div>
        </div>
        <div className="min-h-screen flex-1 rounded-xl bg-foreground/5 md:min-h-min">
          {
            error &&
            <ErrorState error={error.message} />
          }
          {
            isLoading && <Loader />
          }
          {
            !isLoading && !error && <AdminTable rowHeaders={rowHeaders}>
              {
                data?.products.map((product, index) => (
                  <TableRow key={index}>
                    <TableCell><Checkbox label="" /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <div className="aspect-8/10">
                          <Image src={product.image.src} alt={product.name} width={40} height={50} />
                        </div>
                        <div className="flex flex-col flex-3">
                          <span className="font-semibold">{product.name}</span>
                          <span className="text-foreground/60 text-[10px]">SKU: {product.sku}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{formatCurrency(product.price)}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      {
                        product.tags?.map((tag: string, index: number) => (
                          <span key={index} className="bg-orange-100 text-orange-800 px-2 py-1 ml-1 rounded-full text-xs">
                            {tag}
                          </span>
                        ))
                      }
                    </TableCell>
                    <TableCell><span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Published</span></TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger><MoreHorizontal size={14} className="text-foreground/70" /></DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuGroup>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <ProductFormModal.Open action="edit" productId={product.id}><DropdownMenuItem>Edit</DropdownMenuItem></ProductFormModal.Open>
                            <DropdownMenuItem>Publish</DropdownMenuItem>
                            <DropdownMenuItem>Delete</DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    {/* {
                pathname === "/admin/orders" && <TableCell className="text-foreground/70 hover:text-foreground hover:underline cursor-pointer">View</TableCell>
              } */}
                  </TableRow>
                ))
              }
            </AdminTable>
          }
        </div>
      </AdminPageContent>
    </>
  );
}
