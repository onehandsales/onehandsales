import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useProductCategories, useProductStatuses } from "@/features/product/hooks/use-product-detail";
import { useUpdateProductMutation } from "@/features/product/hooks/use-product-mutations";
import type { ProductDetail } from "@/features/product/types/product";
import { getApiErrorMessage } from "@/lib/api-client";

const schema = z.object({
  productName: z.string().trim().min(1, "제품명을 입력해주세요."),
  productPrice: z
    .string()
    .trim()
    .refine(
      (v) => v.length === 0 || /^\d+$/.test(v),
      "단가는 0 이상의 정수로 입력해주세요."
    )
    .default("0"),
  productCategoryId: z.string().trim().min(1, "카테고리를 선택해주세요."),
  productStatusId: z.string().trim().min(1, "상태를 선택해주세요."),
});

type FormValues = z.infer<typeof schema>;

type ProductEditFormProps = {
  readonly product: ProductDetail;
  readonly onSaved: () => void;
};

export function ProductEditForm({ product, onSaved }: ProductEditFormProps) {
  const updateProductMutation = useUpdateProductMutation();
  const categoriesQuery = useProductCategories();
  const statusesQuery = useProductStatuses();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      productName: product.productName,
      productPrice: String(product.productPrice ?? 0),
      productCategoryId: product.productCategory.id,
      productStatusId: product.productStatus.id,
    },
  });

  useEffect(() => {
    reset({
      productName: product.productName,
      productPrice: String(product.productPrice ?? 0),
      productCategoryId: product.productCategory.id,
      productStatusId: product.productStatus.id,
    });
  }, [product, reset]);

  const onSubmit = handleSubmit(async (values) => {
    await updateProductMutation.mutateAsync({
      productId: product.id,
      productName: values.productName,
      productPrice: Number(values.productPrice || "0"),
      productCategoryId: values.productCategoryId,
      productStatusId: values.productStatusId,
    });

    onSaved();
  });

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="product-detail-name">
          제품명
        </label>
        <input
          aria-invalid={Boolean(errors.productName)}
          className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          id="product-detail-name"
          {...register("productName")}
        />
        {errors.productName ? (
          <p className="text-xs text-destructive">{errors.productName.message}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="product-detail-category">
            카테고리
          </label>
          <select
            aria-invalid={Boolean(errors.productCategoryId)}
            className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            id="product-detail-category"
            {...register("productCategoryId")}
          >
            <option value="">선택</option>
            {categoriesQuery.data?.items.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.categoryName}
              </option>
            ))}
          </select>
          {errors.productCategoryId ? (
            <p className="text-xs text-destructive">{errors.productCategoryId.message}</p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="product-detail-status">
            판매 상태
          </label>
          <select
            aria-invalid={Boolean(errors.productStatusId)}
            className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            id="product-detail-status"
            {...register("productStatusId")}
          >
            <option value="">선택</option>
            {statusesQuery.data?.items.map((st) => (
              <option key={st.id} value={st.id}>
                {st.statusName}
              </option>
            ))}
          </select>
          {errors.productStatusId ? (
            <p className="text-xs text-destructive">{errors.productStatusId.message}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="product-detail-price">
          단가 (원)
        </label>
        <input
          aria-invalid={Boolean(errors.productPrice)}
          className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          id="product-detail-price"
          inputMode="numeric"
          {...register("productPrice")}
        />
        {errors.productPrice ? (
          <p className="text-xs text-destructive">{errors.productPrice.message}</p>
        ) : null}
      </div>

      {updateProductMutation.error ? (
        <p className="rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive">
          {getApiErrorMessage(updateProductMutation.error)}
        </p>
      ) : null}

      <div className="flex justify-end">
        <button
          className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
          disabled={updateProductMutation.isPending}
          type="submit"
        >
          <Save className="h-4 w-4" />
          저장
        </button>
      </div>
    </form>
  );
}
