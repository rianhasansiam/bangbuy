"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { Minus, Plus, ShoppingCart, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

import { ButtonLoader } from "@/components/ui/loading";
import {
  canUseServerCart,
  createCartItemOnServer,
  fetchServerCartSnapshot,
  type CartItem,
} from "@/features/cart/api";
import {
  readLocalCart,
  upsertLocalCartItem,
  writeLocalCart,
} from "@/features/cart/storage";
import { computeCartSummary } from "@/features/cart/summary";
import { useSession } from "@/lib/auth/use-app-session";
import { toast } from "@/lib/feedback";
import { type AppDispatch } from "@/store";
import {
  setCartData,
  setCartError as setCartErrorAction,
} from "@/store/slices/cart.slice";

import { initialVariantSelectionId } from "./variant-selection";

const FALLBACK_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400";
const PRODUCT_VARIANT_IMAGE_EVENT = "BangBuy:product-variant-image";
const HEX_VALUE = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

export type ProductVariantOption = {
  id: string;
  variantKey: string;
  name: string | null;
  modelNumber: string | null;
  sku: string | null;
  color: string | null;
  size: string | null;
  attributes: Record<string, string> | null;
  stock: number;
  image: string | null;
  isActive: boolean;
};

type DisplayOption = {
  key: string;
  value: string;
};

function colorIsHex(value: string | null): boolean {
  return typeof value === "string" && HEX_VALUE.test(value.trim());
}

function normalizedOptionKey(value: string): string {
  return value.trim().toLocaleLowerCase();
}

/**
 * Size and color remain convenient shortcuts in the schema, but are exposed
 * through the same UI as every arbitrary key/value variant attribute.
 */
function variantDisplayOptions(variant: ProductVariantOption): DisplayOption[] {
  const options = new Map<string, DisplayOption>();

  for (const [rawKey, rawValue] of Object.entries(variant.attributes ?? {})) {
    const key = rawKey.trim();
    const value = rawValue.trim();
    if (!key || !value) continue;
    options.set(normalizedOptionKey(key), { key, value });
  }

  if (variant.color?.trim() && !options.has("color")) {
    options.set("color", { key: "Color", value: variant.color.trim() });
  }
  if (variant.size?.trim() && !options.has("size")) {
    options.set("size", { key: "Size", value: variant.size.trim() });
  }

  return [...options.values()];
}

function variantLabel(variant: ProductVariantOption): string {
  const name = variant.name?.trim();
  if (name) return name;

  const values = variantDisplayOptions(variant).map((option) => option.value);
  if (values.length > 0) return values.join(" / ");

  return variant.modelNumber?.trim() || variant.sku?.trim() || "Standard option";
}

function genericAttributeSummary(
  attributes: Record<string, string> | null,
): string | null {
  const summary = Object.entries(attributes ?? {})
    .map(([key, value]) => `${key}: ${value}`)
    .join(" · ");
  return summary || null;
}

type ProductActionsProps = {
  productId: string;
  productSlug: string;
  productName: string;
  image?: string | null;
  variants: ProductVariantOption[];
  /** Regular selling price (product-level). */
  salePrice: number;
  /** Optional discounted price; when set it's the price the customer pays. */
  discountPrice: number | null;
};

const ProductActions = ({
  productId,
  productSlug,
  productName,
  image,
  variants,
  salePrice,
  discountPrice,
}: ProductActionsProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { data: session, status } = useSession();

  const activeVariants = useMemo(
    () => variants.filter((variant) => variant.isActive),
    [variants],
  );
  const requiresExplicitSelection = activeVariants.length > 1;
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(() =>
    initialVariantSelectionId(variants),
  );
  const [quantity, setQuantity] = useState(1);
  const [isCartBusy, setIsCartBusy] = useState(false);
  const [isBuyNowPending, startBuyNowTransition] = useTransition();

  const selectedVariant =
    activeVariants.find((variant) => variant.id === selectedVariantId) ?? null;
  const stockCount = selectedVariant?.stock ?? 0;
  const isPurchasable = selectedVariant != null && stockCount > 0;
  const currentListPrice = salePrice;
  const unitPrice =
    discountPrice != null && discountPrice < salePrice ? discountPrice : salePrice;
  const discount =
    currentListPrice > unitPrice
      ? Math.round(((currentListPrice - unitPrice) / currentListPrice) * 100)
      : 0;

  const notifyVariantImageChange = useCallback(
    (variant: ProductVariantOption | null) => {
      window.dispatchEvent(
        new CustomEvent(PRODUCT_VARIANT_IMAGE_EVENT, {
          detail: {
            productId,
            variantId: variant?.id ?? null,
            image: variant?.image ?? null,
          },
        }),
      );
    },
    [productId],
  );

  const selectVariant = (variant: ProductVariantOption) => {
    setSelectedVariantId(variant.id);
    setQuantity(1);
    notifyVariantImageChange(variant);
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((current) =>
      Math.max(1, Math.min(stockCount || 1, current + delta)),
    );
  };

  const handleAddToCart = async () => {
    if (!isPurchasable || isCartBusy || !selectedVariant) return;

    const canUseServer = canUseServerCart(session?.user?.role, status);
    dispatch(setCartErrorAction(null));

    if (canUseServer) {
      setIsCartBusy(true);
      try {
        await createCartItemOnServer(productId, quantity, selectedVariant.id);
        const snapshot = await fetchServerCartSnapshot();
        writeLocalCart(snapshot.items);
        dispatch(setCartData(snapshot));
        toast.success(`${productName} added to cart`);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to add item to cart.";
        dispatch(setCartErrorAction(message));
        toast.error(message);
      } finally {
        setIsCartBusy(false);
      }
      return;
    }

    const localBefore = readLocalCart();
    const optimisticItem: CartItem = {
      id: `local:${selectedVariant.id}`,
      productId,
      slug: productSlug,
      variantId: selectedVariant.id,
      variantName: selectedVariant.name,
      sku: selectedVariant.sku,
      color: selectedVariant.color,
      size: selectedVariant.size,
      attributes: selectedVariant.attributes,
      attributeSummary: genericAttributeSummary(selectedVariant.attributes),
      name: productName,
      image: selectedVariant.image ?? image ?? FALLBACK_PRODUCT_IMAGE,
      quantity,
      unitPrice,
      originalPrice: currentListPrice,
      lineTotal: unitPrice * quantity,
      stock: stockCount,
      status: "ACTIVE",
    };

    const nextLocal = upsertLocalCartItem(localBefore, optimisticItem);
    writeLocalCart(nextLocal);
    dispatch(
      setCartData({
        items: nextLocal,
        summary: computeCartSummary(nextLocal),
      }),
    );
    toast.success(`${productName} added to cart`);
  };

  const handleBuyNow = () => {
    if (!isPurchasable || !selectedVariant || isBuyNowPending) return;
    const target = `/checkout?buy=${encodeURIComponent(
      `${productId}:${quantity}:${selectedVariant.id}`,
    )}`;
    const nextHref =
      status !== "authenticated"
        ? `/login?callbackUrl=${encodeURIComponent(target)}`
        : target;
    startBuyNowTransition(() => {
      router.push(nextHref);
    });
  };

  return (
    <div className="space-y-5 border-t border-gray-100 pt-4">
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="text-3xl font-bold text-gray-900">
          {unitPrice.toLocaleString()} BDT
        </span>
        {discount > 0 && (
          <>
            <span className="text-lg text-gray-400 line-through">
              {currentListPrice.toLocaleString()} BDT
            </span>
            <span className="rounded-full bg-brand-red/10 px-2 py-0.5 text-xs font-bold text-brand-red">
              -{discount}%
            </span>
          </>
        )}
      </div>

      {activeVariants.length > 1 && (
        <fieldset className="space-y-3" aria-describedby="variant-selection-help">
          <legend className="text-sm font-semibold text-gray-900">
            Choose an option combination
          </legend>
          <p id="variant-selection-help" className="text-xs text-gray-500">
            Select one complete combination before adding this product to your cart.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {activeVariants.map((variant) => {
              const isSelected = variant.id === selectedVariant?.id;
              const isOutOfStock = variant.stock <= 0;
              const options = variantDisplayOptions(variant);

              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => selectVariant(variant)}
                  disabled={isOutOfStock}
                  aria-pressed={isSelected}
                  className={`rounded-xl border p-3 text-left transition ${
                    isSelected
                      ? "border-brand-red bg-brand-red/5 ring-1 ring-brand-red"
                      : isOutOfStock
                        ? "cursor-not-allowed border-gray-200 bg-gray-50 opacity-60"
                        : "border-gray-200 bg-white hover:border-brand-red/70 hover:bg-brand-red/5"
                  }`}
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="min-w-0 font-semibold text-gray-900">
                      {variantLabel(variant)}
                    </span>
                    <span
                      className={`shrink-0 text-xs font-medium ${
                        isOutOfStock ? "text-rose-600" : "text-emerald-600"
                      }`}
                    >
                      {isOutOfStock ? "Out of stock" : `${variant.stock} available`}
                    </span>
                  </span>
                  {options.length > 0 && (
                    <span className="mt-2 flex flex-wrap gap-1.5">
                      {options.map((option) => (
                        <span
                          key={`${variant.id}:${option.key}`}
                          className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700"
                        >
                          {option.key}:{" "}
                          {normalizedOptionKey(option.key) === "color" &&
                            colorIsHex(option.value) && (
                              <span
                                className="h-3 w-3 rounded-full ring-1 ring-inset ring-black/15"
                                style={{ backgroundColor: option.value }}
                                aria-hidden="true"
                              />
                            )}
                          <span className="font-medium">{option.value}</span>
                        </span>
                      ))}
                    </span>
                  )}
                  {(variant.modelNumber || variant.sku) && (
                    <span className="mt-2 block text-xs text-gray-500">
                      {[variant.modelNumber, variant.sku].filter(Boolean).join(" · ")}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {activeVariants.length === 1 && selectedVariant &&
        variantDisplayOptions(selectedVariant).length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Included option
            </p>
            <dl className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              {variantDisplayOptions(selectedVariant).map((option) => (
                <div key={option.key} className="flex gap-1.5">
                  <dt className="text-gray-500">{option.key}:</dt>
                  <dd className="font-medium text-gray-900">{option.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

      <p className="text-xs font-medium text-gray-500" aria-live="polite">
        {activeVariants.length === 0 ? (
          <span className="text-rose-600">This product is currently unavailable.</span>
        ) : requiresExplicitSelection && !selectedVariant ? (
          "Choose an option combination to see its availability."
        ) : isPurchasable ? (
          <>
            <span className="text-emerald-600">In stock</span>
            {stockCount <= 5 && (
              <span className="ml-1 text-amber-600">· only {stockCount} left</span>
            )}
          </>
        ) : (
          <span className="text-rose-600">Out of stock</span>
        )}
      </p>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center overflow-hidden rounded-lg border border-gray-200">
          <button
            type="button"
            onClick={() => handleQuantityChange(-1)}
            disabled={!isPurchasable || quantity <= 1}
            aria-label="Decrease quantity"
            className="p-2.5 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Minus className="h-4 w-4 text-gray-600" />
          </button>
          <span className="w-12 text-center font-medium text-gray-900">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => handleQuantityChange(1)}
            disabled={!isPurchasable || quantity >= stockCount}
            aria-label="Increase quantity"
            className="p-2.5 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            void handleAddToCart();
          }}
          disabled={!isPurchasable || isCartBusy}
          aria-busy={isCartBusy}
          className={`flex items-center gap-2 rounded-lg px-6 py-2.5 font-medium transition-all ${
            isPurchasable
              ? "bg-brand-red text-brand-white hover:bg-brand-red-hover"
              : "cursor-not-allowed bg-gray-300 text-gray-500"
          }`}
        >
          {isCartBusy ? (
            <ButtonLoader label="Adding..." />
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              {requiresExplicitSelection && !selectedVariant
                ? "Select an option"
                : "Add to cart"}
            </>
          )}
        </button>
      </div>

      <button
        type="button"
        onClick={handleBuyNow}
        disabled={!isPurchasable || isBuyNowPending}
        aria-busy={isBuyNowPending}
        className={`flex w-full items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-sm font-bold transition-all ${
          isPurchasable
            ? "bg-brand-black text-brand-white shadow-md hover:-translate-y-0.5 hover:bg-brand-dark-surface hover:shadow-lg"
            : "cursor-not-allowed bg-gray-200 text-gray-500"
        }`}
      >
        {isBuyNowPending ? (
          <ButtonLoader label="Preparing checkout..." />
        ) : (
          <>
            <Zap className="h-4 w-4" />
            Buy now
          </>
        )}
      </button>
    </div>
  );
};

export default ProductActions;
