"use client";

import {
  STATUS_VALUES,
  type AdminCategoryRow,
  type CategoryFormState,
  type CategoryStatus,
} from "@/features/admin-categories/api";
import ImageUploader from "@/components/ui/ImageUploader";
import { ButtonLoader } from "@/components/ui/loading";
import { cn } from "@/lib/utils";

import Field from "@/app/admin/components/Field";

export default function CategoryFormDrawer({
  open,
  mode,
  editing,
  form,
  isSubmitting,
  onClose,
  onChange,
  onSubmit,
}: {
  open: boolean;
  mode: "create" | "edit";
  editing: AdminCategoryRow | null;
  form: CategoryFormState;
  isSubmitting: boolean;
  onClose: () => void;
  onChange: React.Dispatch<React.SetStateAction<CategoryFormState>>;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <>
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-60 bg-gray-900/35 backdrop-blur-[1px] transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-70 w-full max-w-md border-l border-brand-border bg-brand-white shadow-2xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-brand-border bg-brand-black px-5 py-4 text-brand-white">
            <h2 className="text-lg font-bold">
              {mode === "create" ? "Create Category" : "Edit Category"}
            </h2>
            <p className="mt-0.5 text-xs text-brand-white/70">
              {mode === "create"
                ? "Add a category and publish it to the storefront."
                : "Update category details and visibility."}
            </p>
          </div>

          <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
              <Field label="Name" required>
                <input
                  value={form.name}
                  onChange={(event) =>
                    onChange((prev) => ({ ...prev, name: event.target.value }))
                  }
                  className="h-10 w-full rounded-xl border border-brand-border px-3 text-sm outline-none transition focus:border-brand-red"
                  placeholder="Category name"
                />
              </Field>

              <Field label="Status" required>
                <select
                  value={form.status}
                  onChange={(event) =>
                    onChange((prev) => ({
                      ...prev,
                      status: event.target.value as CategoryStatus,
                    }))
                  }
                  className="h-10 w-full rounded-xl border border-brand-border px-3 text-sm outline-none transition focus:border-brand-red"
                >
                  {STATUS_VALUES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Image">
                <ImageUploader
                  value={form.image}
                  onChange={(url) =>
                    onChange((prev) => ({ ...prev, image: url }))
                  }
                  disabled={isSubmitting}
                />
              </Field>

              <Field label="Description">
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    onChange((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  className="min-h-28 w-full rounded-xl border border-brand-border px-3 py-2 text-sm outline-none transition focus:border-brand-red"
                  placeholder="What's in this category?"
                />
              </Field>

              {mode === "edit" && editing && (
                <div className="rounded-xl border border-brand-border bg-brand-light-bg p-3 text-xs text-brand-text-muted">
                  <p>
                    Slug:{" "}
                    <span className="font-mono font-semibold">
                      {editing.slug}
                    </span>
                  </p>
                  <p className="mt-1">
                    Renaming the category may regenerate the slug — existing
                    storefront links could break.
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-brand-border bg-brand-white px-5 py-4">
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-10 rounded-xl border border-brand-border px-4 text-sm font-semibold text-brand-black transition hover:bg-brand-light-bg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-red px-4 text-sm font-semibold text-brand-white transition hover:bg-brand-red-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <ButtonLoader label={mode === "create" ? "Creating..." : "Saving..."} />
                  ) : mode === "create" ? (
                    "Create"
                  ) : (
                    "Save changes"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </aside>
    </>
  );
}
