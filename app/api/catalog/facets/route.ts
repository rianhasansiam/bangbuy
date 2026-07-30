import { jsonError, ok } from "@/lib/api/response";
import { getPublicCatalogFacets } from "@/lib/services/public-catalog-cache.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return ok(await getPublicCatalogFacets());
  } catch (error) {
    console.error("[catalog.facets.GET] failed", error);
    return jsonError(500, "Failed to load catalog filters.");
  }
}
