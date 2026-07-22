import { describe, expect, it } from "vitest";

import { createProductSchema, updateProductSchema } from "./product.validation";

const baseProduct = {
  name: "Industrial Motor",
  buyingPrice: 100,
  salePrice: 150,
  categoryId: "category-1",
  variants: [{ stock: 1, isActive: true }],
};

describe("createProductSchema flexible variants", () => {
  it("accepts one optionless default variant", () => {
    expect(createProductSchema.safeParse(baseProduct).success).toBe(true);
  });

  it("rejects default variants when the product has multiple variants", () => {
    const parsed = createProductSchema.safeParse({
      ...baseProduct,
      variants: [
        { stock: 1, isActive: true },
        { attributes: { Voltage: "220V" }, stock: 1, isActive: true },
      ],
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects duplicate combinations after normalization", () => {
    const parsed = createProductSchema.safeParse({
      ...baseProduct,
      variants: [
        { attributes: { Voltage: "220V" }, stock: 1, isActive: true },
        { attributes: { voltage: " 220v " }, stock: 2, isActive: true },
      ],
    });
    expect(parsed.success).toBe(false);
  });

  it("accepts technical and classification fields", () => {
    const parsed = createProductSchema.safeParse({
      ...baseProduct,
      modelNumber: "MTR-220",
      series: "Pro",
      seoTitle: "Industrial Motor MTR-220",
      metaDescription: "A compact industrial motor for automation systems.",
      ogImage: "/images/mtr-220.webp",
      gtin: "0123456789012",
      itemCondition: "REFURBISHED",
      primaryImageAlt: "Industrial motor viewed from the front",
      brandId: "brand-1",
      manufacturerId: "manufacturer-1",
      specifications: { Power: "2 kW", ThreePhase: true },
      variants: [
        {
          name: "220 volt",
          modelNumber: "MTR-220-A",
          attributes: { Voltage: "220V" },
          stock: 3,
          isActive: true,
        },
      ],
    });
    expect(parsed.success).toBe(true);
    if (!parsed.success) throw parsed.error;
    expect(parsed.data).toMatchObject({
      gtin: "0123456789012",
      itemCondition: "REFURBISHED",
      primaryImageAlt: "Industrial motor viewed from the front",
    });
  });

  it("rejects unsupported item conditions", () => {
    expect(
      createProductSchema.safeParse({
        ...baseProduct,
        itemCondition: "OPEN_BOX",
      }).success,
    ).toBe(false);
  });
});

describe("updateProductSchema variant identity", () => {
  it("accepts canonical slug changes and rejects non-canonical slugs", () => {
    expect(
      updateProductSchema.parse({ slug: "industrial-motor-v2" }),
    ).toEqual({ slug: "industrial-motor-v2" });
    expect(
      updateProductSchema.safeParse({ slug: "Industrial Motor V2" }).success,
    ).toBe(false);
  });

  it("rejects a repeated existing variant id", () => {
    const parsed = updateProductSchema.safeParse({
      variants: [
        { id: "variant-1", size: "M", stock: 1 },
        { id: "variant-1", size: "L", stock: 2 },
      ],
    });

    expect(parsed.success).toBe(false);
  });
});
