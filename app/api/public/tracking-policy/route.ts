import { NextResponse, type NextRequest } from "next/server";
import { getTrackingRuntimePolicy } from "@/lib/analytics/config";
import { readMarketingConsent, publicMarketingConsent } from "@/lib/analytics/consent-server";

export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  return NextResponse.json({ policy: getTrackingRuntimePolicy(), consent: publicMarketingConsent(await readMarketingConsent(request)) }, { headers: { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer", "Vary": "Cookie" } });
}
