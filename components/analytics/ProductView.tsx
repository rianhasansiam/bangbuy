import type { CommerceItem } from "@/lib/analytics/ecommerce";

/** Current display descriptor; never a queued event or a prefetch trigger. */
export default function ProductView({ item }: { item: CommerceItem }) {
  const product = { productId: item.productId, productCode: item.productCode ?? null, quantity: 1, unitPrice: item.unitPrice };
  return <span hidden data-tracking-product={JSON.stringify(product)} />;
}
