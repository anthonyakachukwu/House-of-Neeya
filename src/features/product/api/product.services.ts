import { supabase } from "@/utils/supabase/client";
// import { products } from "../data/products";
import { ProductDraft } from "@/features/admin/products/types/product.types";
import { ProductFormValues } from "@/features/admin/products/schema/product.schema";
import { mapProductFormToDatabase } from "./product.mappers";

// Table names are case-sensitive in Supabase: it is "Products", not "products".

export async function getProducts() {
  const { data, error } = await supabase().from("Products").select("*");

  if (error) {
    throw new Error(error.message);
  }

  return { products: data ?? [] };
}

export async function getProduct(id: string) {
  const { data, error } = await supabase()
    .from("Products")
    .select("*")
    .eq("id", id);

  if (error) {
    throw Error(error.message);
  }

  console.log(data);

  return data;
}

export async function createProduct(data: ProductFormValues) {
  const product = mapProductFormToDatabase(data);

  const { data: createdProduct, error } = await supabase()
    .from("Products")
    .insert(product)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return createdProduct;
}

export async function updateProduct(id: string, product: ProductDraft) {
  const { data, error } = await supabase()
    .from("Products")
    .update(product)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase().from("Products").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}
