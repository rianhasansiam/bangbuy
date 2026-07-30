import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getCatalogRedirectByPath } from "@/lib/services/catalog-redirect.service";

const MAX_CATALOG_PATH_LENGTH = 8_192;
const CATALOG_PATH_PATTERN =
  /^\/(?:products\/[a-z0-9]+(?:-[a-z0-9]+)*|brands\/[a-z0-9]+(?:-[a-z0-9]+)*|categories\/[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*)$/;

function isCatalogPath(pathname: string): boolean {
  return (
    pathname.length <= MAX_CATALOG_PATH_LENGTH &&
    CATALOG_PATH_PATTERN.test(pathname)
  );
}

/**
 * Normalize catalog URLs and resolve persisted slug history before React can
 * start streaming. This guarantees a real permanent HTTP redirect rather
 * than a 200 response containing a client-side meta refresh.
 */
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const normalizedPathname = pathname.toLowerCase();

  // Slugs written by catalog mutations are lowercase ASCII with single
  // hyphens. Skip malformed paths before consulting the shared redirect map.
  if (!isCatalogPath(normalizedPathname)) return NextResponse.next();

  const entityType = normalizedPathname.startsWith("/products/")
    ? "PRODUCT"
    : normalizedPathname.startsWith("/brands/")
      ? "BRAND"
      : "CATEGORY";

  try {
    const redirect = await getCatalogRedirectByPath(
      normalizedPathname,
      entityType,
    );
    if (redirect) {
      const destination = request.nextUrl.clone();
      destination.pathname = redirect.destinationPath;
      return NextResponse.redirect(destination, 308);
    }
  } catch (error) {
    // Redirect history is an enhancement around otherwise functional pages.
    // Fail open so cached canonical catalog pages remain available during a
    // transient database or cache failure.
    console.error("Catalog redirect lookup failed.", error);
  }

  if (pathname === normalizedPathname) return NextResponse.next();

  const destination = request.nextUrl.clone();
  destination.pathname = normalizedPathname;
  return NextResponse.redirect(destination, 308);
}

export const config = {
  matcher: [
    "/([pP][rR][oO][dD][uU][cC][tT][sS]|[bB][rR][aA][nN][dD][sS])/:slug",
    "/([cC][aA][tT][eE][gG][oO][rR][iI][eE][sS])/:path+",
  ],
};
