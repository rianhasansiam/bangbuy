import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  unstableCache: vi.fn(),
  dependency: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ unstable_cache: mocks.unstableCache }));

import { dependOnCatalogTags } from "./catalog-dependency";

describe("catalog route dependencies", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.dependency.mockResolvedValue(true);
    mocks.unstableCache.mockReturnValue(mocks.dependency);
  });

  it("deduplicates tags and creates a persistent dependency marker", async () => {
    await dependOnCatalogTags(["product:2", " product:1 ", "product:2"]);

    expect(mocks.unstableCache).toHaveBeenCalledWith(
      expect.any(Function),
      ["catalog-dependency-v1", expect.stringMatching(/^[a-f0-9]{64}$/)],
      {
        revalidate: false,
        tags: ["product:1", "product:2"],
      },
    );
    expect(mocks.dependency).toHaveBeenCalledOnce();
  });

  it("does not create a cache entry for an empty tag set", async () => {
    await dependOnCatalogTags(["", "   "]);
    expect(mocks.unstableCache).not.toHaveBeenCalled();
  });
});
