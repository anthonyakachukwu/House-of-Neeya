import { useFormContext } from "react-hook-form";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/SelectInput";

import {
  ProductCategory,
} from "@/features/product/types/product.types";

import { ProductFormValues } from "../../schema/product.schema";
import { useProductFormToggle } from "../../provider/ProductFormToggleContext";

interface ProductDetailsProps {
  categories: ProductCategory[];
}

const ProductDetails = ({ categories }: ProductDetailsProps) => {
  const { register, setValue, formState: { errors } } = useFormContext<ProductFormValues>();
  const { action } = useProductFormToggle();
  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  return (
    <>
      <h2 className="uppercase text-[11px] text-primary pb-2 tracking-[0.22em] border-b border-b-foreground/20">
        Product Details
      </h2>

      <Input
        type="text"
        label="Product Name *"
        placeholder="Luxury Tote Bag"
        className="min-w-70"
        error={errors.name?.message}
        {...register("name", {
          onChange: (e) => {
            if (action === "add") setValue("slug", slugify(e.target.value), { shouldValidate: true });
          },
        })}
      />

      <div className="flex flex-col md:flex-row justify-between gap-4">
        <Input
          type="text"
          label="Slug *"
          placeholder="luxury-tote-bag"
          className="min-w-70"
          error={errors.slug?.message}
          {...register("slug")}
        />

        <Input
          type="text"
          label="Brand *"
          placeholder="House of Neeya"
          className="min-w-70"
          error={errors.brand?.message}
          {...register("brand")}
        />
      </div>

      <Input
        type="text"
        label="Description *"
        placeholder="A brief description of the piece"
        className="min-w-70"
        error={errors.description?.message}
        {...register("description")}
      />

      <div className="flex flex-col md:flex-row justify-between gap-4">
        <Select {...register("category")} label="Category">
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>

        <Input
          type="text"
          label="SKU *"
          placeholder="HON-DOL-001"
          className="min-w-70"
          error={errors.sku?.message}
          {...register("sku")}
        />
      </div>
    </>
  );
};

export default ProductDetails;