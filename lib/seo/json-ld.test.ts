import { describe, expect, it } from "vitest";

import { productJsonLd } from "./json-ld";

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
});
