import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  transaction: vi.fn(),
  queryRaw: vi.fn(),
  categoryFindMany: vi.fn(),
  categoryFindUnique: vi.fn(),
  categoryFindFirst: vi.fn(),
  categoryCreate: vi.fn(),
  categoryUpdate: vi.fn(),
  categoryDelete: vi.fn(),
  productFindMany: vi.fn(),
  productCount: vi.fn(),
  productGroupBy: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({
  unstable_cache: <Arguments extends unknown[], Result>(
    operation: (...args: Arguments) => Result,
  ) => operation,
}));
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    $transaction: mocks.transaction,
    category: {
      findMany: mocks.categoryFindMany,
      findUnique: mocks.categoryFindUnique,
      findFirst: mocks.categoryFindFirst,
      create: mocks.categoryCreate,
      update: mocks.categoryUpdate,
      delete: mocks.categoryDelete,
    },
    product: {
      findMany: mocks.productFindMany,
      count: mocks.productCount,
      groupBy: mocks.productGroupBy,
    },
  },
}));

import {
  createCategory,
  deleteCategory,
  getActiveCategoryByPath,
  listCategories,
  reorderCategories,
  updateCategory,
} from "@/lib/services/category.service";
import {
  categoryQuerySchema,
  createCategorySchema,
} from "@/lib/validations/category.validation";

type CategoryStatus = "ACTIVE" | "INACTIVE";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  path: string;
  description: string | null;
  image: string | null;
  status: CategoryStatus;
  position: number;
  depth: number;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type CategoryWhere = {
  parentId?: string | null;
  id?: { not?: string; notIn?: string[] } | string;
  path?: { startsWith?: string; in?: string[] } | string;
  OR?: CategoryWhere[];
};

type CategoryReadArgs = {
  where?: CategoryWhere;
  select?: { _count?: unknown };
  orderBy?: unknown;
};

type CategoryWriteArgs = {
  where: { id: string };
  data: Partial<CategoryRow>;
};

const state = {
  records: [] as CategoryRow[],
  productsByCategory: new Map<string, number>(),
  nextId: 1,
};

function row(input: Partial<CategoryRow> & Pick<CategoryRow, "id" | "name" | "slug" | "path">): CategoryRow {
  const now = new Date(`2026-01-${String(state.nextId).padStart(2, "0")}T00:00:00.000Z`);
  return {
    description: null,
    image: null,
    status: "ACTIVE",
    position: 0,
    depth: 0,
    parentId: null,
    createdAt: now,
    updatedAt: now,
    ...input,
  };
}

function matchesWhere(record: CategoryRow, where: CategoryWhere = {}): boolean {
  if (where.OR && !where.OR.some((candidate) => matchesWhere(record, candidate))) {
    return false;
  }
  if (
    Object.prototype.hasOwnProperty.call(where, "parentId") &&
    record.parentId !== where.parentId
  ) {
    return false;
  }
  if (typeof where.id === "string" && record.id !== where.id) return false;
  if (where.id && typeof where.id === "object") {
    if (where.id.not && record.id === where.id.not) return false;
    if (where.id.notIn?.includes(record.id)) return false;
  }
  if (typeof where.path === "string" && record.path !== where.path) return false;
  if (where.path && typeof where.path === "object") {
    if (where.path.startsWith && !record.path.startsWith(where.path.startsWith)) {
      return false;
    }
    if (where.path.in && !where.path.in.includes(record.path)) return false;
  }
  return true;
}

function sortRows(records: CategoryRow[]): CategoryRow[] {
  return records.sort(
    (left, right) =>
      left.position - right.position ||
      left.createdAt.getTime() - right.createdAt.getTime() ||
      left.id.localeCompare(right.id),
  );
}

function childCount(id: string): number {
  return state.records.filter((record) => record.parentId === id).length;
}

function seed(...records: CategoryRow[]): void {
  state.records.push(...records);
}

beforeEach(() => {
  vi.clearAllMocks();
  state.records = [];
  state.productsByCategory = new Map();
  state.nextId = 1;

  mocks.queryRaw.mockResolvedValue([]);
  mocks.categoryFindMany.mockImplementation(async (args: CategoryReadArgs = {}) =>
    sortRows(state.records.filter((record) => matchesWhere(record, args.where))),
  );
  mocks.categoryFindUnique.mockImplementation(async (args: CategoryReadArgs & {
    where: { id?: string; path?: string };
  }) => {
    const found = state.records.find((record) =>
      args.where.id ? record.id === args.where.id : record.path === args.where.path,
    );
    if (!found) return null;
    return args.select?._count
      ? { ...found, _count: { children: childCount(found.id) } }
      : found;
  });
  mocks.categoryFindFirst.mockImplementation(async (args: CategoryReadArgs = {}) =>
    state.records.find((record) => matchesWhere(record, args.where)) ?? null,
  );
  mocks.categoryCreate.mockImplementation(async ({ data }: { data: Omit<CategoryRow, "id" | "createdAt" | "updatedAt"> }) => {
    const id = `category-${state.nextId++}`;
    const created = row({ id, ...data });
    state.records.push(created);
    return created;
  });
  mocks.categoryUpdate.mockImplementation(async ({ where, data }: CategoryWriteArgs) => {
    const index = state.records.findIndex((record) => record.id === where.id);
    if (index < 0) throw new Error(`Missing category ${where.id}`);
    state.records[index] = {
      ...state.records[index],
      ...data,
      updatedAt: new Date("2026-02-01T00:00:00.000Z"),
    };
    return state.records[index];
  });
  mocks.categoryDelete.mockImplementation(async ({ where }: { where: { id: string } }) => {
    const index = state.records.findIndex((record) => record.id === where.id);
    if (index < 0) throw new Error(`Missing category ${where.id}`);
    return state.records.splice(index, 1)[0];
  });
  mocks.productCount.mockImplementation(async ({ where }: {
    where: { categoryId: string | { in: string[] } };
  }) => {
    const ids = typeof where.categoryId === "string"
      ? [where.categoryId]
      : where.categoryId.in;
    return ids.reduce(
      (total, id) => total + (state.productsByCategory.get(id) ?? 0),
      0,
    );
  });
  mocks.productFindMany.mockResolvedValue([]);
  mocks.productGroupBy.mockImplementation(async () =>
    [...state.productsByCategory].map(([categoryId, count]) => ({
      categoryId,
      _count: { _all: count },
    })),
  );

  const transactionClient = {
    $queryRaw: mocks.queryRaw,
    category: {
      findMany: mocks.categoryFindMany,
      findUnique: mocks.categoryFindUnique,
      findFirst: mocks.categoryFindFirst,
      create: mocks.categoryCreate,
      update: mocks.categoryUpdate,
      delete: mocks.categoryDelete,
    },
    product: { count: mocks.productCount },
  };
  mocks.transaction.mockImplementation(async (operation: unknown) => {
    if (typeof operation !== "function") throw new Error("Expected a transaction callback.");
    return (operation as (client: typeof transactionClient) => Promise<unknown>)(
      transactionClient,
    );
  });
});

describe("category hierarchy mutations", () => {
  it("derives a stable slug/path and keeps them when the display name changes", async () => {
    const created = await createCategory(
      createCategorySchema.parse({ name: "Power Tools" }),
    );

    expect(created).toMatchObject({
      slug: "power-tools",
      path: "power-tools",
      depth: 0,
      position: 0,
    });

    const renamed = await updateCategory(created.id, { name: "Workshop Tools" });
    expect(renamed).toMatchObject({
      name: "Workshop Tools",
      slug: "power-tools",
      path: "power-tools",
    });
  });

  it("allows the same slug in separate branches but rejects a move path collision", async () => {
    const tools = await createCategory(createCategorySchema.parse({ name: "Tools" }));
    const home = await createCategory(createCategorySchema.parse({ name: "Home" }));
    const toolDrills = await createCategory(
      createCategorySchema.parse({ name: "Drills", parentId: tools.id }),
    );
    const homeDrills = await createCategory(
      createCategorySchema.parse({ name: "Drills", parentId: home.id }),
    );

    expect(toolDrills.slug).toBe("drills");
    expect(homeDrills.slug).toBe("drills");
    expect(toolDrills.path).toBe("tools/drills");
    expect(homeDrills.path).toBe("home/drills");

    await expect(
      updateCategory(homeDrills.id, { parentId: tools.id }),
    ).rejects.toMatchObject({ code: "PATH_CONFLICT", status: 409 });
  });

  it("moves a complete subtree, preserves slugs, and applies explicit sibling order", async () => {
    const tools = await createCategory(createCategorySchema.parse({ name: "Tools" }));
    const home = await createCategory(createCategorySchema.parse({ name: "Home" }));
    const power = await createCategory(
      createCategorySchema.parse({ name: "Power Tools", parentId: tools.id }),
    );
    const saws = await createCategory(
      createCategorySchema.parse({ name: "Saws", parentId: power.id }),
    );
    const lighting = await createCategory(
      createCategorySchema.parse({ name: "Lighting", parentId: home.id }),
    );

    const moved = await updateCategory(power.id, { parentId: home.id, position: 0 });
    const movedSaws = state.records.find((record) => record.id === saws.id);
    expect(moved).toMatchObject({
      slug: "power-tools",
      path: "home/power-tools",
      depth: 1,
      position: 0,
    });
    expect(movedSaws).toMatchObject({
      slug: "saws",
      path: "home/power-tools/saws",
      depth: 2,
    });

    const reordered = await reorderCategories({
      parentId: home.id,
      orderedIds: [lighting.id, power.id],
    });
    expect(reordered.map((category) => [category.id, category.position])).toEqual([
      [lighting.id, 0],
      [power.id, 1],
    ]);
  });

  it("prevents moving a category below its descendant", async () => {
    const tools = await createCategory(createCategorySchema.parse({ name: "Tools" }));
    const power = await createCategory(
      createCategorySchema.parse({ name: "Power", parentId: tools.id }),
    );
    const saws = await createCategory(
      createCategorySchema.parse({ name: "Saws", parentId: power.id }),
    );

    await expect(
      updateCategory(tools.id, { parentId: saws.id }),
    ).rejects.toMatchObject({ code: "CATEGORY_CYCLE", status: 400 });
  });
});

describe("category visibility, counts, and deletion", () => {
  it("uses active variants and real reviews for category landing product metrics", async () => {
    seed(row({ id: "tools", name: "Tools", slug: "tools", path: "tools" }));
    mocks.productFindMany.mockResolvedValue([
      {
        id: "product-1",
        slug: "cordless-drill",
        name: "Cordless drill",
        description: null,
        salePrice: { toNumber: () => 500 },
        discountPrice: { toNumber: () => 450 },
        images: [{ url: "/drill.webp" }],
        variants: [{ stock: 3 }, { stock: 2 }],
        reviews: [{ rating: 5 }, { rating: 4 }, { rating: 3 }],
      },
    ]);

    const category = await getActiveCategoryByPath("tools");

    expect(mocks.productFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { categoryId: { in: ["tools"] }, status: "ACTIVE" },
        select: expect.objectContaining({
          variants: expect.objectContaining({ where: { isActive: true } }),
          reviews: { select: { rating: true } },
        }),
      }),
    );
    expect(category?.products[0]).toMatchObject({
      id: "product-1",
      price: 500,
      discountPrice: 450,
      inStock: true,
      variantCount: 2,
      rating: 4,
      reviewCount: 3,
    });
  });

  it("inherits visibility from every ancestor and aggregates descendant products once", async () => {
    seed(
      row({ id: "hidden", name: "Hidden", slug: "hidden", path: "hidden", status: "INACTIVE" }),
      row({
        id: "hidden-child",
        name: "Hidden child",
        slug: "child",
        path: "hidden/child",
        parentId: "hidden",
        depth: 1,
      }),
      row({ id: "tools", name: "Tools", slug: "tools", path: "tools", position: 1 }),
      row({
        id: "power",
        name: "Power",
        slug: "power",
        path: "tools/power",
        parentId: "tools",
        depth: 1,
      }),
    );
    state.productsByCategory.set("hidden-child", 7);
    state.productsByCategory.set("tools", 2);
    state.productsByCategory.set("power", 3);

    const query = categoryQuerySchema.parse({ pageSize: 100 });
    const admin = await listCategories(query, { effectiveActiveOnly: false });
    const hiddenChild = admin.items.find((category) => category.id === "hidden-child");
    const tools = admin.items.find((category) => category.id === "tools");
    expect(hiddenChild).toMatchObject({ status: "ACTIVE", effectiveActive: false });
    expect(tools).toMatchObject({
      directProductCount: 2,
      totalProductCount: 5,
      childCount: 1,
    });

    const publicResult = await listCategories(query, {
      effectiveActiveOnly: true,
      activeProductsOnly: true,
    });
    expect(publicResult.items.map((category) => category.id).sort()).toEqual([
      "power",
      "tools",
    ]);
  });

  it("blocks deleting a category with children and reports dependency counts", async () => {
    seed(
      row({ id: "tools", name: "Tools", slug: "tools", path: "tools" }),
      row({
        id: "power",
        name: "Power",
        slug: "power",
        path: "tools/power",
        parentId: "tools",
        depth: 1,
      }),
    );
    state.productsByCategory.set("power", 4);

    await expect(deleteCategory("tools")).rejects.toMatchObject({
      code: "DELETE_CONFLICT",
      status: 409,
      details: {
        childCount: 1,
        directProductCount: 0,
        totalProductCount: 4,
      },
    });
    expect(mocks.categoryDelete).not.toHaveBeenCalled();
  });

  it("blocks deleting a leaf with direct products", async () => {
    seed(row({ id: "tools", name: "Tools", slug: "tools", path: "tools" }));
    state.productsByCategory.set("tools", 2);

    await expect(deleteCategory("tools")).rejects.toMatchObject({
      code: "DELETE_CONFLICT",
      status: 409,
      details: {
        childCount: 0,
        directProductCount: 2,
        totalProductCount: 2,
      },
    });
  });
});
