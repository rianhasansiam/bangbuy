"use client";

import { Heart, ShoppingCart, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "@/lib/feedback";
import { LoadingSpinner } from "@/components/ui/loading";

import {
  removeWishlistItem,
  setWishlistError,
  upsertWishlistItem,
} from "@/store/slices/wishlist.slice";
import {
  setCartData,
  setCartError as setCartErrorAction,
} from "@/store/slices/cart.slice";
import type { AppDispatch, RootState } from "@/store";
import {
  canUseServerCart,
  createCartItemOnServer,
  fetchServerCartSnapshot,
} from "@/features/cart/api";
import { computeCartSummary } from "@/features/cart/summary";
import {
  DEFAULT_CART_STOCK,
  readLocalCart,
  upsertLocalCartItem,
  writeLocalCart,
} from "@/features/cart/storage";
import {
  canUseServerWishlist,
  createWishlistItemOnServer,
  removeWishlistItemOnServer,
} from "@/features/wishlist/api";
import {
  readLocalWishlist,
  upsertLocalWishlistItem,
  writeLocalWishlist,
} from "@/features/wishlist/storage";
import type { CartItem } from "@/features/cart/api";
import type { WishlistItem } from "@/features/wishlist/api";

type ProductCardProps = {
  id: string;
  slug?: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating?: number;
  reviewCount?: number;
  badge?: string;
  /**
   * Number of purchasable variants. When > 1, the customer must choose a
   * size/color, so "Add to cart" routes to the product page instead of a
   * blind quick-add. Defaults to 1 (single variant -> direct add).
   */
  variantCount?: number;
};

export default function ProductCard({
  id,
  slug,
  name,
  price,
  originalPrice,
  image,
  rating = 0,
  reviewCount = 0,
  badge,
  variantCount = 1,
}: ProductCardProps) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isBusy, setIsBusy] = useState(false);
  const [isCartBusy, setIsCartBusy] = useState(false);

  const isWishlisted = useSelector((state: RootState) =>
    state.wishlist.items.some((item) => item.id === id),
  );

  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  // Prefer the SEO-friendly slug; fall back to id for callers that
  // haven't been threaded with a slug yet (the route resolves both).
  const productHref = `/products/${slug ?? id}`;

  const handleToggleWishlist = async () => {
    if (isBusy) return;

    const canUseServer = canUseServerWishlist(session?.user?.role, status);
    const localBefore = readLocalWishlist();
    const optimisticItem: WishlistItem = {
      id,
      slug,
      name,
      brand: "PixoHouse",
      image,
      price,
      originalPrice,
      rating,
      reviewCount,
      category: "General",
      inStock: true,
      addedAt: new Date().toISOString(),
      badge,
    };

    dispatch(setWishlistError(null));

    if (isWishlisted) {
      const nextLocal = localBefore.filter((item) => item.id !== id);
      writeLocalWishlist(nextLocal);
      dispatch(removeWishlistItem(id));
      toast.success("Removed from wishlist");

      if (!canUseServer) return;

      setIsBusy(true);
      try {
        await removeWishlistItemOnServer(id);
      } catch (error) {
        writeLocalWishlist(localBefore);
        dispatch(upsertWishlistItem(optimisticItem));
        const message =
          error instanceof Error
            ? error.message
            : "Failed to remove item from wishlist.";
        dispatch(setWishlistError(message));
        toast.error(message);
      } finally {
        setIsBusy(false);
      }
      return;
    }

    const nextLocal = upsertLocalWishlistItem(localBefore, optimisticItem);
    writeLocalWishlist(nextLocal);
    dispatch(upsertWishlistItem(optimisticItem));
    toast.success("Added to wishlist");

    if (!canUseServer) return;

    setIsBusy(true);
    try {
      const savedItem = await createWishlistItemOnServer(id);
      const latestLocal = upsertLocalWishlistItem(readLocalWishlist(), savedItem);
      writeLocalWishlist(latestLocal);
      dispatch(upsertWishlistItem(savedItem));
    } catch (error) {
      writeLocalWishlist(localBefore);
      dispatch(removeWishlistItem(id));
      const message =
        error instanceof Error
          ? error.message
          : "Failed to add item to wishlist.";
      dispatch(setWishlistError(message));
      toast.error(message);
    } finally {
      setIsBusy(false);
    }
  };

  const handleAddToCart = async () => {
    if (isCartBusy) return;

    // Products with multiple size/color variants can't be blindly added —
    // send the customer to the product page to choose a variant.
    if (variantCount > 1) {
      router.push(productHref);
      return;
    }

    const canUseServer = canUseServerCart(session?.user?.role, status);

    dispatch(setCartErrorAction(null));

    if (canUseServer) {
      setIsCartBusy(true);
      try {
        await createCartItemOnServer(id);
        const snapshot = await fetchServerCartSnapshot();
        writeLocalCart(snapshot.items);
        dispatch(setCartData(snapshot));
        toast.success("Added to cart");
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
      id: `local:${id}`,
      productId: id,
      name,
      image,
      quantity: 1,
      unitPrice: price,
      originalPrice: originalPrice ?? price,
      lineTotal: price,
      stock: DEFAULT_CART_STOCK,
      status: "ACTIVE",
    };

    const nextLocal = upsertLocalCartItem(localBefore, optimisticItem);
    writeLocalCart(nextLocal);
    dispatch(setCartData({ items: nextLocal, summary: computeCartSummary(nextLocal) }));
    toast.success("Added to cart");
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border border-brand-border bg-brand-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-brand-border hover:shadow-lg">
      <div className="relative aspect-4/3 overflow-hidden bg-brand-light-bg">
        <Link href={productHref}>
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
          />
        </Link>

        {badge && (
          <span className="absolute left-2 top-2 rounded-full bg-brand-red px-2 py-0.5 text-[10px] font-semibold text-brand-white">
            {badge}
          </span>
        )}

        {discount > 0 && !badge && (
          <span className="absolute left-2 top-2 rounded-full bg-brand-red px-2 py-0.5 text-[10px] font-semibold text-brand-white">
            -{discount}%
          </span>
        )}

        <button
          type="button"
          onClick={() => {
            void handleToggleWishlist();
          }}
          disabled={isBusy}
          aria-busy={isBusy}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={isWishlisted}
          className="absolute right-2 top-2 rounded-full bg-brand-white/90 p-1.5 shadow-sm backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-brand-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isBusy ? (
            <LoadingSpinner decorative size="sm" className="text-brand-red" />
          ) : (
            <Heart
              className={`h-3.5 w-3.5 transition-all duration-300 ${
                isWishlisted
                  ? "scale-110 fill-brand-red text-brand-red"
                  : "text-brand-text-muted hover:text-brand-red"
              }`}
            />
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            void handleAddToCart();
          }}
          disabled={isCartBusy}
          aria-busy={isCartBusy}
          aria-label="Add to cart"
          className="absolute right-2 top-11 flex items-center gap-1.5 rounded-full bg-brand-white/95 p-1.5 text-xs font-semibold text-brand-red opacity-100 shadow-md backdrop-blur-sm transition-all duration-300 hover:bg-brand-red hover:text-brand-white sm:bottom-2 sm:left-1/2 sm:right-auto sm:top-auto sm:-translate-x-1/2 sm:px-3 sm:py-1.5 sm:can-hover:translate-y-2 sm:can-hover:opacity-0 sm:can-hover:group-hover:translate-y-0 sm:can-hover:group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isCartBusy ? (
            <>
              <LoadingSpinner decorative size="sm" />
              <span className="hidden sm:inline">Adding</span>
            </>
          ) : (
            <>
              <ShoppingCart className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Add</span>
            </>
          )}
        </button>
      </div>

      <div className="p-2 sm:p-2.5">
        {rating > 0 && (
          <div className="mb-1 flex items-center gap-0.5">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.round(rating)
                      ? "fill-brand-gold text-brand-gold"
                      : "text-brand-border"
                  }`}
                />
              ))}
            </div>
            <span className="ml-0.5 text-[10px] text-brand-text-muted">({reviewCount})</span>
          </div>
        )}

        <Link href={productHref}>
          <h3 className="line-clamp-1 text-xs font-semibold leading-tight text-foreground transition-colors hover:text-brand-black sm:text-sm">
            {name}
          </h3>
        </Link>

        <div className="mt-1 flex items-center gap-1.5">
          <span className="text-sm font-bold text-brand-red">
            BDT {price.toLocaleString()}
          </span>
          {originalPrice && originalPrice > price && (
            <span className="text-[11px] text-brand-text-muted line-through">
              BDT {originalPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
