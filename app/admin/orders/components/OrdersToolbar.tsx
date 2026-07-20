"use client";

import { PackagePlus, RotateCcw, Search } from "lucide-react";

import { LoadingSpinner } from "@/components/ui/loading";
import {
  ORDER_STATUS_VALUES,
  PAYMENT_STATUS_VALUES,
  type OrderStatus,
  type PaymentStatus,
} from "@/features/admin-orders/api";
import { ORDER_STATUS_META } from "@/lib/orders/status";

type StatusFilter = "ALL" | OrderStatus;
type PaymentFilter = "ALL" | PaymentStatus;

export default function OrdersToolbar({
  query,
  statusFilter,
  paymentFilter,
  visibleCount,
  totalCount,
  isLoading,
  onQueryChange,
  onStatusChange,
  onPaymentChange,
  onRefresh,
  onCreate,
}: {
  query: string;
  statusFilter: StatusFilter;
  paymentFilter: PaymentFilter;
  visibleCount: number;
  totalCount: number;
  isLoading: boolean;
  onQueryChange: (value: string) => void;
  onStatusChange: (value: StatusFilter) => void;
  onPaymentChange: (value: PaymentFilter) => void;
  onRefresh: () => void;
  onCreate: () => void;
}) {
  return (
    <div className="rounded-2xl border border-brand-border bg-brand-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative flex flex-1 items-center">
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-brand-text-muted" />
            <input
              type="text"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search by order #, customer, phone, email..."
              className="h-10 w-full rounded-xl border border-brand-border pl-9 pr-3 text-sm outline-none transition focus:border-brand-red"
            />
          </label>

          <select
            value={statusFilter}
            onChange={(event) => onStatusChange(event.target.value as StatusFilter)}
            className="h-10 rounded-xl border border-brand-border px-3 text-sm outline-none transition focus:border-brand-red"
          >
            <option value="ALL">All status</option>
            {ORDER_STATUS_VALUES.map((status) => (
              <option key={status} value={status}>
                {ORDER_STATUS_META[status].label}
              </option>
            ))}
          </select>

          <select
            value={paymentFilter}
            onChange={(event) => onPaymentChange(event.target.value as PaymentFilter)}
            className="h-10 rounded-xl border border-brand-border px-3 text-sm outline-none transition focus:border-brand-red"
          >
            <option value="ALL">All payments</option>
            {PAYMENT_STATUS_VALUES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            aria-busy={isLoading}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-brand-border px-3 text-sm font-semibold text-foreground transition hover:bg-brand-light-bg"
          >
            {isLoading ? (
              <LoadingSpinner decorative size="sm" />
            ) : (
              <RotateCcw className="h-4 w-4" />
            )}
            {isLoading ? "Refreshing..." : "Refresh"}
          </button>
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-red px-4 text-sm font-semibold text-brand-white transition hover:bg-brand-red-hover"
          >
            <PackagePlus className="h-4 w-4" />
            Place order
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <span>
          {visibleCount} / {totalCount} orders
        </span>
        {isLoading && (
          <span className="inline-flex items-center gap-1.5">
            <LoadingSpinner decorative size="xs" />
            Syncing orders...
          </span>
        )}
      </div>
    </div>
  );
}
