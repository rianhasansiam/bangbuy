import { describe, expect, it } from "vitest";

import { productGroupJsonLd, productJsonLd } from "./json-ld";

const BASE_PRODUCT = {
  name: "Industrial drill",
  description: "A real catalog product.",
  path: "/products/industrial-drill",
  price: 1250,
  inStock: true,
};

describe("productJsonLd", () => {
  it("includes a persisted review aggregate when one is provided", () => {
    expect(
      productJsonLd({
        ...BASE_PRODUCT,
        brand: "Acme",
        rating: { average: 4.25, count: 8 },
      }),
    ).toMatchObject({
      brand: { "@type": "Brand", name: "Acme" },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: 4.25,
        reviewCount: 8,
      },
    });
  });

  it("omits an empty or invalid review aggregate", () => {
    expect(
      productJsonLd({
        ...BASE_PRODUCT,
        rating: { average: 0, count: 0 },
      }),
    ).not.toHaveProperty("aggregateRating");
  });

  it("emits persisted product identifiers and manufacturer when provided", () => {
    expect(
      productJsonLd({
        ...BASE_PRODUCT,
        mpn: "DRILL-18V",
        gtin: "0123456789012",
        manufacturer: "Acme Manufacturing",
        itemCondition: "REFURBISHED",
      }),
    ).toMatchObject({
      mpn: "DRILL-18V",
      gtin: "0123456789012",
      manufacturer: {
        "@type": "Organization",
        name: "Acme Manufacturing",
      },
      offers: {
        itemCondition: "https://schema.org/RefurbishedCondition",
      },
    });
  });

  it("omits blank identifiers and manufacturer values", () => {
    const schema = productJsonLd({
      ...BASE_PRODUCT,
      mpn: "   ",
      gtin: "",
      manufacturer: "  ",
    });

    expect(schema).not.toHaveProperty("mpn");
    expect(schema).not.toHaveProperty("gtin");
    expect(schema).not.toHaveProperty("manufacturer");
  });

  it("converts admin-authored description markup to plain text", () => {
    expect(
      productJsonLd({
        ...BASE_PRODUCT,
        description: '<p>Safe <strong>description</strong></p><script>alert(1)</script>',
      }),
    ).toMatchObject({ description: "Safe description alert(1)" });
  });
});

describe("productGroupJsonLd", () => {
  it("describes genuine variants with their own stock and identifiers", () => {
    const schema = productGroupJsonLd({
      ...BASE_PRODUCT,
      productGroupId: "PRD-00001",
      variesBy: ["https://schema.org/color"],
      variants: [
        {
          name: "Industrial drill - Red",
          sku: "DRILL-RED",
          color: "Red",
          inStock: true,
        },
        {
          name: "Industrial drill - Blue",
          sku: "DRILL-BLUE",
          color: "Blue",
          inStock: false,
        },
      ],
    });

    expect(schema).toMatchObject({
      "@type": "ProductGroup",
      productGroupID: "PRD-00001",
      variesBy: ["https://schema.org/color"],
      hasVariant: [
        {
          "@type": "Product",
          sku: "DRILL-RED",
          offers: { availability: "https://schema.org/InStock" },
        },
        {
          "@type": "Product",
          sku: "DRILL-BLUE",
          offers: { availability: "https://schema.org/OutOfStock" },
        },
      ],
    });
  });
});
