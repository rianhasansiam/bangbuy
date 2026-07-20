"use client";

import { cn } from "@/lib/utils";

type SummaryAccent = "violet" | "emerald" | "amber";

const ACCENT_STYLES: Record<SummaryAccent, string> = {
  violet: "bg-brand-light-bg text-brand-black",
  emerald: "bg-emerald-50 text-emerald-700",
  amber: "bg-brand-light-bg text-brand-black",
};

function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: SummaryAccent;
}) {
  return (
    <div className="rounded-2xl border border-brand-border bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
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

export default function TestimonialSummaryCards({
  total,
  activeCount,
}: {
  total: number;
  activeCount: number;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <SummaryCard
        label="Total testimonials"
        value={total.toLocaleString()}
        accent="violet"
      />
      <SummaryCard
        label="Active (shown on site)"
        value={activeCount.toLocaleString()}
        accent="emerald"
      />
      <SummaryCard
        label="Layout"
        value={activeCount > 3 ? "Auto-scrolling" : "Static grid"}
        accent="amber"
      />
    </div>
  );
}
