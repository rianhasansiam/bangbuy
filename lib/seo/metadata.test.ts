import { describe, expect, it } from "vitest";

import { clampDescription, noIndexMetadata } from "@/lib/seo/metadata";

describe("noIndexMetadata", () => {
  it("strips markup and control characters from admin-authored text", () => {
    expect(clampDescription("<b>Industrial</b>\u0000 motor controls")).toBe(
      "Industrial motor controls",
    );
  });

  it("removes inherited canonicals from private routes", () => {
    const metadata = noIndexMetadata("Private page");

    expect(metadata.alternates).toEqual({ canonical: null });
    expect(metadata.openGraph).toBeNull();
    expect(metadata.twitter).toBeNull();
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
