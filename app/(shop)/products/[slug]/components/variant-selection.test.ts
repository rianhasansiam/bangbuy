import { describe, expect, it } from "vitest";

import { initialVariantSelectionId } from "./variant-selection";

describe("initialVariantSelectionId", () => {
  it("preselects the only active variant", () => {
    expect(
      initialVariantSelectionId([
        { id: "inactive", isActive: false },
        { id: "only-active", isActive: true },
      ]),
    ).toBe("only-active");
  });

  it("requires an explicit selection when multiple variants are active", () => {
    expect(
      initialVariantSelectionId([
        { id: "220v", isActive: true },
        { id: "240v", isActive: true },
      ]),
    ).toBeNull();
  });

  it("does not preselect an inactive or missing variant", () => {
    expect(initialVariantSelectionId([])).toBeNull();
    expect(
      initialVariantSelectionId([{ id: "inactive", isActive: false }]),
    ).toBeNull();
  });
});
