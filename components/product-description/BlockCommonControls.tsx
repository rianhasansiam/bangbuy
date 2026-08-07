"use client";

import { cn } from "@/lib/utils";
import type {
  BaseBlock,
} from "@/lib/types/product-description-blocks";

const inputClass =
  "h-10 w-full rounded-xl border border-brand-border bg-white px-3 text-sm outline-none transition focus:border-brand-red disabled:cursor-not-allowed disabled:bg-gray-50";

type BlockCommonControlsProps = {
  block: Pick<BaseBlock, "isVisible" | "spacing" | "containerStyle">;
  onChange: (patch: Partial<Pick<BaseBlock, "isVisible" | "spacing" | "containerStyle">>) => void;
  disabled?: boolean;
};

/** Shared visibility, spacing, and container-style controls for every block. */
export default function BlockCommonControls({
  block,
  onChange,
  disabled,
}: BlockCommonControlsProps) {
  return (
    <div className="mt-4 grid gap-3 border-t border-brand-border pt-4 sm:grid-cols-3">
      {/* Visibility */}
      <div>
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Visibility
        </p>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={block.isVisible}
            onChange={(e) => onChange({ isVisible: e.target.checked })}
            disabled={disabled}
            className="h-4 w-4 accent-brand-red"
          />
          <span className="text-sm text-gray-700">
            {block.isVisible ? "Visible on public page" : "Hidden from public page"}
          </span>
        </label>
      </div>

      {/* Spacing */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
          Block spacing
        </label>
        <select
          value={block.spacing ?? "medium"}
          onChange={(e) =>
            onChange({
              spacing: e.target.value as BaseBlock["spacing"],
            })
          }
          disabled={disabled}
          className={cn(inputClass)}
        >
          <option value="small">Small</option>
          <option value="medium">Medium (default)</option>
          <option value="large">Large</option>
        </select>
      </div>

      {/* Container style */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
          Container style
        </label>
        <select
          value={block.containerStyle ?? "contained"}
          onChange={(e) =>
            onChange({
              containerStyle: e.target.value as BaseBlock["containerStyle"],
            })
          }
          disabled={disabled}
          className={cn(inputClass)}
        >
          <option value="contained">Contained</option>
          <option value="fullWidth">Full width</option>
        </select>
      </div>
    </div>
  );
}
