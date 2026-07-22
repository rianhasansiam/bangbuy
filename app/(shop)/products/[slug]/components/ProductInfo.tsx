import { Building2, Factory, Star } from "lucide-react";
import Link from "next/link";

type CatalogEntity = {
  name: string;
  slug: string;
  status: "ACTIVE" | "INACTIVE";
};

type ProductInfoProps = {
  name: string;
  productCode?: string | null;
  modelNumber?: string | null;
  gtin?: string | null;
  condition: string;
  series?: string | null;
  brand?: CatalogEntity | null;
  manufacturer?: CatalogEntity | null;
  rating: number;
  reviewCount: number;
};

const ProductInfo = ({
  name,
  productCode,
  modelNumber,
  gtin,
  condition,
  series,
  brand,
  manufacturer,
  rating,
  reviewCount,
}: ProductInfoProps) => {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold leading-tight text-gray-900 md:text-2xl">
          {name}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
          {productCode && (
            <span className="font-mono">Product code: {productCode}</span>
          )}
          {reviewCount > 0 && (
            <a
              href="#reviews"
              className="inline-flex items-center gap-1 font-medium text-gray-700 hover:text-brand-red"
              aria-label={`${rating.toFixed(1)} out of 5 from ${reviewCount} reviews`}
            >
              <Star
                className="h-3.5 w-3.5 fill-brand-gold text-brand-gold"
                aria-hidden="true"
              />
              {rating.toFixed(1)} ({reviewCount.toLocaleString()})
            </a>
          )}
        </div>
      </div>

      {(brand ||
        manufacturer ||
        modelNumber ||
        gtin ||
        series ||
        condition) && (
        <dl className="grid gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm sm:grid-cols-2">
          {brand && (
            <div className="min-w-0">
              <dt className="flex items-center gap-2.5 text-xs text-gray-500">
                <Building2
                  className="h-4 w-4 shrink-0 text-brand-red"
                  aria-hidden="true"
                />
                Brand
              </dt>
              <dd className="min-w-0 truncate pl-6 font-semibold text-gray-900">
                {brand.status === "ACTIVE" ? (
                  <Link
                    href={`/brands/${encodeURIComponent(brand.slug)}`}
                    className="hover:text-brand-red"
                  >
                    {brand.name}
                  </Link>
                ) : (
                  brand.name
                )}
              </dd>
            </div>
          )}
          {manufacturer && (
            <div className="min-w-0">
              <dt className="flex items-center gap-2.5 text-xs text-gray-500">
                <Factory
                  className="h-4 w-4 shrink-0 text-brand-red"
                  aria-hidden="true"
                />
                Manufacturer
              </dt>
              <dd className="min-w-0 truncate pl-6 font-semibold text-gray-900">
                {manufacturer.status === "ACTIVE" ? (
                  <Link
                    href={`/products?manufacturerSlug=${encodeURIComponent(manufacturer.slug)}`}
                    className="hover:text-brand-red"
                  >
                    {manufacturer.name}
                  </Link>
                ) : (
                  manufacturer.name
                )}
              </dd>
            </div>
          )}
          {modelNumber && (
            <div>
              <dt className="text-xs text-gray-500">Model number</dt>
              <dd className="font-semibold text-gray-900">{modelNumber}</dd>
            </div>
          )}
          {series && (
            <div>
              <dt className="text-xs text-gray-500">Series</dt>
              <dd className="font-semibold text-gray-900">{series}</dd>
            </div>
          )}
          {gtin && (
            <div>
              <dt className="text-xs text-gray-500">GTIN</dt>
              <dd className="font-mono font-semibold text-gray-900">{gtin}</dd>
            </div>
          )}
          <div>
            <dt className="text-xs text-gray-500">Condition</dt>
            <dd className="font-semibold capitalize text-gray-900">
              {condition}
            </dd>
          </div>
        </dl>
      )}
    </div>
  );
};

export default ProductInfo;
