"use client"

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Checkbox from "@/components/ui/Checkbox";
import ErrorState from "@/components/ui/ErrorState";
import Loader from "@/components/ui/Loader";
import Select from "@/components/ui/SelectInput";
import AdminPageContent from "@/features/admin/components/AdminPageContent";
import AdminPageHeader from "@/features/admin/components/AdminPageHeader";
import AdminSearch from "@/features/admin/components/AdminSearch";
import AdminTable from "@/features/admin/components/AdminTable";
import AdminTableTabs, { Tab } from "@/features/admin/components/AdminTableTabs";
import { REFRESH } from "@/features/admin/dashboard/hooks/useDashboardStats";
import ProductForm from "@/features/admin/products/components/ProductForm/ProductForm";
import ProductFormModal from "@/features/admin/products/components/ProductForm/ProductFormModal";
import {
  ProductMobileCard,
  ProductTableRow,
} from "@/features/admin/products/components/ProductListItems";
import { PRODUCT_CATEGORIES } from "@/features/admin/products/constants/product.constants";
import {
  PRODUCT_TABS,
  productMatches,
  type AdminProductRow,
  type ProductTabName,
} from "@/features/admin/products/lib/productSearch";
import { getProducts } from "@/features/product/api/product.services";

const rowHeaders = [<Checkbox label="" key={1} />, "product", "category", "price", "stock", "badge", "status", ""];
const tabNames = Object.keys(PRODUCT_TABS) as ProductTabName[];

export default function Page() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: getProducts,
    ...REFRESH,
  });

  const [tab, setTab] = useState<ProductTabName>("All Products");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const products = useMemo(
    () => (data?.products ?? []) as AdminProductRow[],
    [data],
  );

  const visible = useMemo(
    () =>
      products.filter(
        (p) =>
          PRODUCT_TABS[tab](p) &&
          (category === "all" || p.category === category) &&
          productMatches(p, search),
      ),
    [products, tab, category, search],
  );

  const isFiltering = tab !== "All Products" || category !== "all" || search.trim() !== "";
  const clearFilters = () => {
    setTab("All Products");
    setCategory("all");
    setSearch("");
  };

  return (
    <>
      <AdminPageHeader>
        <AdminPageHeader.Content>
          <AdminPageHeader.Meta>Catalog</AdminPageHeader.Meta>
          <AdminPageHeader.Title>Products</AdminPageHeader.Title>
          <AdminPageHeader.Description>
            {products.length} products in your catalog. Add new products to your store and manage existing ones.
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

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <AdminTableTabs>
            {tabNames.map((name) => (
              <Tab key={name} active={name === tab} onClick={() => setTab(name)}>
                {name} ({products.filter(PRODUCT_TABS[name]).length})
              </Tab>
            ))}
          </AdminTableTabs>
          <div className="flex flex-col gap-2 sm:flex-row">
            <AdminSearch
              label="Search products"
              placeholder="Search name, SKU, brand or tag..."
              value={search}
              onChange={setSearch}
            />
            <Select
              aria-label="Filter by category"
              className="text-xs"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </div>
        </div>

        {!isLoading && !error && (
          <p className="text-xs text-foreground/60" aria-live="polite">
            Showing {visible.length} of {products.length} products
          </p>
        )}

        <div className="flex-1 rounded-xl md:bg-foreground/5">
          {error && <ErrorState error={error.message} />}
          {isLoading && <Loader />}

          {!isLoading && !error && visible.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-12 text-center text-xs text-foreground/60">
              <p>
                {products.length === 0
                  ? "No products yet."
                  : "No products match your filters."}
              </p>
              {isFiltering && (
                <button type="button" onClick={clearFilters} className="cursor-pointer underline underline-offset-4">
                  Clear filters
                </button>
              )}
            </div>
          )}

          {!isLoading && !error && visible.length > 0 && (
            <>
              <div className="hidden md:block">
                <AdminTable rowHeaders={rowHeaders}>
                  {visible.map((product) => (
                    <ProductTableRow key={product.id} product={product} />
                  ))}
                </AdminTable>
              </div>
              <ul className="flex flex-col gap-3 md:hidden">
                {visible.map((product) => (
                  <ProductMobileCard key={product.id} product={product} />
                ))}
              </ul>
            </>
          )}
        </div>
      </AdminPageContent>
    </>
  );
}