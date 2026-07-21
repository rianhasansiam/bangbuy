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
  });
});

describe("updateProductSchema variant identity", () => {
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
