"use client";

import { Building2, Globe2, Tags } from "lucide-react";

import Field from "@/app/admin/components/Field";
import ImageUploader from "@/components/ui/ImageUploader";
import { ButtonLoader } from "@/components/ui/loading";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  CATALOG_ENTITY_STATUS_VALUES,
  type AdminCatalogEntityRow,
  type CatalogEntityFormState,
  type CatalogEntityKind,
  type CatalogEntityStatus,
} from "@/features/admin-catalog-entities/api";
import { slugifyCatalogName } from "@/lib/catalog/catalog-entity";

const INPUT_CLASS =
  "h-10 w-full rounded-xl border border-brand-border px-3 text-sm outline-none transition focus:border-brand-red";

export default function CatalogEntityFormDrawer({
  kind,
  open,
  mode,
  editing,
  form,
  isSubmitting,
  onClose,
  onChange,
  onSubmit,
}: {
  kind: CatalogEntityKind;
  open: boolean;
  mode: "create" | "edit";
  editing: AdminCatalogEntityRow | null;
  form: CatalogEntityFormState;
  isSubmitting: boolean;
  onClose: () => void;
  onChange: React.Dispatch<React.SetStateAction<CatalogEntityFormState>>;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  const label = kind === "brand" ? "Brand" : "Manufacturer";
  const slugPreview =
    mode === "edit" && editing
      ? form.slug
      : slugifyCatalogName(form.name, kind);

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isSubmitting) onClose();
      }}
    >
      <SheetContent
        side="right"
        className="w-full max-w-lg gap-0 sm:w-[32rem] sm:max-w-[32rem]"
      >
        <SheetHeader className="border-b border-white/10 bg-brand-black px-5 py-5 text-brand-white">
          <SheetTitle className="text-lg text-brand-white">
            {mode === "create" ? `Add ${label}` : `Edit ${label}`}
          </SheetTitle>
          <SheetDescription className="text-xs text-brand-white/70">
            {mode === "create"
              ? `Create a reusable ${label.toLowerCase()} for product classification.`
              : `Update ${label.toLowerCase()} details and storefront visibility.`}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
            <Field label="Name" required icon={<Tags className="h-4 w-4" />}>
              <input
                value={form.name}
                onChange={(event) =>
                  onChange((previous) => ({
                    ...previous,
                    name: event.target.value,
                  }))
                }
                maxLength={120}
                autoFocus
                required
                className={INPUT_CLASS}
                placeholder={`${label} name`}
              />
            </Field>

            {kind === "brand" && mode === "edit" && (
              <Field
                label="Canonical slug"
                required
                hint="Changing this creates a permanent redirect from the current brand URL."
              >
                <input
                  value={form.slug}
                  onChange={(event) =>
                    onChange((previous) => ({
                      ...previous,
                      slug: event.target.value.toLowerCase(),
                    }))
                  }
                  maxLength={160}
                  pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                  required
                  className={`${INPUT_CLASS} font-mono`}
                  placeholder="brand-slug"
                />
              </Field>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Status" required>
                <select
                  value={form.status}
                  onChange={(event) =>
                    onChange((previous) => ({
                      ...previous,
                      status: event.target.value as CatalogEntityStatus,
                    }))
                  }
                  className={INPUT_CLASS}
                >
                  {CATALOG_ENTITY_STATUS_VALUES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </Field>

              {kind === "manufacturer" && (
                <Field
                  label="Country"
                  icon={<Building2 className="h-4 w-4" />}
                >
                  <input
                    value={form.country}
                    onChange={(event) =>
                      onChange((previous) => ({
                        ...previous,
                        country: event.target.value,
                      }))
                    }
                    maxLength={120}
                    className={INPUT_CLASS}
                    placeholder="e.g. Bangladesh"
                  />
                </Field>
              )}
            </div>

            <Field
              label="Website"
              icon={<Globe2 className="h-4 w-4" />}
              hint="Use a full http:// or https:// address."
            >
              <input
                type="url"
                value={form.website}
                onChange={(event) =>
                  onChange((previous) => ({
                    ...previous,
                    website: event.target.value,
                  }))
                }
                maxLength={2048}
                className={INPUT_CLASS}
                placeholder="https://example.com"
              />
            </Field>

            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-gray-700">Logo</p>
              <ImageUploader
                value={form.logo}
                onChange={(logo) =>
                  onChange((previous) => ({ ...previous, logo }))
                }
                disabled={isSubmitting}
              />
            </div>

            <Field label="Description">
              <textarea
                value={form.description}
                onChange={(event) =>
                  onChange((previous) => ({
                    ...previous,
                    description: event.target.value,
                  }))
                }
                maxLength={2000}
                className="min-h-28 w-full rounded-xl border border-brand-border px-3 py-2 text-sm outline-none transition focus:border-brand-red"
                placeholder={`Short description of this ${label.toLowerCase()}`}
              />
            </Field>

            {kind === "brand" && (
              <div className="space-y-4 rounded-xl border border-brand-border bg-brand-light-bg p-4">
                <div>
                  <p className="text-sm font-bold text-brand-black">Search and social</p>
                  <p className="mt-1 text-xs text-brand-text-muted">
                    Optional values override the public brand-page fallbacks.
                  </p>
                </div>
                <Field label="SEO title" hint="Recommended: 50–60 characters.">
                  <input
                    value={form.seoTitle}
                    onChange={(event) =>
                      onChange((previous) => ({
                        ...previous,
                        seoTitle: event.target.value,
                      }))
                    }
                    maxLength={70}
                    className={INPUT_CLASS}
                    placeholder={`${label} products`}
                  />
                </Field>
                <Field label="Meta description" hint="Recommended: up to 160 characters.">
                  <textarea
                    value={form.metaDescription}
                    onChange={(event) =>
                      onChange((previous) => ({
                        ...previous,
                        metaDescription: event.target.value,
                      }))
                    }
                    maxLength={320}
                    className="min-h-24 w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-red"
                    placeholder="Unique search-result description"
                  />
                </Field>
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold text-gray-700">Social share image</p>
                  <ImageUploader
                    value={form.ogImage}
                    onChange={(ogImage) =>
                      onChange((previous) => ({ ...previous, ogImage }))
                    }
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            )}

            <div className="rounded-xl border border-brand-border bg-brand-light-bg p-3 text-xs text-brand-text-muted">
              <p className="font-semibold text-brand-black">Stable slug</p>
              <p className="mt-1 break-all font-mono">{slugPreview}</p>
              <p className="mt-1.5">
                {mode === "create"
                  ? "The API generates this slug when the record is created."
                  : kind === "brand"
                    ? "Saving a changed canonical slug preserves this URL as a permanent redirect."
                    : "Display-name changes keep this original slug so existing links remain valid."}
              </p>
            </div>
          </div>

          <div className="border-t border-brand-border bg-white px-5 py-4">
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="h-10 rounded-xl border border-brand-border px-4 text-sm font-semibold text-brand-black transition hover:bg-brand-light-bg disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                className="inline-flex h-10 items-center rounded-xl bg-brand-red px-4 text-sm font-semibold text-white transition hover:bg-brand-red-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <ButtonLoader
                    label={mode === "create" ? "Creating..." : "Saving..."}
                  />
                ) : mode === "create" ? (
                  `Create ${label}`
                ) : (
                  "Save changes"
                )}
              </button>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
