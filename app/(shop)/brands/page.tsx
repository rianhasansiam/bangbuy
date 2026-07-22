import type { Metadata } from "next";
import { ArrowRight, Tags } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/seo/site";
import { getPublicBrands } from "@/lib/services/brand.service";

export const revalidate = 1800;

export const metadata: Metadata = buildMetadata({
  title: "Shop by Brand",
  description: `Browse active brands at ${siteConfig.name} and discover their latest available products in one place.`,
  path: "/brands",
  keywords: ["shop by brand", "product brands", "brand directory"],
});

export default async function BrandDirectoryPage() {
  const brands = await getPublicBrands();
  const schemas = [
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Brands", path: "/brands" },
    ]),
    collectionPageJsonLd({
      name: "Product brands",
      description: `Browse active brands available at ${siteConfig.name}.`,
      path: "/brands",
    }),
  ];

  return (
    <main className="min-h-screen bg-brand-light-bg">
      <JsonLd data={schemas} />
      <div className="mx-auto max-w-7xl px-3 py-8 sm:px-4 lg:px-6 lg:py-12">
        <nav aria-label="Breadcrumb" className="mb-5 text-sm text-gray-500">
          <Link href="/" className="hover:text-brand-red">
            Home
          </Link>
          <span aria-hidden className="mx-2">
            /
          </span>
          <span aria-current="page" className="font-medium text-gray-800">
            Brands
          </span>
        </nav>

        <header className="mb-8 max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-red/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-red">
            <Tags className="h-4 w-4" aria-hidden="true" />
            Brand directory
          </div>
          <h1 className="text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
            Shop by brand
          </h1>
          <p className="mt-3 text-sm leading-6 text-gray-600 sm:text-base">
            Explore every active brand and go straight to its currently
            available products.
          </p>
        </header>

        {brands.length === 0 ? (
          <div className="rounded-2xl border border-brand-border bg-white p-10 text-center shadow-sm">
            <p className="font-semibold text-gray-900">
              No brands are available yet.
            </p>
            <Link
              href="/products"
              className="mt-3 inline-flex text-sm font-semibold text-brand-red"
            >
              Browse all products
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {brands.map((brand) => (
              <article
                key={brand.id}
                className="group rounded-2xl border border-brand-border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-red/30 hover:shadow-md"
              >
                <Link href={`/brands/${brand.slug}`} className="block">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-brand-light-bg">
                    {brand.logo ? (
                      <Image
                        src={brand.logo}
                        alt={`${brand.name} logo`}
                        width={64}
                        height={64}
                        className="h-full w-full object-contain p-1.5"
                      />
                    ) : (
                      <span className="text-2xl font-black text-brand-red" aria-hidden>
                        {brand.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-extrabold text-gray-950 group-hover:text-brand-red">
                        {brand.name}
                      </h2>
                      <p className="mt-1 text-xs font-medium text-gray-500">
                        {brand.productCount}{" "}
                        {brand.productCount === 1 ? "product" : "products"}
                      </p>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-brand-red transition group-hover:translate-x-1" />
                  </div>
                  {brand.description && (
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-600">
                      {brand.description}
                    </p>
                  )}
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
