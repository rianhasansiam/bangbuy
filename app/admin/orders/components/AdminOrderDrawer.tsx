"use client";

import { useMemo, useState, type Dispatch, type FormEvent, type SetStateAction } from "react";
import { Download, PackagePlus, Plus, ReceiptText, Trash2, X } from "lucide-react";

import { LoadingSpinner } from "@/components/ui/loading";
import type { AdminProduct } from "@/features/admin-products/api";
import {
  formatCurrency,
  type AdminOrderCustomer,
  type AdminOrderDraft,
} from "@/features/admin-orders/api";
import type { CheckoutPreview } from "@/features/checkout/api";
import type { OrderDetail } from "@/features/orders/api";
import { cn } from "@/lib/utils";

const inputClass =
  "h-10 w-full rounded-xl border border-brand-border bg-white px-3 text-sm outline-none transition focus:border-brand-red disabled:cursor-not-allowed disabled:bg-brand-light-bg disabled:text-gray-500";

function productPrice(product: AdminProduct): number {
  return product.discountPrice != null && product.discountPrice < product.salePrice
    ? product.discountPrice
    : product.salePrice;
}

export default function AdminOrderDrawer({
  open,
  customers,
  products,
  isCatalogLoading,
  catalogError,
  draft,
  preview,
  placedOrder,
  error,
  isPreviewing,
  isSubmitting,
  isDownloadingPdf,
  onClose,
  onDraftChange,
  onCustomerChange,
  onPreview,
  onSubmit,
  onDownloadPdf,
  onCreateAnother,
}: {
  open: boolean;
  customers: AdminOrderCustomer[];
  products: AdminProduct[];
  isCatalogLoading: boolean;
  catalogError: string | null;
  draft: AdminOrderDraft;
  preview: CheckoutPreview | null;
  placedOrder: OrderDetail | null;
  error: string | null;
  isPreviewing: boolean;
  isSubmitting: boolean;
  isDownloadingPdf: boolean;
  onClose: () => void;
  onDraftChange: Dispatch<SetStateAction<AdminOrderDraft>>;
  onCustomerChange: (customerId: string) => void;
  onPreview: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onDownloadPdf: () => void;
  onCreateAnother: () => void;
}) {
  const [productToAdd, setProductToAdd] = useState("");
  const locked = isSubmitting || placedOrder !== null;

  const purchasableProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          product.status === "ACTIVE" &&
          product.variants.some((variant) => variant.isActive && variant.stock > 0),
      ),
    [products],
  );
  const productById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );
  const selectedCustomer = customers.find(
    (customer) => customer.id === draft.customerId,
  );
  const canCalculate = draft.items.length > 0 && !isCatalogLoading;
  const draftAdvancePayment = Number(draft.advancePayment || 0);
  const advancePayment = Number.isFinite(draftAdvancePayment)
    ? Math.max(draftAdvancePayment, 0)
    : 0;

  const addProduct = () => {
    const product = productById.get(productToAdd);
    const variant = product?.variants.find(
      (candidate) => candidate.isActive && candidate.stock > 0 && candidate.id,
    );
    if (!product || !variant?.id) return;
    const variantId = variant.id;

    onDraftChange((current) => {
      const existing = current.items.findIndex(
        (item) => item.productId === product.id && item.variantId === variantId,
      );
      if (existing === -1) {
        return {
          ...current,
          items: [
            ...current.items,
            { productId: product.id, variantId, quantity: 1 },
          ],
        };
      }

      return {
        ...current,
        items: current.items.map((item, index) =>
          index === existing
            ? { ...item, quantity: Math.min(item.quantity + 1, variant.stock) }
            : item,
        ),
      };
    });
    setProductToAdd("");
  };

  const updateLine = (
    index: number,
    patch: Partial<AdminOrderDraft["items"][number]>,
  ) => {
    onDraftChange((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    }));
  };

  const removeLine = (index: number) => {
    onDraftChange((current) => ({
      ...current,
      items: current.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  return (
    <>
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-60 bg-brand-black/35 backdrop-blur-[1px] transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        aria-modal="true"
        aria-label="Place customer order"
        role="dialog"
        className={cn(
          "fixed inset-y-0 right-0 z-70 flex w-full max-w-2xl flex-col border-l border-brand-border bg-brand-white shadow-2xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-brand-border bg-brand-black px-5 py-4 text-brand-white">
          <div>
            <h2 className="text-lg font-bold">Place order for customer</h2>
            <p className="mt-0.5 text-xs text-brand-white/70">
              Create an order for a registered customer or a walk-in guest with the same checkout, stock, revenue, and profit rules.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-brand-white/75 transition hover:bg-white/10 hover:text-brand-white"
            aria-label="Close order form"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {placedOrder ? (
          <div className="flex flex-1 flex-col justify-center overflow-y-auto p-5 sm:p-7">
            <div className="mx-auto w-full max-w-md rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
              <ReceiptText className="mx-auto h-10 w-10 text-emerald-700" />
              <h3 className="mt-3 text-lg font-bold text-emerald-950">Order placed</h3>
              <p className="mt-1 text-sm text-emerald-800">
                {placedOrder.orderNumber} for {placedOrder.customerName} is now included in sales, revenue, and profit.
              </p>
              <p className="mt-3 text-xl font-bold text-emerald-950">
                {formatCurrency(placedOrder.totalAmount)}
              </p>
              {placedOrder.advancePayment > 0 && (
                <p className="mt-2 text-sm font-semibold text-emerald-800">
                  {formatCurrency(placedOrder.advancePayment)} advance paid - {formatCurrency(
                    Math.max(
                      placedOrder.totalAmount - placedOrder.advancePayment,
                      0,
                    ),
                  )} balance due
                </p>
              )}
              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={onDownloadPdf}
                  disabled={isDownloadingPdf}
                  aria-busy={isDownloadingPdf}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDownloadingPdf ? <LoadingSpinner decorative size="sm" /> : <Download className="h-4 w-4" />}
                  {isDownloadingPdf ? "Preparing PDF..." : "Download PDF receipt"}
                </button>
                <button
                  type="button"
                  onClick={onCreateAnother}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-white px-4 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
                >
                  <PackagePlus className="h-4 w-4" />
                  Create another
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
              {catalogError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {catalogError}
                </div>
              )}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <section className="space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Customer</h3>
                  <p className="text-xs text-gray-500">Use a registered account or leave the selection on guest for a walk-in customer.</p>
                </div>
                <select
                  value={draft.customerId}
                  onChange={(event) => onCustomerChange(event.target.value)}
                  disabled={locked || isCatalogLoading}
                  className={inputClass}
                >
                  <option value="">Guest customer (not registered)</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {[customer.name || "Unnamed customer", customer.email || customer.phone || customer.id]
                        .filter(Boolean)
                        .join(" - ")}
                    </option>
                  ))}
                </select>
                {selectedCustomer?.email && (
                  <p className="text-xs text-gray-500">
                    Receipt email: {selectedCustomer.email}
                  </p>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block space-y-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">Customer name *</span>
                    <input
                      value={draft.customerName}
                      onChange={(event) => onDraftChange((current) => ({ ...current, customerName: event.target.value }))}
                      disabled={locked}
                      className={inputClass}
                      placeholder="Customer name"
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">Phone *</span>
                    <input
                      value={draft.customerPhone}
                      onChange={(event) => onDraftChange((current) => ({ ...current, customerPhone: event.target.value }))}
                      disabled={locked}
                      className={inputClass}
                      placeholder="Phone number"
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                      Email {selectedCustomer ? "(account)" : "(optional)"}
                    </span>
                    <input
                      type="email"
                      value={draft.customerEmail}
                      onChange={(event) => onDraftChange((current) => ({ ...current, customerEmail: event.target.value }))}
                      disabled={locked || Boolean(selectedCustomer)}
                      className={inputClass}
                      placeholder="customer@example.com"
                    />
                  </label>
                </div>
                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">Delivery address *</span>
                  <textarea
                    value={draft.customerAddress}
                    onChange={(event) => onDraftChange((current) => ({ ...current, customerAddress: event.target.value }))}
                    disabled={locked}
                    className="min-h-20 w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-red disabled:cursor-not-allowed disabled:bg-brand-light-bg"
                    placeholder="Street, area, city"
                  />
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block space-y-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">City / district</span>
                    <input
                      value={draft.customerCity}
                      onChange={(event) => onDraftChange((current) => ({ ...current, customerCity: event.target.value }))}
                      disabled={locked}
                      className={inputClass}
                      placeholder="Optional"
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">Delivery area *</span>
                    <select
                      value={draft.deliveryZone}
                      onChange={(event) => onDraftChange((current) => ({
                        ...current,
                        deliveryZone: event.target.value as typeof current.deliveryZone,
                      }))}
                      disabled={locked}
                      className={inputClass}
                    >
                      <option value="INSIDE_DHAKA">Delivery inside Dhaka</option>
                      <option value="OUTSIDE_DHAKA">Delivery outside Dhaka</option>
                    </select>
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">Postal code</span>
                    <input
                      value={draft.customerPostalCode}
                      onChange={(event) => onDraftChange((current) => ({ ...current, customerPostalCode: event.target.value }))}
                      disabled={locked}
                      className={inputClass}
                      placeholder="Optional"
                    />
                  </label>
                </div>
              </section>

              <section className="space-y-3 border-t border-brand-border pt-5">
                <div className="flex flex-wrap items-end gap-2">
                  <div className="min-w-52 flex-1">
                    <h3 className="text-sm font-bold text-gray-900">Products</h3>
                    <p className="text-xs text-gray-500">Only active, in-stock variants can be added.</p>
                  </div>
                  <select
                    value={productToAdd}
                    onChange={(event) => setProductToAdd(event.target.value)}
                    disabled={locked || isCatalogLoading}
                    className="h-10 min-w-48 rounded-xl border border-brand-border bg-white px-3 text-sm outline-none transition focus:border-brand-red disabled:cursor-not-allowed disabled:bg-brand-light-bg"
                  >
                    <option value="">Select product</option>
                    {purchasableProducts.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - {formatCurrency(productPrice(product))}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addProduct}
                    disabled={!productToAdd || locked}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-brand-border px-3 text-sm font-semibold text-foreground transition hover:bg-brand-light-bg disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </button>
                </div>

                {draft.items.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-brand-border bg-brand-light-bg p-4 text-sm text-gray-500">
                    Add at least one product to calculate and place the order.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {draft.items.map((line, index) => {
                      const product = productById.get(line.productId);
                      const variants = product?.variants.filter(
                        (variant) => variant.isActive && variant.stock > 0 && variant.id,
                      ) ?? [];
                      const activeVariant = variants.find((variant) => variant.id === line.variantId);
                      return (
                        <div key={`${line.productId}-${line.variantId}-${index}`} className="rounded-xl border border-brand-border bg-brand-light-bg p-3">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-gray-900">{product?.name ?? "Unavailable product"}</p>
                              <p className="mt-0.5 text-xs text-gray-500">
                                {product ? formatCurrency(productPrice(product)) : ""} each
                              </p>
                            </div>
                            <select
                              value={line.variantId}
                              onChange={(event) => updateLine(index, { variantId: event.target.value, quantity: 1 })}
                              disabled={locked}
                              className="h-9 min-w-40 rounded-lg border border-brand-border bg-white px-2 text-xs outline-none focus:border-brand-red"
                            >
                              {variants.map((variant) => (
                                <option key={variant.id} value={variant.id}>
                                  {variant.size} / {variant.color} ({variant.stock} in stock)
                                </option>
                              ))}
                            </select>
                            <input
                              type="number"
                              min="1"
                              max={activeVariant?.stock ?? 1}
                              value={line.quantity}
                              onChange={(event) => {
                                const next = Math.max(1, Math.min(Number(event.target.value) || 1, activeVariant?.stock ?? 1));
                                updateLine(index, { quantity: next });
                              }}
                              disabled={locked}
                              aria-label={`Quantity for ${product?.name ?? "product"}`}
                              className="h-9 w-20 rounded-lg border border-brand-border bg-white px-2 text-sm outline-none focus:border-brand-red"
                            />
                            <button
                              type="button"
                              onClick={() => removeLine(index)}
                              disabled={locked}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                              aria-label={`Remove ${product?.name ?? "product"}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              <section className="space-y-3 border-t border-brand-border pt-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block space-y-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">Promo code</span>
                    <input
                      value={draft.promoCode}
                      onChange={(event) => onDraftChange((current) => ({ ...current, promoCode: event.target.value }))}
                      disabled={locked}
                      className={inputClass}
                      placeholder="Optional"
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">Payment</span>
                    <input value="Cash on delivery" disabled className={inputClass} />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">Advance payment</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      value={draft.advancePayment}
                      onChange={(event) => onDraftChange((current) => ({ ...current, advancePayment: event.target.value }))}
                      disabled={locked}
                      className={inputClass}
                      placeholder="0"
                    />
                    <span className="text-[11px] text-gray-500">Collected now; it does not change the order total.</span>
                  </label>
                </div>
                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">Order note</span>
                  <textarea
                    value={draft.customerNote}
                    onChange={(event) => onDraftChange((current) => ({ ...current, customerNote: event.target.value }))}
                    disabled={locked}
                    className="min-h-20 w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-red disabled:cursor-not-allowed disabled:bg-brand-light-bg"
                    placeholder="Optional delivery or customer note"
                  />
                </label>
              </section>

              <section className="rounded-2xl border border-brand-border bg-brand-light-bg p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Order total</h3>
                    <p className="text-xs text-gray-500">Calculated from current store pricing on the server.</p>
                  </div>
                  <button
                    type="button"
                    onClick={onPreview}
                    disabled={!canCalculate || isPreviewing || locked}
                    aria-busy={isPreviewing}
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-brand-border bg-white px-3 text-xs font-semibold text-foreground transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isPreviewing && <LoadingSpinner decorative size="xs" />}
                    {isPreviewing ? "Calculating..." : "Calculate total"}
                  </button>
                </div>
                {preview ? (
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600"><span>Products</span><span>{formatCurrency(preview.summary.subtotal)}</span></div>
                    {preview.summary.discount > 0 && <div className="flex justify-between text-emerald-700"><span>Discount</span><span>-{formatCurrency(preview.summary.discount)}</span></div>}
                    <div className="flex justify-between text-gray-600"><span>{preview.summary.isOutsideDhaka ? "Delivery outside Dhaka" : "Delivery inside Dhaka"}</span><span>{preview.summary.shipping === 0 ? "FREE" : formatCurrency(preview.summary.shipping)}</span></div>
                    {preview.summary.tax > 0 && <div className="flex justify-between text-gray-600"><span>Tax</span><span>{formatCurrency(preview.summary.tax)}</span></div>}
                    <div className="flex justify-between border-t border-brand-border pt-2 text-base font-bold text-gray-900"><span>Total</span><span>{formatCurrency(preview.summary.total)}</span></div>
                    {advancePayment > 0 && <>
                      <div className="flex justify-between text-emerald-700"><span>Advance payment</span><span>-{formatCurrency(advancePayment)}</span></div>
                      <div className="flex justify-between font-semibold text-gray-900"><span>Balance due</span><span>{formatCurrency(Math.max(preview.summary.total - advancePayment, 0))}</span></div>
                    </>}
                    {preview.promo && !preview.promo.ok && <p className="pt-1 text-xs font-semibold text-red-600">{preview.promo.reason}</p>}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-gray-500">Calculate the total before placing the order.</p>
                )}
              </section>
            </div>

            <footer className="flex flex-col-reverse gap-2 border-t border-brand-border bg-brand-white px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="h-10 rounded-xl border border-brand-border px-4 text-sm font-semibold text-foreground transition hover:bg-brand-light-bg disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isCatalogLoading}
                aria-busy={isSubmitting}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-red px-4 text-sm font-semibold text-brand-white transition hover:bg-brand-red-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? <LoadingSpinner decorative size="sm" /> : <PackagePlus className="h-4 w-4" />}
                {isSubmitting ? "Placing order..." : "Place order"}
              </button>
            </footer>
          </form>
        )}
      </aside>
    </>
  );
}
