import { notFound } from "next/navigation";
import { shoppingSelectionSchema } from "@/lib/security/shopping-handoff";
import { getActiveProductById, serializeProduct } from "@/lib/services/product.service";
import HandoffSelection from "./selection";

export const dynamic = "force-dynamic";

export default async function ShoppingHandoff({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const parsed = shoppingSelectionSchema.safeParse(await searchParams);
  if (!parsed.success || parsed.data.action === "buy") notFound();
  const product = await getActiveProductById(parsed.data.productId);
  if (!product) notFound();
  const serialized = serializeProduct(product);
  const variants = serialized.variants.filter(variant => variant.isActive);
  const variant = parsed.data.variantId ? variants.find(item => item.id === parsed.data.variantId) : variants.length === 1 ? variants[0] : null;
  if (parsed.data.action === "cart" && (!variant || variant.stock < parsed.data.quantity)) notFound();
  return <HandoffSelection selection={parsed.data} product={{
    id: serialized.id, productCode: serialized.productCode, slug: serialized.slug, name: serialized.name,
    image: variant?.image ?? serialized.image, price: serialized.discountPrice ?? serialized.price, originalPrice: serialized.price,
    brand: serialized.brand?.name ?? "BangBuy", category: serialized.category.name, rating: serialized.rating, reviewCount: serialized.reviewCount,
    variantId: variant?.id ?? null, variantName: variant?.name ?? null, stock: variant?.stock ?? serialized.stock, variantCount: variants.length,
  }} />;
}
