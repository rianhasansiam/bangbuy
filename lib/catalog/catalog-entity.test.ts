import { describe, expect, it } from "vitest";

import {
  cleanOptionalText,
  slugifyCatalogName,
} from "@/lib/catalog/catalog-entity";
import {
  createBrandSchema,
  updateBrandSchema,
} from "@/lib/validations/brand.validation";
import {
  createManufacturerSchema,
  updateManufacturerSchema,
} from "@/lib/validations/manufacturer.validation";

describe("catalog entity helpers", () => {
  it("creates normalized URL-safe slugs", () => {
    expect(slugifyCatalogName("  Bosch® Professional  ", "brand")).toBe(
      "bosch-professional",
    );
    expect(slugifyCatalogName("électricité", "brand")).toBe("electricite");
    expect(slugifyCatalogName("---", "manufacturer")).toBe("manufacturer");
  });

  it("normalizes optional text without changing omitted fields", () => {
    expect(cleanOptionalText(undefined)).toBeUndefined();
    expect(cleanOptionalText("   ")).toBeNull();
    expect(cleanOptionalText("  Dhaka  ")).toBe("Dhaka");
  });
});

describe("brand validation", () => {
  it("applies ACTIVE by default and accepts valid optional fields", () => {
    const result = createBrandSchema.parse({
      name: "Bosch",
      website: "https://www.bosch.com",
    });
    expect(result.status).toBe("ACTIVE");
  });

  it("rejects invalid websites and empty updates", () => {
    expect(
      createBrandSchema.safeParse({ name: "Bosch", website: "bosch" }).success,
    ).toBe(false);
    expect(updateBrandSchema.safeParse({}).success).toBe(false);
  });
});

describe("manufacturer validation", () => {
  it("supports country and rejects empty updates", () => {
    const result = createManufacturerSchema.parse({
      name: "Robert Bosch GmbH",
      country: "Germany",
    });
    expect(result.country).toBe("Germany");
    expect(result.status).toBe("ACTIVE");
    expect(updateManufacturerSchema.safeParse({}).success).toBe(false);
  });
});

