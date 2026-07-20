import type { Metadata } from "next";

import CaroselBanner, {
  type CarouselSlide,
} from "./components/CarouselBanner";
import Categories from "./components/Categories";
import { getHomeCategories } from "@/lib/services/home-categories.service";
import { getActiveCarouselBanners } from "@/lib/services/banner.service";
import { buildMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/seo/site";

export const metadata: Metadata = buildMetadata({
  title: `${siteConfig.name} - Online Shopping for Electronics, Fashion & More`,
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
  const [categories, carouselBanners] = await Promise.all([
    getHomeCategories(),
    getActiveCarouselBanners(),
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
    <>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
        <CaroselBanner slides={slides} />
      </div>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 pb-10">
        <Categories initialCategories={categories} />
      </div>
    </>
  );
}
