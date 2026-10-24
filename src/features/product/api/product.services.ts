import { supabase } from "@/utils/supabase/client";
import { ProductFormValues } from "@/features/admin/products/schema/product.schema";
import { mapProductFormToDatabase } from "./product.mappers";

export async function getProducts() {
  const { data, error } = await supabase().from("Products").select("*");

  if (error) {
    throw new Error(error.message);
  }

  return { products: data ?? [], error: null };
}

export async function getProduct(id: string) {
  const { data, error } = await supabase()
    .from("Products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
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

export async function updateProduct(id: string, values: ProductFormValues) {
  const { data, error } = await supabase()
    .from("Products")
    .update(mapProductFormToDatabase(values))
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase().from("products").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}
