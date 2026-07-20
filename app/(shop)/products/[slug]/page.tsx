import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  getActiveDealBanners,
  getActivePromoBanners,
} from "@/lib/services/banner.service";
import {
  getActiveProductBySlug,
  getProductSlugById,
  listProducts,
  type ProductWithCategory,
} from "@/lib/services/product.service";
import JsonLd from "@/components/seo/JsonLd";
import { buildMetadata, clampDescription } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, productJsonLd } from "@/lib/seo/json-ld";
import { absoluteUrl, siteConfig } from "@/lib/seo/site";

import Breadcrumbs from "./components/Breadcrumbs";
import DealsCarousel from "./components/DealsCarousel";

import ProductActions from "./components/ProductActions";
import ProductGallery from "./components/ProductGallery";
import ProductInfo from "./components/ProductInfo";
import ProductTabs from "./components/ProductTabs";
import PromoBanners from "./components/PromoBanners";
import RecentProducts from "./components/RecentProducts";
import RelatedProducts from "./components/RelatedProducts";
import ReviewSection from "./components/ReviewSection";

const FALLBACK_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=630&fit=crop";
const PRODUCT_CONDITION = "new";

type Props = {
  params: Promise<{ slug: string }>;
};

type ProductImage = ProductWithCategory["images"][number];
type ProductVariant = ProductWithCategory["variants"][number];

/** Resolve effective customer price (discount when valid) from the product. */
function effectivePrice(product: {
  salePrice: { toNumber(): number };
  discountPrice: { toNumber(): number } | null;
}) {
  const sale = product.salePrice.toNumber();
  const discount = product.discountPrice?.toNumber() ?? null;
  return discount != null && discount < sale ? discount : sale;
}

/** Regular sale price (before discount) from the product. */
function listPrice(product: { salePrice: { toNumber(): number } }) {
  return product.salePrice.toNumber();
}

function discountPercent(price: number, originalPrice: number) {
  if (originalPrice <= 0 || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

function productShortDescription(product: ProductWithCategory, price: number) {
  return clampDescription(
    product.description?.trim() ||
      `Buy ${product.name} in ${product.category.name} at ${siteConfig.name}. Price ${siteConfig.currency} ${price.toLocaleString()}. Secure checkout and fast delivery.`,
  );
}

function productImageUrlsForSeo(
  productImageUrls: string[],
  variantGalleryImages: { url: string }[],
) {
  const images =
    productImageUrls.length > 0
      ? productImageUrls
      : variantGalleryImages.length > 0
        ? variantGalleryImages.map((item) => item.url)
        : [FALLBACK_PRODUCT_IMAGE];

  return Array.from(
    new Set(
      images
        .map((src) => src.trim())
        .filter((src) => src.length > 0)
        .map((src) => absoluteUrl(src)),
    ),
  );
}

function productIsInStock(product: ProductWithCategory) {
  return product.variants.some((variant) => variant.isActive && variant.stock > 0);
}

function productStockCount(product: ProductWithCategory) {
  return product.variants
    .filter((variant) => variant.isActive)
    .reduce((sum, variant) => sum + variant.stock, 0);
}

function variantImageLabel(variant: ProductVariant) {
  const parts = [variant.color, variant.size].filter(
    (value): value is string => typeof value === "string" && value.trim().length > 0,
  );
  return parts.length > 0 ? parts.join(" / ") : variant.sku ?? undefined;
}

function ProductCatalogMetaTags({
  brand,
  category,
  condition,
  availability,
  productCode,
  regularPrice,
  currentPrice,
  hasDiscount,
}: {
  brand: string;
  category: string;
  condition: string;
  availability: string;
  productCode: string;
  regularPrice: number;
  currentPrice: number;
  hasDiscount: boolean;
}) {
  const tags: [string, string][] = [
    ["og:type", "product"],
    ["product:brand", brand],
    ["product:category", category],
    ["product:retailer_item_id", productCode],
    ["product:condition", condition],
    ["product:availability", availability],
    ["product:price:amount", regularPrice.toFixed(2)],
    ["product:price:currency", siteConfig.currency],
    ["og:price:amount", currentPrice.toFixed(2)],
    ["og:price:currency", siteConfig.currency],
  ];

  if (hasDiscount) {
    tags.push(
      ["product:sale_price:amount", currentPrice.toFixed(2)],
      ["product:sale_price:currency", siteConfig.currency],
    );
  }

  return (
    <>
      {tags.map(([property, content]) => (
        <meta key={property} property={property} content={content} />
      ))}
    </>
  );
}

function ProductCrawlerFacts({
  name,
  description,
  category,
  categoryHref,
  productUrl,
  imageUrls,
  regularPrice,
  currentPrice,
  hasDiscount,
  stockCount,
  availabilityLabel,
}: {
  name: string;
  description: string;
  category: string;
  categoryHref: string;
  productUrl: string;
  imageUrls: string[];
  regularPrice: number;
  currentPrice: number;
  hasDiscount: boolean;
  stockCount: number;
  availabilityLabel: string;
}) {
  return (
    <section className="sr-only" aria-label={`${name} product summary`}>
      <h2>{name}</h2>
      <p>{description}</p>
      <p>Brand: {siteConfig.name}</p>
      <p>
        Category: <Link href={categoryHref}>{category}</Link>
      </p>
      <p>
        Current price: {currentPrice.toFixed(2)} {siteConfig.currency}
      </p>
      <p>
        Regular price: {regularPrice.toFixed(2)} {siteConfig.currency}
      </p>
      {hasDiscount && (
        <p>
          Discounted price: {currentPrice.toFixed(2)} {siteConfig.currency}
        </p>
      )}
      <p>Availability: {availabilityLabel}</p>
      <p>Stock available: {stockCount}</p>
      <p>
        Product URL: <a href={productUrl}>{productUrl}</a>
      </p>
      <ul>
        {imageUrls.map((url, index) => (
          <li key={url}>
            Product image {index + 1}: <a href={url}>{url}</a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  // Only ACTIVE products get rich, indexable metadata. Inactive or
  // missing products are marked noindex so they never surface in search.
  const product = await getActiveProductBySlug(slug);

  if (!product) {
    return buildMetadata({
      title: "Product Not Found",
      description: "The requested product could not be found.",
      path: `/products/${slug}`,
      index: false,
    });
  }

  const price = effectivePrice(product);
  const regularPrice = listPrice(product);
  const hasDiscount = price < regularPrice;
  const description = productShortDescription(product, price);
  const canonical = absoluteUrl(`/products/${product.slug}`);
  const imageUrl = absoluteUrl(product.images[0]?.url ?? FALLBACK_PRODUCT_IMAGE);
  const availability = productIsInStock(product) ? "in stock" : "out of stock";
  const title = `${product.name} | ${siteConfig.name}`;

  return {
    title,
    description,
    keywords: [
      product.name,
      product.category.name,
      siteConfig.name,
      "buy online",
      "online shopping",
      siteConfig.currency,
    ],
    alternates: { canonical },
    openGraph: {
      url: canonical,
      siteName: siteConfig.name,
      title,
      description,
      locale: siteConfig.locale,
      images: [
        {
          url: imageUrl,
          secureUrl: imageUrl,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    category: product.category.name,
    other: {
      "product:brand": siteConfig.name,
      "og:type": "product",
      "product:category": product.category.name,
      "product:retailer_item_id": product.productCode,
      "product:condition": PRODUCT_CONDITION,
      "product:availability": availability,
      "product:price:amount": regularPrice.toFixed(2),
      "product:price:currency": siteConfig.currency,
      "og:price:amount": price.toFixed(2),
      "og:price:currency": siteConfig.currency,
      ...(hasDiscount
        ? {
            "product:sale_price:amount": price.toFixed(2),
            "product:sale_price:currency": siteConfig.currency,
          }
        : {}),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export default async function ProductDetailsPage({ params }: Props) {
  const { slug } = await params;
  const product = await getActiveProductBySlug(slug);

  // Backward compatibility: older links (cart, wishlist, orders, shared
  // URLs) reference a product by its cuid id. If the slug lookup misses,
  // try treating the param as an id and 308-redirect to the canonical
  // slug URL so the clean URL becomes the single source of truth.
  if (!product) {
    const canonicalSlug = await getProductSlugById(slug);
    if (canonicalSlug && canonicalSlug !== slug) {
      redirect(`/products/${canonicalSlug}`);
    }
    notFound();
  }

  // Pull a generous batch from the same category so we can split it into
  // recent + related without hitting the DB twice. Banners come from
  // their own cached services so a marketing change shows up here on the
  // next request without a full deploy.
  const [{ items: relatedRows }, dealBanners, promoBanners] = await Promise.all([
    listProducts({
      page: 1,
      pageSize: 24,
      categoryId: product.categoryId,
      status: "ACTIVE",
      sort: "latest",
    }),
    getActiveDealBanners(),
    getActivePromoBanners(),
  ]);

  const others = relatedRows.filter(
    (row: ProductWithCategory) => row.id !== product.id,
  );

  const toCard = (row: (typeof others)[number]) => {
    const cardPrice = effectivePrice(row);
    const cardOriginal = listPrice(row);
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      image: row.images[0]?.url ?? FALLBACK_PRODUCT_IMAGE,
      price: cardPrice,
      originalPrice: cardOriginal,
      discount: discountPercent(cardPrice, cardOriginal),
    };
  };

  const recentProducts = others.slice(0, 6).map(toCard);
  const relatedProducts = others.slice(0, 16).map(toCard);

  const productImageUrls = product.images.map((img: ProductImage) => img.url);

  const variantGalleryImages = product.variants
    .map((variant: ProductVariant) => ({
      variantId: variant.id,
      url: variant.image,
      label: variantImageLabel(variant),
    }))
    .filter(
      (
        item,
      ): item is {
        variantId: string;
        url: string;
        label: string | undefined;
      } => typeof item.url === "string" && item.url.trim().length > 0,
    );
  const currentPrice = effectivePrice(product);
  const regularPrice = listPrice(product);
  const hasDiscount = currentPrice < regularPrice;
  const inStock = productIsInStock(product);
  const stockCount = productStockCount(product);
  const availabilityLabel = inStock ? "in stock" : "out of stock";
  const shortDescription = productShortDescription(product, currentPrice);
  const productUrl = absoluteUrl(`/products/${product.slug}`);
  const seoImageUrls = productImageUrlsForSeo(
    productImageUrls,
    variantGalleryImages,
  );
  const primaryDisplayImage =
    productImageUrls[0] ??
    variantGalleryImages[0]?.url ??
    FALLBACK_PRODUCT_IMAGE;
  const initialVariant =
    product.variants.find((variant: ProductVariant) => variant.stock > 0) ??
    product.variants[0] ??
    null;

  const breadcrumbItems = [
    {
      label: product.category.name,
      href: `/categories/${product.category.slug}`,
    },
    { label: product.name },
  ];

  // Structured data: only emit for publicly visible (ACTIVE) products so
  // crawlers never see schema for hidden/soft-deleted items. We use the
  // first real variant SKU when present, otherwise the public product code.
  const isPublic = product.status === "ACTIVE";
  const primarySku =
    product.variants.find((variant: ProductVariant) => variant.sku)?.sku ??
    product.productCode;
  const productSchema = isPublic
    ? productJsonLd({
        name: product.name,
        description: shortDescription,
        images: seoImageUrls,
        path: `/products/${product.slug}`,
        price: currentPrice,
        inStock,
        category: product.category.name,
        sku: primarySku,
        brand: siteConfig.name,
      })
    : null;
  const breadcrumbSchema = isPublic
    ? breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Products", path: "/products" },
        {
          name: product.category.name,
          path: `/categories/${product.category.slug}`,
        },
        { name: product.name, path: `/products/${product.slug}` },
      ])
    : null;

  return (
    <div className="min-h-screen bg-brand-light-bg">
      {isPublic && (
        <ProductCatalogMetaTags
          brand={siteConfig.name}
          category={product.category.name}
          condition={PRODUCT_CONDITION}
          availability={availabilityLabel}
          productCode={product.productCode}
          regularPrice={regularPrice}
          currentPrice={currentPrice}
          hasDiscount={hasDiscount}
        />
      )}
      {productSchema && breadcrumbSchema && (
        <JsonLd data={[productSchema, breadcrumbSchema]} />
      )}
      <div className="max-w-7xl mx-auto px-3 py-6 sm:px-4 lg:px-6">
        <Breadcrumbs items={breadcrumbItems} />

        <ProductCrawlerFacts
          name={product.name}
          description={shortDescription}
          category={product.category.name}
          categoryHref={`/categories/${product.category.slug}`}
          productUrl={productUrl}
          imageUrls={seoImageUrls}
          regularPrice={regularPrice}
          currentPrice={currentPrice}
          hasDiscount={hasDiscount}
          stockCount={stockCount}
          availabilityLabel={availabilityLabel}
        />

        <nav
          aria-label="Product shopping links"
          className="mt-4 flex flex-wrap gap-2 text-xs font-semibold"
        >
          <Link
            href="/products"
            className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-gray-700 transition hover:border-brand-red hover:text-brand-red"
          >
            Shop All
          </Link>
          <Link
            href="/products?sort=latest"
            className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-gray-700 transition hover:border-brand-red hover:text-brand-red"
          >
            New Arrivals
          </Link>
          <Link
            href={`/categories/${product.category.slug}`}
            className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-gray-700 transition hover:border-brand-red hover:text-brand-red"
          >
            {product.category.name}
          </Link>
          <Link
            href="/contact"
            className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-gray-700 transition hover:border-brand-red hover:text-brand-red"
          >
            Contact Us
          </Link>
        </nav>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-6 lg:col-span-4">
            <ProductGallery
              productId={product.id}
              images={productImageUrls}
              variantImages={variantGalleryImages}
              initialVariantId={
                productImageUrls.length === 0 ? initialVariant?.id ?? null : null
              }
              productName={product.name}
            />
          </div>

          <div className="md:col-span-6 lg:col-span-5">
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100">
              <ProductInfo
                name={product.name}
                specs={[]}
                productCode={product.productCode}
              />

              <ProductActions
                productId={product.id}
                productName={product.name}
                image={primaryDisplayImage}
                salePrice={product.salePrice.toNumber()}
                discountPrice={
                  product.discountPrice != null
                    ? product.discountPrice.toNumber()
                    : null
                }
                variants={product.variants.map((v: ProductVariant) => ({
                  id: v.id,
                  sku: v.sku,
                  color: v.color,
                  size: v.size,
                  stock: v.stock,
                  image: v.image,
                }))}
              />
            </div>
          </div>

          <div className="md:col-span-12 lg:col-span-3">
            <RecentProducts products={recentProducts} title="Recent Product" />
          </div>
        </div>

        {product.description?.trim() && (
          <div className="mt-10">
            <ProductTabs description={product.description} />
          </div>
        )}

        <div className="mt-10">
          <DealsCarousel deals={dealBanners} title="Black Friday Deals" />
        </div>

        <div className="mt-10" id="reviews">
          <ReviewSection productId={product.id} />
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
          <div className="lg:col-span-9">
            <RelatedProducts
              products={relatedProducts}
              title="More Relevant Products"
            />
          </div>

          <div className="lg:col-span-3">
            <PromoBanners banners={promoBanners} />
          </div>
        </div>
      </div>
    </div>
  );
}
