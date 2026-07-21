"use client";

import { useEffect } from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";

import ProductCard from "@/components/product/ProductCard";
import { setHomeCategories } from "@/store/slices/home-categories.slice";
import type { AppDispatch, RootState } from "@/store";
import type { HomeCategory } from "@/lib/services/home-categories.service";

import { CategoriesBanner } from "./CategoriesBanner";

type CategoriesProps = {
  initialCategories: HomeCategory[];
};

export default function Categories({ initialCategories }: CategoriesProps) {
  const dispatch = useDispatch<AppDispatch>();
  const categoriesFromStore = useSelector(
    (state: RootState) => state.homeCategories.items,
  );

  useEffect(() => {
    dispatch(setHomeCategories(initialCategories));
  }, [dispatch, initialCategories]);

  const categories =
    categoriesFromStore.length > 0 ? categoriesFromStore : initialCategories;

  if (categories.length === 0) {
    return (
      <div className="rounded-2xl border border-brand-border bg-brand-white p-6 text-center text-sm text-brand-text-muted shadow-sm">
        No categories available right now.
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {categories.map((category, index) => (
        <section key={category.id} className="relative">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div>
                <h2 className="text-lg font-bold text-foreground sm:text-xl">
                  <Link
                    href={`/categories/${category.path}`}
                    className="transition-colors hover:text-brand-red"
                  >
                    {category.name}
                  </Link>
                </h2>
                <p className="hidden text-xs text-brand-text-muted sm:block">
                  {category.totalProductCount} products across this department
                </p>
              </div>
            </div>

            <Link
              href={`/categories/${category.path}`}
              className="group flex items-center gap-1 text-sm font-semibold text-brand-red transition-colors hover:text-brand-red-hover"
            >
              View All
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="mb-4 h-0.5 rounded-full bg-brand-border" />

          {category.children.length > 0 && (
            <nav
              aria-label={`${category.name} subcategories`}
              className="mb-4 flex flex-wrap gap-2"
            >
              {category.children.map((child) => (
                <Link
                  key={child.id}
                  href={`/categories/${child.path}`}
                  className="rounded-full border border-brand-border bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-brand-red/40 hover:text-brand-red"
                >
                  {child.name}
                  <span className="ml-1 text-gray-400">
                    ({child.totalProductCount})
                  </span>
                </Link>
              ))}
            </nav>
          )}

          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
              {category.products.map((item) => (
                <ProductCard
                  key={item.id}
                  id={item.id}
                  slug={item.slug}
                  name={item.name}
                  price={item.discountPrice ?? item.price}
                  originalPrice={
                    item.discountPrice != null ? item.price : undefined
                  }
                  image={item.image}
                  rating={item.rating}
                  reviewCount={item.reviewCount}
                  badge={item.badge ?? undefined}
                  variantCount={item.variantCount}
                />
              ))}
            </div>

            {category.categoryBanner && (
              <CategoriesBanner
                saleBanner={{
                  image: category.categoryBanner.image,
                  label: category.categoryBanner.label,
                  heading: category.categoryBanner.heading,
                  discount: category.categoryBanner.discount,
                  description: category.categoryBanner.description,
                  link:
                    category.categoryBanner.link ??
                    `/categories/${category.path}`,
                }}
              />
            )}
          </div>

          <div className="mt-5 text-center">
            <Link
              href={`/categories/${category.path}`}
              className="inline-block rounded-full bg-brand-red px-6 py-2.5 text-sm font-semibold text-brand-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-red-hover hover:shadow-lg"
            >
              View all {category.totalProductCount} products
            </Link>
          </div>

          {index < categories.length - 1 && (
            <div className="mt-8 border-b border-brand-border" />
          )}
        </section>
      ))}
    </div>
  );
}
