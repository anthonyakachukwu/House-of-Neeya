"use client";

import Image from "next/image";
import { MoreHorizontal } from "lucide-react";
import Checkbox from "@/components/ui/Checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import formatCurrency from "@/lib/formatCurrency";
import { badge } from "@/features/admin/lib/adminUi";
import ProductFormModal from "./ProductForm/ProductFormModal";
import { stockStatus, type AdminProductRow } from "../lib/productSearch";

function Thumb({ product }: { product: AdminProductRow }) {
  return product.image?.src ? (
    <Image
      src={product.image.src}
      alt={product.name}
      width={40}
      height={50}
      className="h-12.5 w-10 shrink-0 object-cover"
    />
  ) : (
    <div className="h-12.5 w-10 shrink-0 bg-foreground/10" aria-hidden />
  );
}

function Price({ product }: { product: AdminProductRow }) {
  return product.discountedPrice ? (
    <span>
      {formatCurrency(product.discountedPrice)}{" "}
      <span className="text-foreground/50 line-through">
        {formatCurrency(product.price)}
      </span>
    </span>
  ) : (
    <span>{formatCurrency(product.price)}</span>
  );
}

function Tags({ tags }: { tags?: string[] | null }) {
  return (
    <>
      {tags?.map((tag) => (
        <span
          key={tag}
          className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs"
        >
          {tag}
        </span>
      ))}
    </>
  );
}

function RowActions({ productId }: { productId: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label="Product actions" className="cursor-pointer p-2 -m-2">
        <MoreHorizontal size={14} className="text-foreground/70" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <ProductFormModal.Open action="edit" productId={productId}>
            <DropdownMenuItem>Edit</DropdownMenuItem>
          </ProductFormModal.Open>
          <DropdownMenuItem>Publish</DropdownMenuItem>
          <DropdownMenuItem>Delete</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ProductTableRow({ product }: { product: AdminProductRow }) {
  const status = stockStatus(product.stock);
  return (
    <TableRow>
      <TableCell><Checkbox label="" /></TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Thumb product={product} />
          <div className="flex flex-col">
            <span className="font-semibold">{product.name}</span>
            <span className="text-foreground/60 text-[10px]">SKU: {product.sku}</span>
          </div>
        </div>
      </TableCell>
      <TableCell>{product.category}</TableCell>
      <TableCell><Price product={product} /></TableCell>
      <TableCell>{product.stock}</TableCell>
      <TableCell><div className="flex gap-1"><Tags tags={product.tags} /></div></TableCell>
      <TableCell><span className={badge(status.tone)}>{status.label}</span></TableCell>
      <TableCell><RowActions productId={product.id} /></TableCell>
    </TableRow>
  );
}

export function ProductMobileCard({ product }: { product: AdminProductRow }) {
  const status = stockStatus(product.stock);
  return (
    <li className="flex gap-3 rounded-md bg-white p-3">
      <Thumb product={product} />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{product.name}</p>
            <p className="truncate text-[10px] text-foreground/60">SKU: {product.sku}</p>
          </div>
          <RowActions productId={product.id} />
        </div>
        <p className="text-xs text-foreground/60">{product.category}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <Price product={product} />
          <span className={badge(status.tone)}>
            {status.label} • {product.stock}
          </span>
        </div>
        {!!product.tags?.length && (
          <div className="flex flex-wrap gap-1">
            <Tags tags={product.tags} />
          </div>
        )}
      </div>
    </li>
  );
}