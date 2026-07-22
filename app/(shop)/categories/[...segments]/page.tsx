import type { Metadata } from "next";
import { ArrowRight, Boxes } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";

import ProductCard from "@/components/product/ProductCard";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/seo/json-ld";
import {
  categoryFallbackDescription,
  categoryFallbackTitle,
} from "@/lib/seo/catalog-metadata";
import { buildMetadata, noIndexMetadata } from "@/lib/seo/metadata";
import {
  getActiveCategoryByPath,
  getActiveCategoryTree,
  getCategoryRedirectByPath,
  normalizeCategoryPath,
  type CategoryDto,
  type PublicCategoryProduct,
} from "@/lib/services/category.service";

export const revalidate = 1800;
export const dynamicParams = true;

type Props = {
  params: Promise<{ segments: string[] }>;
};

const FALLBACK_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400";
const CATEGORY_STATIC_PARAM_LIMIT = 100;

const getCategoryPageData = cache(getActiveCategoryByPath);

function pathFromSegments(segments: string[]): string {
  return normalizeCategoryPath(segments.join("/"));
}

function collectCategoryParams(
  categories: CategoryDto[],
): { segments: string[]; productCount: number }[] {
  return categories.flatMap((category) => [
    {
      segments: category.path.split("/").filter(Boolean),
      productCount: category.totalProductCount,
    },
    ...collectCategoryParams(category.children ?? []),
  ]);
}

export async function generateStaticParams() {
  return collectCategoryParams(await getActiveCategoryTree())
    .sort((left, right) => right.productCount - left.productCount)
    .slice(0, CATEGORY_STATIC_PARAM_LIMIT)
    .map(({ segments }) => ({ segments }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { segments } = await params;
  const rawRequestedPath = segments.join("/");
  const requestedPath = pathFromSegments(segments);
  const category = await getCategoryPageData(requestedPath);

  if (!category) {
    const redirectRecord = await getCategoryRedirectByPath(requestedPath);
    if (redirectRecord) permanentRedirect(redirectRecord.destinationPath);
    return noIndexMetadata(
      "Category unavailable",
      "This category is unavailable or no longer published.",
    );
  }
  if (rawRequestedPath !== category.path) {
    permanentRedirect(`/categories/${category.path}`);
  }

  const description =
    category.metaDescription?.trim() ||
    categoryFallbackDescription({
      name: category.name,
      path: category.path,
      breadcrumb: category.breadcrumb,
      description: category.description,
      totalProductCount: category.totalProductCount,
    });

  return buildMetadata({
    title:
      category.seoTitle?.trim() ||
      categoryFallbackTitle({
        name: category.name,
        path: category.path,
        breadcrumb: category.breadcrumb,
      }),
    description,
    path: `/categories/${category.path}`,
    image: category.ogImage?.trim() || category.image,
    keywords: [category.name, ...category.breadcrumb.map((item) => item.name)],
  });
}

export default async function CategoryPage({ params }: Props) {
  const { segments } = await params;
  const rawRequestedPath = segments.join("/");
  const requestedPath = pathFromSegments(segments);
  const category = await getCategoryPageData(requestedPath);
  if (!category) {
    const redirectRecord = await getCategoryRedirectByPath(requestedPath);
    if (redirectRecord) permanentRedirect(redirectRecord.destinationPath);
    notFound();
  }
  if (rawRequestedPath !== category.path) {
    permanentRedirect(`/categories/${category.path}`);
  }

  const categoryPath = `/categories/${category.path}`;
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Categories", path: "/categories" },
    ...category.breadcrumb.map((item) => ({
      name: item.name,
      path: `/categories/${item.path}`,
    })),
    { name: category.name, path: categoryPath },
  ];

  return (
    <main className="min-h-screen bg-brand-light-bg">
      <JsonLd
        data={[
          collectionPageJsonLd({
            name: category.name,
            description: category.description,
            path: categoryPath,
          }),
          breadcrumbJsonLd(crumbs),
        ]}
      />

      <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
        <nav aria-label="Breadcrumb" className="mb-5 text-sm text-gray-500">
          <ol className="flex flex-wrap items-center gap-1.5">
            {crumbs.map((crumb, index) => {
              const current = index === crumbs.length - 1;
              return (
                <li key={crumb.path} className="flex items-center gap-1.5">
                  {index > 0 && <span aria-hidden>/</span>}
                  {current ? (
                    <span
                      aria-current="page"
                      className="font-medium text-gray-800"
                    >
                      {crumb.name}
                    </span>
                  ) : (
                    <Link href={crumb.path} className="hover:text-brand-red">
                      {crumb.name}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        <header className="mb-7 overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm">
          <div className="flex min-h-44 flex-col justify-center gap-5 p-6 sm:flex-row sm:items-center sm:justify-between lg:p-8">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-red">
                Category collection
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
                {category.name}
              </h1>
              {category.description && (
                <p className="mt-3 text-sm leading-6 text-gray-600 sm:text-base">
                  {category.description}
                </p>
              )}
              <p className="mt-3 text-sm font-semibold text-gray-700">
                {category.totalProductCount}{" "}
                {category.totalProductCount === 1 ? "product" : "products"}
                {category.childCount > 0
                  ? ` across ${category.childCount} immediate subcategories`
                  : ""}
              </p>
            </div>
            {category.image ? (
              <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-xl bg-brand-light-bg sm:w-56">
                <Image
                  src={category.image}
                  alt={`${category.name} category`}
                  fill
                  sizes="(min-width: 640px) 224px, calc(100vw - 4.5rem)"
                  preload
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-brand-red/10">
                <Boxes className="h-10 w-10 text-brand-red" />
              </div>
            )}
          </div>
        </header>

        {category.children.length > 0 && (
          <section aria-labelledby="subcategory-heading" className="mb-9">
            <div className="mb-4 flex items-center justify-between">
              <h2
                id="subcategory-heading"
                className="text-xl font-extrabold text-gray-950"
              >
                Explore {category.name}
              </h2>
              <Link
                href={`/products?categoryPath=${encodeURIComponent(category.path)}`}
                className="text-sm font-semibold text-brand-red hover:text-brand-red-hover"
              >
                Filter all products
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {category.children.map((child) => (
                <Link
                  key={child.id}
                  href={`/categories/${child.path}`}
                  className="group flex items-center justify-between gap-3 rounded-xl border border-brand-border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-red/30 hover:shadow-md"
                >
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-brand-red">
                      {child.name}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">
                      {child.totalProductCount}{" "}
                      {child.totalProductCount === 1 ? "product" : "products"}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-brand-red transition group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {category.products.length === 0 ? (
          <div className="rounded-2xl border border-brand-border bg-white p-10 text-center shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">No products yet</h2>
            <p className="mt-2 text-sm text-gray-600">
              There are no visible products in this category or its
              subcategories right now.
            </p>
            <Link
              href="/products"
              className="mt-5 inline-flex rounded-full bg-brand-red px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-red-hover"
            >
              Browse all products
            </Link>
          </div>
        ) : (
          <section aria-labelledby="category-products-heading">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <h2
                  id="category-products-heading"
                  className="text-xl font-extrabold text-gray-950"
                >
                  Products in {category.name}
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Includes active descendant categories.
                </p>
              </div>
              <Link
                href={`/products?categoryPath=${encodeURIComponent(category.path)}`}
                className="shrink-0 text-sm font-semibold text-brand-red"
              >
                View with filters
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
              {category.products.map((product: PublicCategoryProduct) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  slug={product.slug}
                  name={product.name}
                  price={product.discountPrice ?? product.price}
                  originalPrice={
                    product.discountPrice !== null ? product.price : undefined
                  }
                  image={product.image ?? FALLBACK_PRODUCT_IMAGE}
                  variantCount={product.variantCount}
                  rating={product.rating}
                  reviewCount={product.reviewCount}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
