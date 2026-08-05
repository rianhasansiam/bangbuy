import { readApiError } from "@/features/http/api-envelope";

export const TRANSACTION_STATUS_VALUES = [
  "PENDING",
  "SUCCESS",
  "FAILED",
  "CANCELLED",
  "REFUNDED",
  "EXPIRED",
] as const;

export type TransactionStatus = (typeof TRANSACTION_STATUS_VALUES)[number];

export const TRANSACTION_STATUS_META: Record<
  TransactionStatus,
  { label: string; pill: string }
> = {
  PENDING: {
    label: "Pending",
    pill: "bg-amber-100 text-amber-800 ring-amber-200",
  },
  SUCCESS: {
    label: "Successful",
    pill: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  },
  FAILED: {
    label: "Failed",
    pill: "bg-rose-100 text-rose-800 ring-rose-200",
  },
  CANCELLED: {
    label: "Cancelled",
    pill: "bg-gray-100 text-gray-700 ring-gray-200",
  },
  REFUNDED: {
    label: "Refunded",
    pill: "bg-violet-100 text-violet-800 ring-violet-200",
  },
  EXPIRED: {
    label: "Expired",
    pill: "bg-orange-100 text-orange-800 ring-orange-200",
  },
};

export type TransactionOrder = {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
};

export type CustomerTransaction = {
  id: string;
  provider: string;
  transactionId: string | null;
  bankTransactionId: string | null;
  cardType: string | null;
  amount: number;
  currency: string;
  status: TransactionStatus;
  paidAt: string | null;
  requiresReview: boolean;
  createdAt: string;
  updatedAt: string;
  order: TransactionOrder;
};

export type AdminTransaction = Omit<CustomerTransaction, "order"> & {
  riskLevel: number | null;
  reviewReason: string | null;
  reviewResolvedAt: string | null;
  reviewResolvedBy: string | null;
  reviewResolution: string | null;
  reviewResolutionReference: string | null;
  order: TransactionOrder & {
    customerName: string;
    customerEmail: string | null;
    customerPhone: string;
    user: {
      id: string;
      name: string | null;
      email: string | null;
    } | null;
  };
};

export type TransactionPageMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type CustomerTransactionQuery = {
  page?: number;
  pageSize?: number;
  status?: TransactionStatus;
  provider?: string;
};

export type AdminTransactionQuery = CustomerTransactionQuery & {
  search?: string;
  review?: "OPEN" | "RESOLVED";
};

type TransactionPage<T> = {
  items: T[];
  meta: TransactionPageMeta;
};

function transactionSearchParams(
  query: AdminTransactionQuery,
): URLSearchParams {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.pageSize) params.set("pageSize", String(query.pageSize));
  if (query.status) params.set("status", query.status);
  if (query.provider?.trim()) {
    params.set("provider", query.provider.trim().toUpperCase());
  }
  if (query.search?.trim()) params.set("search", query.search.trim());
  if (query.review) params.set("review", query.review);
  return params;
}

async function fetchTransactionPage<T>(
  pathname: string,
  query: AdminTransactionQuery,
  fallbackError: string,
): Promise<TransactionPage<T>> {
  const params = transactionSearchParams(query);
  const queryString = params.toString();
  const response = await fetch(
    `${pathname}${queryString ? `?${queryString}` : ""}`,
    { method: "GET", cache: "no-store" },
  );

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error(fallbackError);
  }

  const envelope = payload as {
    success?: boolean;
    data?: unknown;
    meta?: Partial<TransactionPageMeta>;
  };
  if (!response.ok || !envelope.success || !Array.isArray(envelope.data)) {
    throw new Error(readApiError(payload, fallbackError));
  }

  const items = envelope.data as T[];
  return {
    items,
    meta: {
      page: envelope.meta?.page ?? query.page ?? 1,
      pageSize: envelope.meta?.pageSize ?? query.pageSize ?? items.length,
      total: envelope.meta?.total ?? items.length,
      totalPages: envelope.meta?.totalPages ?? 1,
    },
  };
}

export function fetchMyTransactions(
  query: CustomerTransactionQuery = {},
): Promise<TransactionPage<CustomerTransaction>> {
  return fetchTransactionPage<CustomerTransaction>(
    "/api/transactions",
    query,
    "Failed to load your transaction history.",
  );
}

export function fetchAdminTransactions(
  query: AdminTransactionQuery = {},
): Promise<TransactionPage<AdminTransaction>> {
  return fetchTransactionPage<AdminTransaction>(
    "/api/admin/transactions",
    query,
    "Failed to load transaction history.",
  );
}

export function formatTransactionAmount(
  amount: number,
  currency: string,
): string {
  try {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: currency || "BDT",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency || "BDT"} ${amount.toLocaleString()}`;
  }
}

export function formatTransactionDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function paymentProviderLabel(provider: string): string {
  switch (provider.toUpperCase()) {
    case "SSLCOMMERZ":
      return "SSLCommerz";
    case "AIRWALLEX":
      return "Airwallex";
    case "CASH_ON_DELIVERY":
      return "Cash on delivery";
    case "ADMIN_ADVANCE":
      return "Admin advance";
    case "ONLINE":
      return "Online payment";
    case "PAYPAL":
      return "PayPal";
    default:
      return provider.replaceAll("_", " ");
  }
}
