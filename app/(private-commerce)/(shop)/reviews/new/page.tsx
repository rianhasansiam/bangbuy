import { notFound } from "next/navigation";
import LocaleSection from "@/components/i18n/LocaleSection";
import ReviewSection from "@/app/(shop)/products/[slug]/components/ReviewSection";

export default async function WriteReview({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { productId } = await searchParams;
  if (typeof productId !== "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(productId)) notFound();
  return <LocaleSection pathname="/products"><main className="mx-auto min-h-[60vh] max-w-4xl px-5 py-10"><ReviewSection productId={productId} initialShowForm /></main></LocaleSection>;
}
