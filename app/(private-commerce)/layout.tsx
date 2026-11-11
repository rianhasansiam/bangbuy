import DocumentFrame from "@/components/layout/DocumentFrame";
import Providers from "@/app/providers";
import SiteChrome from "@/components/layout/SiteChrome";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TopBanner from "@/components/layout/TopBanner";
import MarketingConsentControls from "@/components/analytics/MarketingConsentControls";
import { getActiveCategoryTree } from "@/lib/services/category.service";
import { parsePublicCategoryNode } from "@/features/categories/api";
import { getRequestCurrencyContext } from "@/lib/currency/request-currency";
import { getPublishedLanguages } from "@/lib/i18n/server";
import { rootMetadata, rootViewport } from "@/lib/seo/root-metadata";

export const metadata = { ...rootMetadata, alternates: { canonical: null }, openGraph: null, twitter: null, robots: { index: false, follow: false } };
export const viewport = rootViewport;
export const dynamic = "force-dynamic";

export default async function PrivateRoot({ children }: { children: React.ReactNode }) {
  const [categories, currencyContext, languages] = await Promise.all([
    getActiveCategoryTree().then(tree => tree.map(parsePublicCategoryNode)).catch(() => []), getRequestCurrencyContext(), getPublishedLanguages(),
  ]);
  const languageChoices = languages.map(({ code, englishName, nativeName, direction }) => ({ code, englishName, nativeName, direction }));
  return <DocumentFrame><Providers initialCurrencyContext={currencyContext}>
    <SiteChrome banner={<TopBanner />} navbar={<Navbar categories={categories} languages={languageChoices} />} footer={<Footer />}>{children}</SiteChrome>{process.env.META_TRACKING_MODE !== "server-only" && <MarketingConsentControls />}
  </Providers></DocumentFrame>;
}
