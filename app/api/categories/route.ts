import type { NextRequest } from "next/server";
import { z } from "zod";

import { handleCategoryApiError } from "@/lib/api/category-error";
import { isAdminRequest, requireAdmin } from "@/lib/api/guards";
import { created, jsonError, ok } from "@/lib/api/response";
import { revalidateCategoryCaches } from "@/lib/cache/category-revalidation";
import { logAdminActivity } from "@/lib/services/admin-activity.service";
import {
  createCategory,
  listCategories,
  listCategoriesCached,
} from "@/lib/services/category.service";
import {
  categoryQuerySchema,
  createCategorySchema,
} from "@/lib/validations/category.validation";

export async function GET(request: NextRequest) {
  const parsed = categoryQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  if (!parsed.success) {
    return jsonError(400, "Invalid query parameters.", {
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    });
  }

  try {
    const isAdmin = await isAdminRequest();
    if (isAdmin) {
      // Admin reads deliberately bypass the public data cache.
      const { items, meta } = await listCategories(parsed.data);
      return ok(items, meta);
    }

    const query = { ...parsed.data, status: "ACTIVE" as const };
    const { items, meta } = await listCategoriesCached(query, {
      effectiveActiveOnly: true,
      activeProductsOnly: true,
    });
    return ok(items, meta);
  } catch (error) {
    return handleCategoryApiError("categories.GET", error);
  }
}

export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return jsonError(415, "Content-Type must be application/json.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Invalid JSON payload.");
  }

  const parsed = createCategorySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, "Please review the highlighted fields and try again.", {
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    });
  }

  try {
    const category = await createCategory(parsed.data);
    await logAdminActivity({
      kind: "category",
      action: "Category created",
      target: category.name,
      targetId: category.id,
      href: "/admin/categories",
      actor: guard.session.user,
    });
    revalidateCategoryCaches();
    return created(category);
  } catch (error) {
    return handleCategoryApiError("categories.POST", error);
  }
}
