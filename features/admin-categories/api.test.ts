import { describe, expect, it } from "vitest";

import { parseCategoriesPayload } from "@/features/admin-categories/api";

describe("parseCategoriesPayload", () => {
  it("preserves effective visibility separately from the category status", () => {
    const result = parseCategoriesPayload({
      success: true,
      data: [
        {
          id: "child",
          name: "Child",
          slug: "child",
          path: "parent/child",
          status: "ACTIVE",
          effectiveActive: false,
        },
      ],
    });

    expect(result.items[0]).toMatchObject({
      status: "ACTIVE",
      effectiveActive: false,
    });
  });

  it("falls back to the raw status for older API payloads", () => {
    const result = parseCategoriesPayload({
      success: true,
      data: [
        {
          id: "inactive",
          name: "Inactive",
          slug: "inactive",
          status: "INACTIVE",
        },
      ],
    });

    expect(result.items[0]?.effectiveActive).toBe(false);
  });
});
