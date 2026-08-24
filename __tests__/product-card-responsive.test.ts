import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ProductCard from "@/components/product/ProductCard";

const mocks = vi.hoisted(() => ({
  dispatch: vi.fn(),
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock("@/lib/auth/use-app-session", () => ({
  useSession: () => ({ data: null, status: "unauthenticated" }),
}));

vi.mock("react-redux", () => ({
  useDispatch: () => mocks.dispatch,
  useSelector: (
    selector: (state: { wishlist: { items: never[] } }) => unknown,
  ) => selector({ wishlist: { items: [] } }),
}));

function renderCard(variantCount = 1): string {
  return renderToStaticMarkup(
    createElement(ProductCard, {
      id: "product-1",
      slug: "test-product",
      name: "Test product with a useful descriptive name",
      price: 5_000,
      originalPrice: 5_500,
      image: "/test-product.jpg",
      rating: 4.5,
      reviewCount: 12,
      badge: "Popular",
      variantCount,
    }),
  );
}

function buttonTags(markup: string, ariaLabel: string): string[] {
  return (markup.match(/<button\b[^>]*>/g) ?? []).filter((tag) =>
    tag.includes(`aria-label="${ariaLabel}"`),
  );
}

beforeEach(() => {
  mocks.dispatch.mockReset();
  mocks.push.mockReset();
});

describe("ProductCard responsive actions", () => {
  it("keeps mobile cart and wishlist actions below the product image", () => {
    const markup = renderCard();
    const cartButtons = buttonTags(markup, "Add to cart");
    const wishlistButtons = buttonTags(markup, "Add to wishlist");

    expect(cartButtons).toHaveLength(2);
    expect(wishlistButtons).toHaveLength(2);

    const desktopCartButton = cartButtons.find((tag) => tag.includes("absolute"));
    const desktopWishlistButton = wishlistButtons.find((tag) =>
      tag.includes("absolute"),
    );

    expect(desktopCartButton).toContain("hidden");
    expect(desktopCartButton).toContain("sm:can-hover:flex");
    expect(desktopCartButton).toContain(
      "sm:can-hover:focus-visible:opacity-100",
    );
    expect(desktopCartButton).toContain(
      "sm:can-hover:focus-visible:translate-y-0",
    );
    expect(desktopWishlistButton).toContain("hidden");
    expect(desktopWishlistButton).toContain("sm:can-hover:flex");

    expect(markup).toContain(
      "border-brand-border/70 pt-2 sm:can-hover:hidden",
    );
    expect(
      cartButtons.some(
        (tag) =>
          !tag.includes("absolute") &&
          tag.includes("h-10") &&
          tag.includes("max-w-24") &&
          tag.includes("text-[11px]"),
      ),
    ).toBe(true);
    expect(
      wishlistButtons.some(
        (tag) =>
          !tag.includes("absolute") &&
          tag.includes("h-11") &&
          tag.includes("w-11"),
      ),
    ).toBe(true);
  });

  it("uses the option-selection action for multi-variant products", () => {
    const markup = renderCard(2);
    const optionButtons = buttonTags(markup, "Select product options");

    expect(optionButtons).toHaveLength(2);
    expect(markup).toContain("Options");
    expect(markup).not.toContain('aria-label="Add to cart"');
  });
});
