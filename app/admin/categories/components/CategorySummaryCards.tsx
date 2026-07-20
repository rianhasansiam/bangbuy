"use client";

import { Eye, FolderTree, Package } from "lucide-react";

import { cn } from "@/lib/utils";

type SummaryAccent = "violet" | "emerald" | "amber";

const ACCENT_STYLES: Record<SummaryAccent, string> = {
  violet: "bg-brand-light-bg text-brand-black",
  emerald: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
};

function SummaryCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: SummaryAccent;
}) {
  return (
    <div className="rounded-2xl border border-brand-border bg-brand-white p-4 shadow-sm">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
        {icon}
        {label}
      </p>
      <p
        className={cn(
          "mt-2 inline-flex rounded-xl px-3 py-1.5 text-sm font-bold",
          ACCENT_STYLES[accent],
        )}
      >
        {value}
      </p>
    </div>
  );
}

export default function CategorySummaryCards({
  totalCategories,
  active,
  productsMapped,
}: {
  totalCategories: number;
  active: number;
  productsMapped: number;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <SummaryCard
        icon={<FolderTree className="h-4 w-4" />}
        label="Total categories"
        value={totalCategories.toLocaleString()}
        accent="violet"
      />
      <SummaryCard
        icon={<Eye className="h-4 w-4" />}
        label="Active"
        value={active.toLocaleString()}
        accent="emerald"
      />
      <SummaryCard
        icon={<Package className="h-4 w-4" />}
        label="Products mapped"
        value={productsMapped.toLocaleString()}
        accent="amber"
      />
    </div>
  );
}
