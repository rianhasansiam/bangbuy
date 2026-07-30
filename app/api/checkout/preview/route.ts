import type { Session } from "next-auth";
import type { NextRequest } from "next/server";
import { z } from "zod";

import { jsonError, ok } from "@/lib/api/response";
import { auth } from "@/lib/auth/auth";
import { toAppSession } from "@/lib/auth/session";
import { previewCheckout } from "@/lib/services/checkout.service";
import { handleServiceError } from "@/lib/services/service-error";
import { checkoutPreviewSchema } from "@/lib/validations/checkout.validation";

/**
 * POST /api/checkout/preview
 *
 * Read-only for guests and authenticated customers. Guests provide
 * explicit items; authenticated customers may omit them to use their
 * persisted cart. Nothing in the DB is mutated. All money math (tax,
 * shipping, free-shipping threshold, and promos) happens server-side.
 */
export async function POST(request: NextRequest) {
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

  const parsed = checkoutPreviewSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, "Please review the highlighted fields and try again.", {
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    });
  }

  try {
    const session = toAppSession((await auth()) as Session | null);
    const preview = await previewCheckout(session?.user.id ?? null, parsed.data);
    return ok(preview);
  } catch (error) {
    return handleServiceError("checkout.preview.POST", error);
  }
}
