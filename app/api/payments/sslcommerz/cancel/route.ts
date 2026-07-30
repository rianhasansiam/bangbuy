import { handleSslCommerzBrowserCallback } from "@/lib/payments";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return handleSslCommerzBrowserCallback(request, "cancelled");
}

export function POST(request: Request) {
  return handleSslCommerzBrowserCallback(request, "cancelled");
}
