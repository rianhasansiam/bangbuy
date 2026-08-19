import { jsonError, ok } from "@/lib/api/response";
import { isExchangeRateRefreshAuthorized } from "@/lib/currency/exchange-rate-refresh-auth";
import { refreshExchangeRates } from "@/lib/currency/exchange-rate.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function handleRefresh(request: Request) {
  const secret = process.env.CRON_SECRET?.trim() ?? "";
  if (!isExchangeRateRefreshAuthorized(request, secret)) {
    return jsonError(401, "Unauthorized.");
  }

  try {
    return ok(await refreshExchangeRates());
  } catch {
    // The service logs a credential-free reason and retains the previous
    // snapshot. Never serialize provider responses, keys, or database errors.
    return jsonError(
      503,
      "Exchange-rate refresh failed; stale rates were retained.",
    );
  }
}

/** Linux cron's documented curl command uses GET. */
export const GET = handleRefresh;

/** POST is also available for schedulers that avoid side effects over GET. */
export const POST = handleRefresh;
