"use client"

import formatCurrency from "@/lib/formatCurrency";
import Image from "next/image";
import React, { useState } from "react";
import { Product, ProductVariant } from "../types/product.types";

type RenderChildren = (selectedOption: { color: string, size: string }, handleClick: (variant: ProductVariant) => void) => React.ReactNode;

type ProductCardProps = { children?: React.ReactNode | RenderChildren; className?: string; };

type ProductImageProps = { src: string; alt: string; className?: string };

type ProductTagsProps = { children: React.ReactNode; className?: string };

type ProductTagProps = { children: React.ReactNode; className?: string };

// NOTE: added onClick + isActive so the parent can wire this up to a wishlist
// store and control the filled/outline state. Previously this was a static
// <div> with no interactivity at all.
type ProductWishlistProps = {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isActive?: boolean;
};

type ProductVariantGroupProps = { children: React.ReactNode; className?: string };

// NOTE: ProductVariantOption (the version with its own internal useState,
// disconnected from the ProductCard's shared selectedOption state) has been
// removed. It could never stay in sync with siblings and duplicated what
// ProductVariantOptionAlt already does correctly via props. Use
// ProductCard.VariantOption (now pointing at the "Alt" implementation) going
// forward — there is only one variant option component now.
type ProductVariantOptionProps = { selectedOption: { color?: string, size?: string }; handleClick: () => void; variant: ProductVariant; className?: string };

type ProductCardContentProps = { children: React.ReactNode; className?: string };

type ProductCategoryProps = { children: React.ReactNode; className?: string };

type ProductNameProps = { children: React.ReactNode; className?: string };

type ProductPriceProps = { product: Partial<Product>; className?: string };

type ProductVariantSelectorProps = { children: React.ReactNode; className?: string };

type ProductDescriptionProps = { children: React.ReactNode; className?: string };

type ProductColorProps = { children: React.ReactNode; className?: string };

type ProductSizeProps = { children: React.ReactNode; className?: string };

type ProductCardComponent = React.FC<ProductCardProps> & {
  Image: typeof ProductImage;
  Tags: typeof ProductTags;
  Tag: typeof ProductTag;
  Wishlist: typeof ProductWishlist;
  VariantSelector: typeof ProductVariantSelector;
  VariantGroup: typeof ProductVariantGroup;
  VariantOption: typeof ProductVariantOption;
  Content: typeof ProductCardContent;
  Category: typeof ProductCategory;
  Name: typeof ProductName;
  Price: typeof ProductPrice;
  Description: typeof ProductDescription;
  Color: typeof ProductColor;
  Size: typeof ProductSize;
}

const ProductCard = (({ children, className }: ProductCardProps) => {
  const [selectedOption, setSelectedOption] = useState<{ color: string, size: string }>({ color: "", size: "" });
  const handleClick = (variant: ProductVariant) => {
    if (selectedOption?.color === variant.color && selectedOption?.size === variant.size) {
      setSelectedOption({ color: "", size: "" })
      return
    }
    setSelectedOption({ color: variant.color || "", size: variant.size || "" });
  };

  return (
    <div
      className={`overflow-hidden relative w-full rounded-lg transition-all ease-in-out hover:shadow-lg hover:-translate-y-1 group ${className}`}
    >
      {typeof children === "function"
        ? (children as RenderChildren)(selectedOption, handleClick)
        : children}
    </div>
  );
}) as ProductCardComponent

function ProductImage({ src, alt, className }: ProductImageProps) {
  return (
    <div className="relative aspect-4/5 w-full">
      <Image
        src={src}
        className={`object-cover ${className}`}
        alt={alt}
        fill
        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
      />
    </div>
  );
}

function ProductTags({ children, className }: ProductTagsProps) {
  return (
    <div
      className={`absolute top-0 m-2 md:m-3 lg:m-4 flex flex-wrap gap-2 text-[8px] w-25 ${className}`}
    >
      {children}
    </div>
  );
}

function ProductTag({ children, className }: ProductTagProps) {
  return (
    <span
      className={`block py-1 px-2 uppercase rounded-sm bg-background/70 tracking-[0.22em] ${className}`}
    >
      {children}
    </span>
  );
}

function ProductWishlist({ children, className, onClick, isActive }: ProductWishlistProps) {
  return (
    <button
      type="button"
      aria-label={isActive ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={isActive}
      onClick={(e) => {
        // Prevent this from bubbling into any click-through-to-product-page
        // handler that might sit on the card in the future.
        e.stopPropagation();
        onClick?.(e);
      }}
      className={`absolute flex top-0 right-0 m-2 md:m-3 lg:m-4 text-[8px] cursor-pointer transition-all duration-500 ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        } ${className}`}
    >
      {children}
    </button>
  );
}

function ProductVariantSelector({
  children,
  className,
}: ProductVariantSelectorProps) {
  return (
    <div
      className={`absolute z-1 bottom-42 m-2 md:m-3 lg:m-4 flex flex-col gap-2 text-[8px] transition-all duration-500 md:opacity-0 md:group-hover:bottom-52 md:group-hover:opacity-100 ${className}`}
    >
      {children}
    </div>
  );
}

function ProductVariantGroup({
  children,
  className,
}: ProductVariantGroupProps) {
  return (
    <div
      className={`flex gap-2 text-[6px] md:text-[8px] flex-wrap ${className}`}
    >
      {children}
    </div>
  );
}

// This is the (formerly "Alt") implementation. It's controlled — selection
// state lives on the parent ProductCard and is passed down — so multiple
// options rendered in a list all agree on which one is selected.
function ProductVariantOption({ selectedOption, handleClick, variant, className }: ProductVariantOptionProps) {
  const isSelected = selectedOption?.color === variant?.color && selectedOption?.size === variant?.size;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      className={`py-1 px-2.5 ${isSelected ? "bg-foreground text-white" : "bg-white text-foreground"} hover:bg-foreground hover:text-white cursor-pointer ${className}`}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {variant?.color}{variant?.color && variant?.size && " • Size "}{variant?.size}
    </div>
  );
}

function ProductCardContent({ children, className }: ProductCardContentProps) {
  return (
    <div
      className={`relative flex flex-col gap-2 p-2 md:p-3 lg:p-4 bg-white z-2 ${className}`}
    >
      {children}
    </div>
  );
}

function ProductCategory({ children, className }: ProductCategoryProps) {
  return (
    <div
      className={`uppercase text-[10px] text-foreground/60 tracking-[0.22em] ${className}`}
    >
      {children}
    </div>
  );
}

function ProductName({ children, className }: ProductNameProps) {
  return (
    <div
      className={`text-sm md:text-base lg:text-lg font-serif font-bold text-foreground line-clamp-1 w-fit ${className}`}
    >
      {children}
    </div>
  );
}

function ProductPrice({ product, className }: ProductPriceProps) {
  return (
    <div className="flex gap-4">
      {product.discountedPrice && (
        <div
          className={`text-[10px] md:text-xs lg:text-sm text-foreground ${className}`}
        >
          {formatCurrency(product.discountedPrice)}
        </div>
      )}
      <div
        className={`text-[10px] md:text-xs lg:text-sm text-foreground ${className} ${product.discountedPrice ? "line-through text-foreground/50" : ""}`}
      >
        {product.price && formatCurrency(product.price)}
      </div>
    </div>
  );
}

function ProductDescription({ children, className }: ProductDescriptionProps) {
  return (
    <div
      className={`text-xs md:text-sm text-foreground/60 line-clamp-2 ${className}`}
    >
      {children}
    </div>
  );
}

function ProductColor({ children, className }: ProductColorProps) {
  return (
    <div className={`flex flex-col gap-4 p-6 ${className}`}>{children}</div>
  );
}

function ProductSize({ children, className }: ProductSizeProps) {
  return (
    <div className={`flex flex-col gap-4 p-6 ${className}`}>{children}</div>
  );
}

ProductCard.Image = ProductImage;
ProductCard.Tags = ProductTags;
ProductCard.Tag = ProductTag;
ProductCard.Wishlist = ProductWishlist;
ProductCard.VariantSelector = ProductVariantSelector;
ProductCard.VariantGroup = ProductVariantGroup;
ProductCard.VariantOption = ProductVariantOption;
ProductCard.Content = ProductCardContent;
ProductCard.Category = ProductCategory;
ProductCard.Name = ProductName;
ProductCard.Price = ProductPrice;
ProductCard.Description = ProductDescription;
ProductCard.Color = ProductColor;
ProductCard.Size = ProductSize;

export default ProductCard;