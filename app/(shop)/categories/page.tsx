import type { Metadata } from "next";
import { ArrowRight, FolderTree } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { getActiveCategoryTree, type CategoryDto } from "@/lib/services/category.service";

export const revalidate = 1800;

export const metadata: Metadata = buildMetadata({
  title: "Shop All Categories",
  description:
    "Browse every active department and subcategory, then find the right products by brand, specification, price, and availability.",
  path: "/categories",
  keywords: ["product categories", "shop departments", "online catalog"],
});

function DescendantLinks({ nodes }: { nodes: CategoryDto[] }) {
  if (nodes.length === 0) return null;
  return (
    <ul className="mt-3 space-y-2 border-l border-brand-border pl-3">
      {nodes.map((node) => (
        <li key={node.id}>
          <Link
            href={`/categories/${node.path}`}
            className="group flex items-center justify-between gap-2 text-sm text-gray-700 hover:text-brand-red"
          >
            <span>{node.name}</span>
            <span className="text-xs text-gray-400 group-hover:text-brand-red">
              {node.totalProductCount}
            </span>
          </Link>
          <DescendantLinks nodes={node.children ?? []} />
        </li>
      ))}
    </ul>
  );
}

export default async function CategoryDirectoryPage() {
  const roots = await getActiveCategoryTree();
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Categories", path: "/categories" },
  ]);
  const collection = collectionPageJsonLd({
    name: "Product categories",
    description: "Complete category directory",
    path: "/categories",
  });

  return (
    <main className="min-h-screen bg-brand-light-bg">
      <JsonLd data={[breadcrumb, collection]} />
      <div className="mx-auto max-w-7xl px-3 py-8 sm:px-4 lg:px-6 lg:py-12">
        <nav aria-label="Breadcrumb" className="mb-5 text-sm text-gray-500">
          <Link href="/" className="hover:text-brand-red">Home</Link>
          <span aria-hidden className="mx-2">/</span>
          <span aria-current="page" className="font-medium text-gray-800">
            Categories
          </span>
        </nav>

        <header className="mb-8 max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-red/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-red">
            <FolderTree className="h-4 w-4" />
            Complete directory
          </div>
          <h1 className="text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
            Shop by category
          </h1>
          <p className="mt-3 text-sm leading-6 text-gray-600 sm:text-base">
            Start with a department or follow the hierarchy to a more specific
            collection. Counts include products in every active descendant.
          </p>
        </header>

        {roots.length === 0 ? (
          <div className="rounded-2xl border border-brand-border bg-white p-10 text-center shadow-sm">
            <p className="font-semibold text-gray-900">No categories are available yet.</p>
            <Link href="/products" className="mt-3 inline-flex text-sm font-semibold text-brand-red">
              Browse all products
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {roots.map((root) => (
              <article
                key={root.id}
                className="overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                {root.image ? (
                  <div className="relative aspect-[16/7] overflow-hidden bg-brand-light-bg">
                    <Image
                      src={root.image}
                      alt={`${root.name} category`}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition duration-500 hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[16/7] items-center justify-center bg-gradient-to-br from-brand-red/10 to-brand-light-bg">
                    <FolderTree className="h-10 w-10 text-brand-red/60" />
                  </div>
                )}
                <div className="p-5">
                  <Link
                    href={`/categories/${root.path}`}
                    className="group flex items-start justify-between gap-3"
                  >
                    <div>
                      <h2 className="text-lg font-extrabold text-gray-950 group-hover:text-brand-red">
                        {root.name}
                      </h2>
                      <p className="mt-1 text-xs text-gray-500">
                        {root.totalProductCount} {root.totalProductCount === 1 ? "product" : "products"}
                      </p>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-brand-red transition group-hover:translate-x-1" />
                  </Link>
                  <DescendantLinks nodes={root.children ?? []} />
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
