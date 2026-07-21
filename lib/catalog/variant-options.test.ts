import { describe, expect, it } from "vitest";

import {
  cleanVariantAttributes,
  deriveVariantKey,
  formatVariantAttributes,
} from "./variant-options";

describe("deriveVariantKey", () => {
  it("sorts and normalizes arbitrary option attributes", () => {
    expect(
      deriveVariantKey({
        attributes: { Voltage: " 220V ", Phase: "Single" },
      }),
    ).toBe("phase=single|voltage=220v");
  });

  it("includes optional size and color shortcuts", () => {
    expect(
      deriveVariantKey({
        color: "Black",
        size: " XL ",
        attributes: { Material: "Steel" },
      }),
    ).toBe("color=black|material=steel|size=xl");
  });

  it("uses default only when there are no option values", () => {
    expect(deriveVariantKey({ attributes: {} })).toBe("default");
  });
});

describe("variant attribute presentation", () => {
  it("drops invalid values and formats stable summaries", () => {
    const attributes = cleanVariantAttributes({
      Voltage: "220 V",
      ignored: 123,
      blank: " ",
      Phase: "Single",
    });
    expect(attributes).toEqual({ Phase: "Single", Voltage: "220 V" });
    expect(formatVariantAttributes(attributes)).toBe(
      "Phase: Single · Voltage: 220 V",
    );
  });
});
