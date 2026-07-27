import { describe, expect, it } from "vitest";

import { buildFormFromProduct, parseProductsPayload } from "./api";

describe("admin product SEO form mapping", () => {
  it("round-trips catalog and search fields from the API into the edit form", () => {
    const [product] = parseProductsPayload({
      success: true,
      data: [
        {
          id: "product-1",
          productCode: "BB-000001",
          name: "Industrial Motor",
          slug: "industrial-motor",
          description: "High-efficiency motor",
          seoTitle: "Industrial Motor for Workshop Use",
          metaDescription: "A durable high-efficiency industrial motor.",
          ogImage: "https://example.com/motor-social.jpg",
          gtin: "0123456789012",
          itemCondition: "REFURBISHED",
          image: "https://example.com/motor.jpg",
          imageAlt: "Industrial motor viewed from the front",
          images: ["https://example.com/motor.jpg"],
          buyingPrice: 100,
          salePrice: 130,
          status: "ACTIVE",
          categoryId: "category-1",
          category: {
            id: "category-1",
            name: "Motors",
            slug: "motors",
            path: "motors",
            depth: 0,
          },
          variants: [],
        },
      ],
    });

    expect(product).toMatchObject({
      slug: "industrial-motor",
      seoTitle: "Industrial Motor for Workshop Use",
      metaDescription: "A durable high-efficiency industrial motor.",
      ogImage: "https://example.com/motor-social.jpg",
      gtin: "0123456789012",
      itemCondition: "REFURBISHED",
      primaryImageAlt: "Industrial motor viewed from the front",
    });
    expect(buildFormFromProduct(product)).toMatchObject({
      slug: "industrial-motor",
      seoTitle: "Industrial Motor for Workshop Use",
      metaDescription: "A durable high-efficiency industrial motor.",
      ogImage: "https://example.com/motor-social.jpg",
      gtin: "0123456789012",
      itemCondition: "REFURBISHED",
      primaryImageAlt: "Industrial motor viewed from the front",
    });
  });
});
