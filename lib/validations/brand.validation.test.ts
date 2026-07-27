import { describe, expect, it } from "vitest";

import { updateBrandSchema } from "@/lib/validations/brand.validation";

describe("brand validation", () => {
  it("accepts canonical slug changes and rejects non-canonical slugs", () => {
    expect(updateBrandSchema.parse({ slug: "acme-industrial" })).toEqual({
      slug: "acme-industrial",
    });
    expect(
      updateBrandSchema.safeParse({ slug: "Acme Industrial" }).success,
    ).toBe(false);
  });
});
