"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";

import { TableSkeleton } from "@/components/ui/loading";
import {
  fetchMyTransactions,
  formatTransactionAmount,
  formatTransactionDate,
  paymentProviderLabel,
  TRANSACTION_STATUS_META,
  TRANSACTION_STATUS_VALUES,
  type CustomerTransaction,
  type TransactionPageMeta,
  type TransactionStatus,
} from "@/features/transactions/api";

const PAGE_SIZE = 8;

type LoadState =
  | { status: "loading" }
  | {
      status: "ready";
      items: CustomerTransaction[];
      meta: TransactionPageMeta;
    }
  | { status: "error"; message: string };

const STATUS_FILTERS: ReadonlyArray<{
  id: TransactionStatus | "ALL";
  label: string;
}> = [
  { id: "ALL", label: "All" },
  ...TRANSACTION_STATUS_VALUES.map((status) => ({
    id: status,
    label: TRANSACTION_STATUS_META[status].label,
  })),
];

export default function TransactionsTab() {
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | "ALL">(
    "ALL",
  );
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let ignore = false;

    void (async () => {
      await Promise.resolve();
      if (ignore) return;
      setState({ status: "loading" });

      try {
        const result = await fetchMyTransactions({
          page,
          pageSize: PAGE_SIZE,
          status: statusFilter === "ALL" ? undefined : statusFilter,
        });
        if (!ignore) {
          setState({
            status: "ready",
            items: result.items,
            meta: result.meta,
          });
          if (result.meta.page !== page) setPage(result.meta.page);
        }
      } catch (error) {
        if (!ignore) {
          setState({
            status: "error",
            message:
              error instanceof Error
                ? error.message
                : "Failed to load your transaction history.",
          });
        }
      }
    })();

    return () => {
      ignore = true;
    };
  }, [page, refreshKey, statusFilter]);

  const changeStatus = (status: TransactionStatus | "ALL") => {
    setStatusFilter(status);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      <header className="rounded-2xl border border-brand-border bg-brand-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-light-bg text-brand-black">
              <ReceiptText className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-gray-900 sm:text-lg">
                Payment transactions
              </h2>
              <p className="text-xs text-gray-500">
                Payment attempts recorded for orders on this account.
              </p>
            </div>
          </div>
          {state.status === "ready" && (
            <p className="text-xs font-medium text-gray-500">
              {state.meta.total}{" "}
              {state.meta.total === 1 ? "transaction" : "transactions"} total
            </p>
          )}
        </div>

        <div className="-mx-1 mt-4 flex snap-x gap-2 overflow-x-auto px-1 pb-1 scrollbar-none [&::-webkit-scrollbar]:hidden">
          {STATUS_FILTERS.map((filter) => {
            const active = filter.id === statusFilter;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => changeStatus(filter.id)}
                aria-pressed={active}
                className={
                  active
                    ? "inline-flex shrink-0 snap-start rounded-xl bg-brand-red px-3 py-1.5 text-xs font-bold text-brand-white shadow-sm"
                    : "inline-flex shrink-0 snap-start rounded-xl border border-brand-border bg-brand-white px-3 py-1.5 text-xs font-bold text-foreground transition hover:border-brand-red hover:text-brand-red"
                }
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </header>

      {state.status === "loading" && (
        <TableSkeleton
          rows={5}
          columns={4}
          ariaLabel="Loading payment transactions"
        />
      )}

      {state.status === "error" && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 shadow-sm"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="flex-1">
            <p>{state.message}</p>
            <button
              type="button"
              onClick={() => setRefreshKey((value) => value + 1)}
              className="mt-2 rounded-lg border border-rose-200 bg-white px-2.5 py-1 text-xs font-bold text-rose-700 transition hover:bg-rose-100"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {state.status === "ready" && state.items.length === 0 && (
        <div className="rounded-2xl border border-brand-border bg-brand-white p-6 text-center shadow-sm sm:rounded-3xl sm:p-10">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-light-bg text-brand-black">
            <ReceiptText className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-lg font-extrabold text-gray-900">
            No transactions found
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            {statusFilter === "ALL"
              ? "Your recorded payment attempts will appear here."
              : `There are no ${TRANSACTION_STATUS_META[statusFilter].label.toLowerCase()} transactions.`}
          </p>
        </div>
      )}

      {state.status === "ready" && state.items.length > 0 && (
        <ul className="space-y-3">
          {state.items.map((transaction) => (
            <TransactionCard key={transaction.id} transaction={transaction} />
          ))}
        </ul>
      )}

      {state.status === "ready" && state.meta.totalPages > 1 && (
        <TransactionPagination
          page={state.meta.page}
          totalPages={state.meta.totalPages}
          onChange={setPage}
        />
      )}
    </div>
  );
}

function TransactionCard({
  transaction,
}: {
  transaction: CustomerTransaction;
}) {
  const status = TRANSACTION_STATUS_META[transaction.status];
  const reference = transaction.transactionId ?? transaction.id;
  const completion = transaction.paidAt
    ? { label: "Paid", value: transaction.paidAt }
    : transaction.status === "SUCCESS"
      ? { label: "Recorded", value: transaction.createdAt }
      : null;

  return (
    <li className="overflow-hidden rounded-2xl border border-brand-border bg-brand-white shadow-sm sm:rounded-3xl">
      <div className="flex flex-col gap-4 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-light-bg text-brand-red">
              <CreditCard className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset ${status.pill}`}
                >
                  {status.label}
                </span>
                {transaction.requiresReview && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-800 ring-1 ring-inset ring-amber-200">
                    <ShieldCheck className="h-3 w-3" />
                    Verification pending
                  </span>
                )}
              </div>
              <p
                className="mt-2 break-all font-mono text-xs font-semibold text-gray-700"
                title={reference}
              >
                {reference}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {paymentProviderLabel(transaction.provider)}
                {transaction.cardType ? ` · ${transaction.cardType}` : ""}
              </p>
            </div>
          </div>

          <p className="text-left text-lg font-extrabold text-brand-red sm:text-right">
            {formatTransactionAmount(
              transaction.amount,
              transaction.currency,
            )}
          </p>
        </div>

        <div className="grid gap-3 border-t border-brand-border pt-3 text-xs sm:grid-cols-3">
          <div>
            <p className="font-semibold uppercase tracking-wide text-gray-400">
              Order
            </p>
            <Link
              href={`/orders/${transaction.order.id}`}
              className="mt-1 inline-flex font-bold text-brand-red hover:underline"
            >
              #{transaction.order.orderNumber}
            </Link>
          </div>
          <div>
            <p className="font-semibold uppercase tracking-wide text-gray-400">
              Initiated
            </p>
            <p className="mt-1 font-medium text-gray-700">
              {formatTransactionDate(transaction.createdAt)}
            </p>
          </div>
          <div>
            <p className="font-semibold uppercase tracking-wide text-gray-400">
              {completion?.label ?? "Paid"}
            </p>
            <p className="mt-1 font-medium text-gray-700">
              {formatTransactionDate(completion?.value ?? null)}
            </p>
          </div>
        </div>

        {transaction.bankTransactionId && (
          <p className="break-all rounded-xl bg-brand-light-bg px-3 py-2 font-mono text-[11px] text-gray-600">
            Bank reference: {transaction.bankTransactionId}
          </p>
        )}
      </div>
    </li>
  );
}

function TransactionPagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-2xl border border-brand-border bg-brand-white p-2.5 text-xs font-semibold text-gray-600 shadow-sm sm:p-3">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        aria-label="Previous transaction page"
        className="inline-flex items-center gap-1 rounded-xl border border-brand-border px-3 py-1.5 transition hover:border-brand-red hover:text-brand-red disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        <span className="hidden min-[380px]:inline">Previous</span>
      </button>
      <span className="text-center">
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        aria-label="Next transaction page"
        className="inline-flex items-center gap-1 rounded-xl border border-brand-border px-3 py-1.5 transition hover:border-brand-red hover:text-brand-red disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="hidden min-[380px]:inline">Next</span>
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
