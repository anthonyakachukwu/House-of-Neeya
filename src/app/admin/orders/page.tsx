"use client"

import { Button } from "@/components";
import Checkbox from "@/components/ui/Checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ErrorState from "@/components/ui/ErrorState";
import Input from "@/components/ui/Input";
import Loader from "@/components/ui/Loader";
import { TableCell, TableRow } from "@/components/ui/table";
import AdminPageContent from "@/features/admin/components/AdminPageContent";
import AdminPageHeader from "@/features/admin/components/AdminPageHeader";
import AdminTable from "@/features/admin/components/AdminTable";
import AdminTableTabs, { Tab } from "@/features/admin/components/AdminTableTabs";
import ProductFormModal from "@/features/admin/products/components/ProductForm/ProductFormModal";
import { mapProductFromDatabase } from "@/features/product/api/product.mappers";
import { getProducts } from "@/features/product/api/product.services";
import { Product } from "@/features/product/types/product.types";
import formatCurrency from "@/lib/formatCurrency";
import { MoreHorizontal, Search } from "lucide-react";
import { useEffect, useState } from "react";

const rowHeaders = ["order", "customer", "item", "total", "payment", "fulfillment", ""]
const tableTabs = ["All", "Pending Payment", "Unfulfilled", "Shipped", "Delivered"]

export default function Page() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);

        const { products, error } = await getProducts();
        const mappedProducts = products.map(mapProductFromDatabase);

        if (error) {
          throw new Error(error)
        }

        setProducts(mappedProducts);
      } catch (error) {
        console.error("Failed to load products:", error);
        setError(error instanceof Error ? error.message : String(error));
      } finally {
        setLoading(false);
      }
    }

    loadProducts()
  }, [])

  return (
    <>
      <AdminPageHeader>
        <AdminPageHeader.Content>
          <AdminPageHeader.Meta>Fulfillment</AdminPageHeader.Meta>
          <AdminPageHeader.Title>Orders</AdminPageHeader.Title>
          <AdminPageHeader.Description>
            124 orders total. 5 needs action.
          </AdminPageHeader.Description>
        </AdminPageHeader.Content>
        <AdminPageHeader.Actions>
          <Button variant="secondary">Export CSV</Button>
        </AdminPageHeader.Actions>
      </AdminPageHeader>
      <AdminPageContent>
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <AdminTableTabs>
            {tableTabs.map((tab) => (
              <Tab key={tab} active={tab === "All"}>
                {tab}
              </Tab>
            ))}
          </AdminTableTabs>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search size={14} className="absolute -translate-y-1/2 top-1/2 left-2.5" />
              <Input type="text" placeholder="Search products..." className="pl-8.5" />
            </div>
          </div>
        </div>
        <div className="min-h-screen flex-1 rounded-xl bg-foreground/5 md:min-h-min">
          {
            error &&
            <ErrorState error={error} />
          }
          {
            loading && <Loader />
          }
          {
            !loading && !error && <AdminTable rowHeaders={rowHeaders}>
              {
                products.map((product, index) => (
                  <TableRow key={index}>
                    <TableCell><Checkbox label="" /></TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{formatCurrency(product.price)}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>{product.tags}</TableCell>
                    <TableCell>published</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger><MoreHorizontal size={14} className="text-foreground/70" /></DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuGroup>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <ProductFormModal.Open action="edit"><DropdownMenuItem>Edit</DropdownMenuItem></ProductFormModal.Open>
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
