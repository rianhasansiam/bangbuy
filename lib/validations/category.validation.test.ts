import { describe, expect, it } from "vitest";

import {
  categoryQuerySchema,
  createCategorySchema,
  reorderCategoriesSchema,
  updateCategorySchema,
} from "@/lib/validations/category.validation";

describe("category validation", () => {
  it("accepts hierarchy inputs while keeping path and depth server-owned", () => {
    expect(
      createCategorySchema.parse({
        name: "Power Tools",
        parentId: "parent-id",
        position: 2,
      }),
    ).toMatchObject({
      name: "Power Tools",
      parentId: "parent-id",
      position: 2,
      status: "ACTIVE",
    });

    expect(
      createCategorySchema.safeParse({
        name: "Power Tools",
        path: "client/owned",
      }).success,
    ).toBe(false);
    expect(
      updateCategorySchema.safeParse({ depth: 8 }).success,
    ).toBe(false);
  });

  it("parses flat/tree reads and the canonical root parent filter", () => {
    expect(
      categoryQuerySchema.parse({
        view: "tree",
        parentId: "root",
        withCounts: "true",
      }),
    ).toMatchObject({
      view: "tree",
      parentId: null,
      withCounts: true,
    });
  });

  it("requires reorder payloads to contain unique IDs", () => {
    expect(
      reorderCategoriesSchema.safeParse({
        parentId: null,
        orderedIds: ["one", "one"],
      }).success,
    ).toBe(false);
    expect(
      reorderCategoriesSchema.safeParse({
        parentId: null,
        orderedIds: ["one", "two"],
      }).success,
    ).toBe(true);
  });
});
