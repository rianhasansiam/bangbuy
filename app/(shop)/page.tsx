import type { Metadata } from "next";

import CaroselBanner, {
  type CarouselSlide,
} from "./components/CarouselBanner";
import CategoryScroller from "./components/CategoryScroller";
import Categories from "./components/Categories";
import { getHomeCategories } from "@/lib/services/home-categories.service";
import { getActiveCarouselBanners } from "@/lib/services/banner.service";
import { getActiveCategoryTree } from "@/lib/services/category.service";
import { buildMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/seo/site";

export const revalidate = 600;

export const metadata: Metadata = buildMetadata({
  title: "Shop Industrial Automation, Electronics & More Online",
  description: siteConfig.description,
  path: "/",
  keywords: [
    "online shopping",
    "ecommerce store",
    "shop electronics",
    "fashion online",
    ...siteConfig.keywords,
  ],
});

export default async function Home() {
  const [categories, carouselBanners, categoryTree] = await Promise.all([
    getHomeCategories(),
    getActiveCarouselBanners(),
    getActiveCategoryTree(),
  ]);

  const slides: CarouselSlide[] = carouselBanners.map((banner) => ({
    id: banner.id,
    image: banner.image,
    title: banner.title,
    subtitle: banner.subtitle,
    description: banner.description,
    badge: banner.badge,
    bgType: banner.bgType,
    bgFrom: banner.bgFrom,
    bgVia: banner.bgVia,
    bgTo: banner.bgTo,
    bgColor: banner.bgColor,
    link: banner.link,
  }));

  return (
    <main>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
        <CaroselBanner slides={slides} />
      </div>
      <div className="mx-auto max-w-7xl px-3 pb-8 sm:px-4 lg:px-6">
        <CategoryScroller categories={categoryTree} />
      </div>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 pb-10">
        <Categories initialCategories={categories} />
      </div>
    </main>
  );
}
