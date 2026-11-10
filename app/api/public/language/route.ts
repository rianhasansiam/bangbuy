import type { NextRequest } from "next/server";
import { z } from "zod";
import { jsonError, ok } from "@/lib/api/response";
import { getPublishedLanguages } from "@/lib/i18n/server";
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, normalizeLocale } from "@/lib/i18n/registry";
import { resolveSurfaceRequestUrl } from "@/lib/security/surfaces";

/** Anonymous preference only. Never inspect session cookies or update a private profile. */
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const externalUrl = resolveSurfaceRequestUrl(request);
  if (!externalUrl || (origin && origin !== new URL(externalUrl).origin) || request.headers.get("sec-fetch-site") === "cross-site") return jsonError(403, "Cross-origin requests are not allowed.");
  if (!(request.headers.get("content-type") ?? "").includes("application/json")) return jsonError(415, "Content-Type must be application/json.");
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > 1024) return jsonError(413, "Language preference payload is too large.");
  let input: unknown;
  try { input = JSON.parse(raw); } catch { return jsonError(400, "Invalid JSON payload."); }
  const parsed = z.object({ locale: z.string().max(64) }).strict().safeParse(input);
  const locale = parsed.success ? normalizeLocale(parsed.data.locale) : null;
  if (!locale || !(await getPublishedLanguages()).some(language => language.code === locale)) return jsonError(400, "This language is not published.");
  const response = ok({ locale, profilePersisted: false });
  response.cookies.set(LOCALE_COOKIE, locale, { path: "/", maxAge: LOCALE_COOKIE_MAX_AGE, sameSite: "lax", httpOnly: true, secure: request.nextUrl.protocol === "https:" });
  return response;
}
