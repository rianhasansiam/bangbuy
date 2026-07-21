import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ revalidateTag: vi.fn() }));

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidateTag: mocks.revalidateTag }));

import { revalidateCacheTagsImmediately } from "@/lib/cache/revalidation";

describe("immediate cache revalidation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("expires every catalog tag without a stale-while-revalidate window", () => {
    revalidateCacheTagsImmediately(["products", "catalog-facets"]);

    expect(mocks.revalidateTag.mock.calls).toEqual([
      ["products", { expire: 0 }],
      ["catalog-facets", { expire: 0 }],
    ]);
  });
});
