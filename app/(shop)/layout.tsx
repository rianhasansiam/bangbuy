import DocumentFrame from "@/components/layout/DocumentFrame";
import PublicProviders from "@/components/layout/PublicProviders";
import PublicNavbar from "@/components/layout/PublicNavbar";
import Footer from "@/components/layout/Footer";
import TopBanner from "@/components/layout/TopBanner";
import JsonLd from "@/components/seo/JsonLd";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/json-ld";
import { getTranslations } from "next-intl/server";
import { getActiveCategoryTree } from "@/lib/services/category.service";
import { parsePublicCategoryNode } from "@/features/categories/api";
import { getRequestCurrencyContext } from "@/lib/currency/request-currency";
import { getPublishedLanguages, getRequestLocale } from "@/lib/i18n/server";
import { rootMetadata, rootViewport } from "@/lib/seo/root-metadata";

export const metadata = rootMetadata;
export const viewport = rootViewport;
export const dynamic = "force-dynamic";

export default async function PublicRoot({ children }: { children: React.ReactNode }) {
  const [categories, currencyContext, languages] = await Promise.all([
    getActiveCategoryTree().then(tree => tree.map(parsePublicCategoryNode)).catch(() => []),
    getRequestCurrencyContext(), getPublishedLanguages(),
  ]);
  const languageChoices = languages.map(({ code, englishName, nativeName, direction }) => ({ code, englishName, nativeName, direction }));
  const [locale, seo] = await Promise.all([getRequestLocale(), getTranslations("Seo")]);
  return <DocumentFrame><PublicProviders currencyContext={currencyContext}>
    <JsonLd data={[organizationJsonLd(seo("siteDescription")), websiteJsonLd(locale, seo("siteDescription"))]} />
    <div><TopBanner /><PublicNavbar categories={categories} languages={languageChoices} />{children}<Footer /></div>
  </PublicProviders></DocumentFrame>;
}
