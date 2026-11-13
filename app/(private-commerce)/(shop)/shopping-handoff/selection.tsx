"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useDispatch } from "react-redux";
import { useSession } from "@/lib/auth/use-app-session";
import { useRouter } from "@/lib/i18n/navigation";
import { trackCartAddition } from "@/lib/meta-pixel";
import type { ShoppingSelection } from "@/lib/security/shopping-handoff";
import { createCartItemOnServer, fetchServerCartSnapshot, canUseServerCart, type CartItem } from "@/features/cart/api";
import { readLocalCart, upsertLocalCartItem, writeLocalCart } from "@/features/cart/storage";
import { computeCartSummary } from "@/features/cart/summary";
import { setCartData } from "@/store/slices/cart.slice";
import { createWishlistItemOnServer, canUseServerWishlist, type WishlistItem } from "@/features/wishlist/api";
import { readLocalWishlist, upsertLocalWishlistItem, writeLocalWishlist } from "@/features/wishlist/storage";
import { setWishlistItems } from "@/store/slices/wishlist.slice";
import CurrencyAmount from "@/components/currency/CurrencyAmount";

type PublicSelectionProduct = { id: string; productCode: string | null; slug: string; name: string; image: string | null; price: number; originalPrice: number; brand: string; category: string; rating: number; reviewCount: number; variantId: string | null; variantName: string | null; stock: number; variantCount: number };

/** User confirmation prevents cross-origin GET links from mutating private state. */
export default function HandoffSelection({ selection, product }: { selection: ShoppingSelection; product: PublicSelectionProduct }) {
  const t = useTranslations("CommerceHandoff");
  const { data: session, status } = useSession();
  const dispatch = useDispatch();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const apply = async () => {
    if (busy || status === "loading") return;
    setBusy(true); setError("");
    try {
      if (selection.action === "cart") {
        if (canUseServerCart(session?.user?.role, status)) {
          await createCartItemOnServer(product.id, selection.quantity, product.variantId);
          const snapshot = await fetchServerCartSnapshot(); writeLocalCart(snapshot.items); dispatch(setCartData(snapshot));
        } else {
          const response = await fetch(`/api/products/${encodeURIComponent(product.id)}`, { cache: "no-store" });
          if (!response.ok) throw new Error(t("unavailable"));
          const payload = await response.json();
          const latest = payload.data;
          const variant = latest?.variants?.find((item: { id: string; isActive: boolean }) => item.id === product.variantId && item.isActive);
          if (!variant || variant.stock < selection.quantity) throw new Error(t("unavailable"));
          const before = readLocalCart();
          const price = latest.discountPrice != null && latest.discountPrice < latest.price ? latest.discountPrice : latest.price;
          const item: CartItem = { id: `local:${variant.id}`, productId: product.id, productCode: product.productCode, slug: product.slug, name: latest.name, image: variant.image ?? latest.image, quantity: selection.quantity, unitPrice: price, originalPrice: latest.price, lineTotal: price * selection.quantity, stock: variant.stock, status: "ACTIVE", variantId: variant.id, variantName: variant.name };
          const after = upsertLocalCartItem(before, item); writeLocalCart(after); trackCartAddition(before, after); dispatch(setCartData({ items: after, summary: computeCartSummary(after) }));
        }
        router.replace("/cart");
      } else {
        let item: WishlistItem;
        if (canUseServerWishlist(session?.user?.role, status)) item = await createWishlistItemOnServer(product.id);
        else item = { id: product.id, productCode: product.productCode, slug: product.slug, name: product.name, image: product.image ?? "", price: product.price, originalPrice: product.originalPrice, brand: product.brand, category: product.category, rating: product.rating, reviewCount: product.reviewCount, inStock: product.stock > 0, variantCount: product.variantCount, addedAt: new Date().toISOString() };
        const after = upsertLocalWishlistItem(readLocalWishlist(), item); writeLocalWishlist(after); dispatch(setWishlistItems(after)); router.replace("/wishlist");
      }
    } catch (cause) { setError(cause instanceof Error ? cause.message : t("failed")); setBusy(false); }
  };
  return <main className="mx-auto min-h-[60vh] max-w-xl space-y-5 px-5 py-14">
    <h1 className="text-2xl font-bold">{selection.action === "cart" ? t("cartTitle") : t("wishlistTitle")}</h1>
    <p>{t("confirm")}</p><p className="font-semibold">{product.name}{product.variantName ? ` · ${product.variantName}` : ""}</p>
    <p>{t("quantity", { quantity: selection.quantity })} · <CurrencyAmount amountBDT={product.price * selection.quantity} /></p>
    <button type="button" disabled={busy || status === "loading"} onClick={() => void apply()} className="rounded-xl bg-brand-red px-6 py-3 font-semibold text-white disabled:opacity-50">{busy ? t("saving") : t("continue")}</button>
    {error && <p role="alert" className="text-red-700">{error}</p>}
  </main>;
}
