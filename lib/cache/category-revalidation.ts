import "server-only";

import { revalidateTag } from "next/cache";

export const CATEGORY_WRITE_CACHE_TAGS = [
  "categories",
  "home-categories",
  "products",
  "catalog-facets",
  "catalog-search",
] as const;

/** Route handlers need blocking expiry to guarantee read-after-write. */
export function revalidateCategoryCaches(): void {
  for (const tag of CATEGORY_WRITE_CACHE_TAGS) {
    revalidateTag(tag, { expire: 0 });
  }
}
