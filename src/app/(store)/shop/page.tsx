"use client";

import { Button } from "@/components";
import SectionLayout from "@/components/layout/SectionLayout";
import PageNavigator from "@/components/ui/PageNavigator";
import { useCartStore } from "@/features/cart/store/cartStore";
import { useWishlistStore } from "@/features/wishlist/store/wishlistStore";
import ProductCard from "@/features/product/components/ProductCard";
import ProductCardLoader from "@/features/product/components/ProductCardLoader";
import ProductGrid from "@/features/product/components/ProductGrid";
import ProductFilter from "@/features/product/components/ProductFilter";
import { FilterIcon, FilterXIcon, Heart } from "lucide-react";
import { useMemo, useState } from "react";
import { useProducts } from "@/features/product/hooks/useProducts";
import {
  DEFAULT_FILTERS,
  filterProducts,
  type ProductFilters,
} from "@/features/product/lib/productFilters";
import {
  SORT_OPTIONS,
  sortProducts,
  type SortOption,
} from "@/features/product/lib/productSort";
import Select from "@/components/ui/SelectInput";
import {
  FilterToggleProvider,
  useFilterToggle,
} from "@/features/product/provider/filterMenuToggleContext";
import ErrorState from "@/components/ui/ErrorState";

export default function Home() {
  return (
    <FilterToggleProvider>
      <Shop />
    </FilterToggleProvider>
  );
}

function Shop() {
  const { isOpen, toggleFilter } = useFilterToggle();
  const { data: products = [], isLoading: loading, error } = useProducts();
  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const { addToCart } = useCartStore();
  const [filters, setFilters] = useState<ProductFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortOption>("featured");
  const [pageNumber, setPageNumber] = useState<number>(1);
  const productsPerPage = 12;

  const filteredProducts = useMemo(
    () => filterProducts(products, filters),
    [products, filters],
  );

  const priceCeiling = useMemo(() => {
    const highest = Math.max(0, ...products.map((p) => p.price));
    return Math.max(1000, Math.ceil(highest / 1000) * 1000);
  }, [products]);

  const handleFiltersChange = (next: ProductFilters) => {
    setFilters(next);
    setPageNumber(1); // otherwise you can land on an empty page 3
  };

  const sortedProducts = useMemo(
    () => sortProducts(filteredProducts, sort),
    [filteredProducts, sort],
  );

  const startIndex = (pageNumber - 1) * productsPerPage;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + productsPerPage);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const sortSelect = (
    <Select
      className="text-xs"
      value={sort}
      onChange={(e) => {
        setSort(e.target.value as SortOption);
        setPageNumber(1);
      }}
    >
      {SORT_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  );

  return (
    <>
      <SectionLayout className="relative text-center overflow-hidden py-8!">
        <div className="flex flex-col items-center justify-center">
          <SectionLayout.Tag className="mb-6 text-xs">The Collection</SectionLayout.Tag>
          <SectionLayout.Heading className="italic text-[clamp(36px,6vw,68px)]">
            Shop All Wears
          </SectionLayout.Heading>
        </div>
      </SectionLayout>
      <SectionLayout className="flex flex-col md:flex-row gap-8 py-0!">
        {isOpen && (
          <ProductFilter
            isOpen={isOpen}
            filters={filters}
            onChange={handleFiltersChange}
            priceCeiling={priceCeiling}
          />
        )}
        {loading ? (
          <div className="flex flex-col w-full @container">
            <div className="flex flex-col md:flex-row w-full md:items-center md:justify-between gap-4 my-4 py-2 text-xs text-foreground/60">
              <div className="flex items-center gap-4">
                {isOpen ? (
                  <FilterXIcon
                    width={18}
                    strokeWidth={1.5}
                    className="cursor-pointer hover:text-foreground"
                    onClick={toggleFilter}
                  />
                ) : (
                  <FilterIcon
                    width={18}
                    strokeWidth={1.5}
                    className="cursor-pointer hover:text-foreground"
                    onClick={toggleFilter}
                  />
                )}{" "}
                Loading....
              </div>
              {sortSelect}
            </div>
            <ProductGrid>
              {[...Array(12)].map((_, index) => {
                return <ProductCardLoader key={index} />;
              })}
            </ProductGrid>
          </div>
        ) : (
          <div className="flex flex-col w-full @container">
            <div className="flex flex-col md:flex-row w-full md:items-center md:justify-between gap-4 my-4 py-2 text-xs text-foreground/60">
              <div className="flex items-center gap-4">
                {isOpen ? (
                  <FilterXIcon
                    width={18}
                    strokeWidth={1.5}
                    className="cursor-pointer hover:text-foreground"
                    onClick={toggleFilter}
                  />
                ) : (
                  <FilterIcon
                    width={18}
                    strokeWidth={1.5}
                    className="cursor-pointer hover:text-foreground"
                    onClick={toggleFilter}
                  />
                )}{" "}
                Showing {products.length} products
              </div>
              {sortSelect}
            </div>
            {error && <ErrorState error={error.message} />}
            {!error && filteredProducts.length === 0 && (
              <p className="py-12 text-center text-sm text-foreground/60">
                No products match these filters.
              </p>
            )}
            <ProductGrid>
              {paginatedProducts.map((product) => {
                const inWishlist = isInWishlist(product.id);

                return (
                  <ProductCard key={product.id}>
                    {(selectedOption, handleClick) => {
                      return (
                        <>
                          <ProductCard.Image
                            src={product.image.src}
                            alt={product.image.alt}
                          />
                          <ProductCard.Tags>
                            {product.tags?.map((tag) => {
                              return (
                                <ProductCard.Tag key={tag}>
                                  {tag}
                                </ProductCard.Tag>
                              );
                            })}
                          </ProductCard.Tags>
                          <ProductCard.Wishlist
                            isActive={inWishlist}
                            onClick={() => toggleWishlist(product)}
                          >
                            <Heart
                              size={16}
                              className={
                                inWishlist
                                  ? "fill-red-600 stroke-red-600"
                                  : "fill-none stroke-foreground"
                              }
                            />
                          </ProductCard.Wishlist>
                          <ProductCard.VariantSelector>
                            <ProductCard.VariantGroup>
                              {product.variants?.map((variant, key) => {
                                return (
                                  variant && (
                                    <ProductCard.VariantOption
                                      key={key}
                                      variant={variant}
                                      selectedOption={selectedOption}
                                      handleClick={() => handleClick(variant)}
                                    />
                                  )
                                );
                              })}
                            </ProductCard.VariantGroup>
                          </ProductCard.VariantSelector>
                          <ProductCard.Content>
                            <ProductCard.Category>
                              {product.category}
                            </ProductCard.Category>
                            <ProductCard.Name>{product.name}</ProductCard.Name>
                            <ProductCard.Price product={product} />
                            <ProductCard.Description>
                              {product.description}
                            </ProductCard.Description>
                            <Button
                              variant="secondary"
                              disabled={!!product.variants?.length && !selectedOption.color && !selectedOption.size || product.stock===0}
                              onClick={() =>
                                addToCart({
                                  ...product,
                                  color: selectedOption.color,
                                  size: selectedOption.size,
                                  quantity: 0,
                                })
                              }
                            >
                              {product.stock===0 ? "Sold Out" : !!product.variants?.length && !selectedOption.color && !selectedOption.size ? "Select an Option" : "Add to Cart"}
                            </Button>
                          </ProductCard.Content>
                        </>
                      );
                    }}
                  </ProductCard>
                );
              })}
            </ProductGrid>
            <PageNavigator
              onPageClick={(number) =>
                setPageNumber(number)
              }
              onNextPage={() => setPageNumber((prev) => prev + 1)}
              onPrevPage={() => setPageNumber((prev) => prev - 1)}
              currentPage={pageNumber}
              totalPages={totalPages}
              className="py-6"
            />
          </div>
        )}
      </SectionLayout>
    </>
  );
}
