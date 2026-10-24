import { FieldErrors, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from '@/components';
import { useProductFormToggle } from '../../provider/ProductFormToggleContext';
import { X } from 'lucide-react';
import ProductDetails from './ProductDetails';
import ProductPricing from './ProductPricing';
import ProductImage from './ProductImage';
import ProductVariants from './ProductVariants';
import ProductTags from './ProductTags';
import { ProductFormValues, productSchema } from "../../schema/product.schema";
import { PRODUCT_CATEGORIES, PRODUCT_TAGS } from "../../constants/product.constants";
import { createProduct, getProduct, updateProduct } from "@/features/product/api/product.services";
import { useEffect, useState } from "react";
import { mapProductFromDatabase } from "@/features/product/api/product.mappers";

const emptyValues: ProductFormValues = {
  name: "", slug: "", description: "", category: "Clothing", brand: "",
  price: 0, discountedPrice: undefined, stock: 0, sku: "",
  image: { id: "", src: "", alt: "" },
  variants: [], tags: [], isFeatured: false, isNewArrival: false,
};

const ProductForm = () => {
  const { action, productId, isOpen, CloseProductForm } = useProductFormToggle();
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: emptyValues,
  });

  const { reset } = form;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");

  const onInvalid = (errors: FieldErrors<ProductFormValues>) => {
    console.log("FORM ERRORS:", errors);
  };

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setIsSubmitting(true);
      if (action === "edit" && productId) {
        await updateProduct(productId, data);
      } else {
        await createProduct(data);
      }
      CloseProductForm();
    } catch (error) {
      console.error("Failed to save product:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    if (action === "add") {
      reset(emptyValues);
      return;
    }
    if (!productId) return;

    let cancelled = false;
    (async () => {
      try {
        const row = await getProduct(productId);
        if (cancelled) return;
        const p = mapProductFromDatabase(row);
        reset({
          name: p.name, slug: p.slug, description: p.description,
          category: p.category, brand: p.brand, price: p.price,
          discountedPrice: p.discountedPrice, stock: p.stock, sku: p.sku,
          image: p.image, variants: p.variants, tags: p.tags,
          isFeatured: p.isFeatured, isNewArrival: p.isNewArrival,
        });
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : "Failed to load product");
      }
    })();

    return () => { cancelled = true; };
  }, [action, productId, isOpen, reset]);

  return (
    <FormProvider {...form}>
      <div className="bg-background inset-0 overflow-y-auto">
        <form className="flex flex-col flex-5 gap-6 p-8" onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
          <h1 className="flex items-center justify-between text-4xl font-serif capitalize">
            {action} Product
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={CloseProductForm}
            ><X size={16} className="cursor-pointer" onClick={CloseProductForm} /></Button></h1>
          <ProductDetails categories={PRODUCT_CATEGORIES} />
          <ProductPricing />
          <ProductImage />
          <ProductVariants />
          <ProductTags tags={PRODUCT_TAGS} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" className="w-fit">Save as draft</Button>
            <Button type="submit" className="w-fit" disabled={isSubmitting}>
              {isSubmitting ? "Publishing..." : "Publish"}
            </Button>
          </div>
        </form>
      </div>
    </FormProvider>
  );
}

export default ProductForm