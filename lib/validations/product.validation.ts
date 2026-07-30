import { z } from "zod";

import { deriveVariantKey } from "@/lib/catalog/variant-options";

/**
 * Zod schemas for the Product API.
 *
 * Kept separate from `app/api/products/*` so the same schemas can be
 * reused by server actions, admin forms, or future clients without
 * pulling in any HTTP code.
 *
 * The shapes mirror the Prisma `Product` model and its `ProductStatus`
 * enum — keep them aligned when the schema changes.
 *
 * Pricing now lives on the Product (`buyingPrice`/`salePrice`/
 * `discountPrice`) and each `ProductVariant` is a purchasable
 * size+color inventory row.
 */

const PRODUCT_STATUS = ["ACTIVE", "INACTIVE"] as const;
export const PRODUCT_CONDITION_VALUES = [
  "NEW",
  "REFURBISHED",
  "USED",
] as const;

const SORT_VALUES = [
  "latest",
  "price-low",
  "price-high",
  "rating",
  "popular",
] as const;
const HEX_COLOR_VALUE = /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

/** Common reusable fragments. */
const name = z
  .string()
  .trim()
  .min(2, "Product name is too short.")
  .max(150, "Product name is too long.");

const slug = z
  .string()
  .trim()
  .min(1, "Product slug is required.")
  .max(160, "Product slug is too long.")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Product slug must use lowercase letters, numbers, and single hyphens.",
  );

const description = z
  .string()
  .trim()
  .max(5000, "Description is too long.")
  .optional()
  .nullable();

/** Business purchase/source cost. Required, admin-only, never negative. */
const buyingPrice = z
  .number({ error: "Buying price must be a number." })
  .finite()
  .nonnegative("Buying price cannot be negative.");

/** Normal customer selling price. Required, never negative. */
const salePrice = z
  .number({ error: "Sale price must be a number." })
  .finite()
  .nonnegative("Sale price cannot be negative.");

/** Optional discounted selling price. Nullable, never negative. */
const discountPrice = z
  .number({ error: "Discount price must be a number." })
  .finite()
  .nonnegative("Discount price cannot be negative.")
  .optional()
  .nullable();

const stock = z
  .number({ error: "Stock must be a number." })
  .int("Stock must be a whole number.")
  .nonnegative("Stock cannot be negative.");

const variantColor = z
  .string()
  .trim()
  .min(1, "Color is required.")
  .max(40)
  .refine((value) => !value.startsWith("#") || HEX_COLOR_VALUE.test(value), {
    message: "Color hex code must be valid.",
  });

const image = z
  .string()
  .trim()
  .max(2048)
  .optional()
  .nullable();

const images = z.array(z.string().trim().max(2048)).max(20).optional();

const seoTitle = z
  .string()
  .trim()
  .max(70, "SEO title is too long.")
  .optional()
  .nullable();

const metaDescription = z
  .string()
  .trim()
  .max(320, "Meta description is too long.")
  .optional()
  .nullable();

const ogImage = z
  .string()
  .trim()
  .max(2048, "Open Graph image URL is too long.")
  .optional()
  .nullable();

const gtin = z
  .string()
  .trim()
  .max(32, "GTIN is too long.")
  .optional()
  .nullable();

const primaryImageAlt = z
  .string()
  .trim()
  .max(250, "Primary image alt text is too long.")
  .optional()
  .nullable();

const optionalText = (max: number) =>
  z.string().trim().min(1).max(max).optional().nullable();

const entityId = z.string().trim().min(1).optional().nullable();

const attributes = z
  .record(
    z.string().trim().min(1).max(80),
    z.string().trim().min(1).max(300),
  )
  .refine((value) => Object.keys(value).length <= 30, {
    message: "A variant can have at most 30 attributes.",
  })
  .optional()
  .nullable();

const specifications = z
  .record(
    z.string().trim().min(1).max(100),
    z.union([
      z.string().trim().min(1).max(1000),
      z.number().finite(),
      z.boolean(),
    ]),
  )
  .refine((value) => Object.keys(value).length <= 100, {
    message: "A product can have at most 100 specifications.",
  })
  .optional()
  .nullable();

/**
 * A single purchasable size+color variant row. Size and color are
 * required so each row maps to a concrete combination (e.g. "M / Red").
 * `sku` is optional but unique when provided (enforced by the DB + the
 * service). `id` is present only when editing an existing variant.
 */
const variantInput = z.object({
  id: z.string().trim().min(1).optional(),
  name: optionalText(120),
  size: optionalText(40),
  color: variantColor.optional().nullable(),
  modelNumber: optionalText(100),
  sku: z.string().trim().min(1).max(80).optional().nullable(),
  stock: stock.default(0),
  image: image,
  attributes,
  isActive: z.boolean().default(true),
});

export type ProductVariantInput = z.infer<typeof variantInput>;

/** Cross-field guards shared by create/update. */
function discountWithinSale(data: {
  salePrice?: number;
  discountPrice?: number | null;
}): boolean {
  if (data.discountPrice == null || data.salePrice == null) return true;
  return data.discountPrice <= data.salePrice;
}

/** No two variant rows may resolve to the same deterministic option key. */
function variantsHaveUniqueCombos(
  variants: ProductVariantInput[] | undefined,
): boolean {
  if (!variants || variants.length === 0) return true;
  const seen = new Set<string>();
  for (const v of variants) {
    const key = deriveVariantKey(v);
    if (seen.has(key)) return false;
    seen.add(key);
  }
  return true;
}

function defaultVariantIsUnambiguous(
  variants: ProductVariantInput[] | undefined,
): boolean {
  if (!variants || variants.length <= 1) return true;
  return variants.every((variant) => deriveVariantKey(variant) !== "default");
}

/** No two provided SKUs may collide (ignores blank/missing SKUs). */
function variantsHaveUniqueSkus(
  variants: ProductVariantInput[] | undefined,
): boolean {
  if (!variants || variants.length === 0) return true;
  const seen = new Set<string>();
  for (const v of variants) {
    const sku = v.sku?.trim();
    if (!sku) continue;
    const key = sku.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
  }
  return true;
}

/** Existing variant IDs form a set; repeating one would update it twice. */
function variantsHaveUniqueIds(
  variants: ProductVariantInput[] | undefined,
): boolean {
  if (!variants || variants.length === 0) return true;
  const ids = variants.flatMap((variant) => (variant.id ? [variant.id] : []));
  return new Set(ids).size === ids.length;
}

/** Body for `POST /api/products`. */
export const createProductSchema = z
  .object({
    name,
    description,
    seoTitle,
    metaDescription,
    ogImage,
    gtin,
    itemCondition: z.enum(PRODUCT_CONDITION_VALUES).default("NEW"),
    modelNumber: optionalText(100),
    series: optionalText(100),
    specifications,
    buyingPrice,
    salePrice,
    discountPrice,
    image,
    images,
    primaryImageAlt,
    status: z.enum(PRODUCT_STATUS).default("ACTIVE"),
    categoryId: z.string().trim().min(1, "Category is required."),
    brandId: entityId,
    manufacturerId: entityId,
    variants: z.array(variantInput).min(1, "Add at least one variant."),
  })
  .refine(discountWithinSale, {
    path: ["discountPrice"],
    message: "Discount price cannot exceed the sale price.",
  })
  .refine((data) => variantsHaveUniqueCombos(data.variants), {
    path: ["variants"],
    message: "Each option combination must be unique.",
  })
  .refine((data) => defaultVariantIsUnambiguous(data.variants), {
    path: ["variants"],
    message: "Only a product with one optionless variant may use the default option.",
  })
  .refine((data) => variantsHaveUniqueSkus(data.variants), {
    path: ["variants"],
    message: "Each SKU must be unique.",
  })
  .refine((data) => variantsHaveUniqueIds(data.variants), {
    path: ["variants"],
    message: "Each existing variant may only appear once.",
  });

/**
 * Body for `PATCH /api/products/[id]`.
 *
 * All fields optional. The cross-field discount check is re-applied
 * after merging with the existing product in the service/route. When
 * `variants` is provided it is treated as the full desired set (the
 * service reconciles create/update/delete).
 */
export const updateProductSchema = z
  .object({
    name: name.optional(),
    slug: slug.optional(),
    description,
    seoTitle,
    metaDescription,
    ogImage,
    gtin,
    itemCondition: z.enum(PRODUCT_CONDITION_VALUES).optional(),
    modelNumber: optionalText(100),
    series: optionalText(100),
    specifications,
    buyingPrice: buyingPrice.optional(),
    salePrice: salePrice.optional(),
    discountPrice,
    image,
    images,
    primaryImageAlt,
    status: z.enum(PRODUCT_STATUS).optional(),
    categoryId: z.string().trim().min(1).optional(),
    brandId: entityId,
    manufacturerId: entityId,
    variants: z.array(variantInput).min(1).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update.",
  })
  .refine((data) => variantsHaveUniqueCombos(data.variants), {
    path: ["variants"],
    message: "Each option combination must be unique.",
  })
  .refine((data) => defaultVariantIsUnambiguous(data.variants), {
    path: ["variants"],
    message: "Only a product with one optionless variant may use the default option.",
  })
  .refine((data) => variantsHaveUniqueSkus(data.variants), {
    path: ["variants"],
    message: "Each SKU must be unique.",
  })
  .refine((data) => variantsHaveUniqueIds(data.variants), {
    path: ["variants"],
    message: "Each existing variant may only appear once.",
  });

/**
 * Query string for `GET /api/products`.
 *
 * `z.coerce.*` because URLSearchParams values are always strings.
 * Defaults keep the route simple — callers only need to pass what
 * they want to override.
 */
export const productQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).max(10_000).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().min(1).max(150).optional(),
    categoryId: z.string().trim().min(1).optional(),
    categoryPath: z
      .string()
      .trim()
      .min(1)
      .max(1000)
      .refine(
        (value) => !value.startsWith("/") && !value.endsWith("/") && !value.includes("//"),
        "Category path must be canonical without leading or trailing slashes.",
      )
      .optional(),
    brandId: z.string().trim().min(1).optional(),
    brandSlug: z.string().trim().min(1).max(160).optional(),
    manufacturerId: z.string().trim().min(1).optional(),
    manufacturerSlug: z.string().trim().min(1).max(160).optional(),
    status: z.enum(PRODUCT_STATUS).optional(),
    stock: z.enum(["in-stock", "out-of-stock"]).optional(),
    minRating: z.coerce.number().min(0).max(5).optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
    sort: z.enum(SORT_VALUES).default("latest"),
  })
  .refine(
    (data) =>
      data.minPrice == null ||
      data.maxPrice == null ||
      data.minPrice <= data.maxPrice,
    {
      path: ["minPrice"],
      message: "minPrice cannot be greater than maxPrice.",
    },
  );

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
