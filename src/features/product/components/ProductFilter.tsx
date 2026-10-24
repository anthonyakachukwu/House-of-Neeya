"use client";

import Checkbox from "@/components/ui/Checkbox";
import RadioButton from "@/components/ui/RadioButton";
import RangeSlider from "@/components/ui/RangeSlider";
import formatCurrency from "@/lib/formatCurrency";
import type { ProductCategory } from "../types/product.types";
import { DEFAULT_FILTERS, type ProductFilters } from "../lib/productFilters";

const CATEGORIES: ProductCategory[] = [
  "Men's Footwear",
  "Women's Footwear",
  "Clothing",
  "Handbags",
];

export interface ProductFilterProps {
  filters: ProductFilters;
  onChange: (filters: ProductFilters) => void;
  /** Highest price in the catalogue; the slider's upper bound. */
  priceCeiling: number;
  isOpen: boolean;
}

export default function ProductFilter({
  filters,
  onChange,
  priceCeiling,
  isOpen,
}: ProductFilterProps) {
  const currentMax = filters.maxPrice ?? priceCeiling;

  function toggleCategory(category: ProductCategory) {
    const categories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    onChange({ ...filters, categories });
  }

  function handlePriceChange(value: number) {
    // Slider at the top means "no cap".
    onChange({ ...filters, maxPrice: value >= priceCeiling ? null : value });
  }

  return (
    <aside className={`block md:sticky md:top-35 rounded-2xl h-fit p-8 mb-12 md:mb-24 lg:mb-30 bg-white w-full max-w-100 transition-all duration-3000 ease-in-out ${isOpen ? "left-0" : "-left-full"}`}>
      <div className="flex items-baseline justify-between pb-4 border-b border-b-foreground/10">
        <h4 className="font-serif font-light text-foreground text-[24px]">Filters</h4>
        <button
          type="button"
          onClick={() => onChange(DEFAULT_FILTERS)}
          className="uppercase text-xs text-foreground/60 hover:text-foreground cursor-pointer tracking-widest"
        >
          Clear All
        </button>
      </div>
      <div className="flex flex-col gap-8 py-4 text-sm">
        <div className="flex flex-col gap-4">
          <div className="uppercase text-xs tracking-widest">Category</div>
          <div className="flex flex-col gap-4">
            {CATEGORIES.map((category) => (
              <Checkbox
                key={category}
                label={category}
                checked={filters.categories.includes(category)}
                onChange={() => toggleCategory(category)}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between uppercase text-xs tracking-widest">
            <span>Max Price</span>
            <span className="normal-case text-foreground/60">
              {filters.maxPrice === null ? "Any" : formatCurrency(currentMax)}
            </span>
          </div>
          <RangeSlider
            min={0}
            max={priceCeiling}
            step={1000}
            value={currentMax}
            onChange={(e) => handlePriceChange(Number(e.target.value))}
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="uppercase text-xs tracking-widest">Availability</div>
          <div className="flex flex-col gap-4">
            <RadioButton
              label="All Items"
              name="availability"
              checked={!filters.inStockOnly}
              onChange={() => onChange({ ...filters, inStockOnly: false })}
            />
            <RadioButton
              label="In Stock Only"
              name="availability"
              checked={filters.inStockOnly}
              onChange={() => onChange({ ...filters, inStockOnly: true })}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}