import SearchBar from "@/components/layout/SearchBar";
import { getTranslations } from "next-intl/server";

export default async function SearchPage() {
  const t = await getTranslations("Navigation");
  return <main className="mx-auto min-h-[60vh] max-w-3xl px-5 py-14"><h1 className="mb-6 text-2xl font-bold">{t("searchProducts")}</h1><SearchBar shouldFocus /></main>;
}
