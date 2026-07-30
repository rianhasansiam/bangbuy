import type { NextRequest } from "next/server";
import { z } from "zod";

import { jsonError, ok } from "@/lib/api/response";
import { searchCatalog } from "@/lib/services/catalog-discovery.service";
import { catalogSearchQuerySchema } from "@/lib/validations/catalog-discovery.validation";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const parsed = catalogSearchQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  if (!parsed.success) {
    return jsonError(400, "Invalid search parameters.", {
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    });
  }

  try {
    return ok(await searchCatalog(parsed.data));
  } catch (error) {
    console.error("[catalog.search.GET] failed", error);
    return jsonError(500, "Failed to search the catalog.");
  }
}
