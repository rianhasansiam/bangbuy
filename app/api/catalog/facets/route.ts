import { jsonError, ok } from "@/lib/api/response";
import { getCatalogFacets } from "@/lib/services/catalog-discovery.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return ok(await getCatalogFacets());
  } catch (error) {
    console.error("[catalog.facets.GET] failed", error);
    return jsonError(500, "Failed to load catalog filters.");
  }
}
