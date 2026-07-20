"use client";

import {
  Boxes,
  Layers,
  Receipt,
  Scale,
  Wallet,
} from "lucide-react";

import type {
  CapitalCostSummary,
  ProductCostSummary,
} from "@/features/admin-capital-costs/api";
import { formatCurrency } from "@/features/admin-capital-costs/api";
import { cn } from "@/lib/utils";

type CardTone = "neutral" | "positive" | "negative";

function SummaryCard({
  icon,
  label,
  value,
  hint,
  tone = "neutral",
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  tone?: CardTone;
  loading?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-brand-border bg-brand-white p-4 shadow-sm">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-light-bg text-brand-red">
          {icon}
        </span>
        {label}
      </p>
      {loading ? (
        <div className="mt-3 h-6 w-28 animate-pulse rounded-md bg-brand-light-bg" />
      ) : (
        <p
          className={cn(
            "mt-2 text-lg font-extrabold tracking-tight sm:text-xl",
            tone === "positive" && "text-emerald-600",
            tone === "negative" && "text-rose-600",
            tone === "neutral" && "text-brand-black",
          )}
        >
          {value}
        </p>
      )}
      {hint && !loading && (
        <p className="mt-1 text-[11px] text-gray-500">{hint}</p>
      )}
    </div>
  );
}

export default function CapitalCostSummaryCards({
  summary,
  productCost,
  currency,
  loading,
}: {
  summary: CapitalCostSummary | null;
  productCost: ProductCostSummary | null;
  currency: string;
  loading: boolean;
}) {
  const remaining = summary?.remainingBalance ?? 0;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <SummaryCard
        icon={<Wallet className="h-4 w-4" />}
        label="Total Capital"
        value={formatCurrency(summary?.totalCapital ?? 0, currency)}
        hint="Capital input by admin"
        loading={loading}
      />


      <SummaryCard
        icon={<Boxes className="h-4 w-4" />}
        label="Product Costs"
        value={formatCurrency(summary?.productCosts ?? 0, currency)}
        hint={
          productCost
            ? `${productCost.productCount} products · ${productCost.totalUnits} units`
            : "Admin-selected products only"
        }
        loading={loading}
      />


      <SummaryCard
        icon={<Receipt className="h-4 w-4" />}
        label="Other Costs"
        value={formatCurrency(summary?.otherCosts ?? 0, currency)}
        hint="Manually added costs"
        loading={loading}
      />
      <SummaryCard
        icon={<Layers className="h-4 w-4" />}
        label="All Costs"
        value={formatCurrency(summary?.allCosts ?? 0, currency)}
        hint="Product + other costs"
        loading={loading}
      />
      <SummaryCard
        icon={<Scale className="h-4 w-4" />}
        label="Remaining Balance"
        value={formatCurrency(remaining, currency)}
        hint="Capital − all costs"
        tone={remaining < 0 ? "negative" : "positive"}
        loading={loading}
      />
    </div>
  );
}
