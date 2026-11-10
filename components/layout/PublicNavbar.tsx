"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Search, ShoppingCart, Heart, User, Menu } from "lucide-react";
import Link from "@/lib/i18n/navigation";
import { DesktopCategoryMenu, MobileCategoryMenu } from "./CategoryNavigation";
import LanguageSelector, { type SelectableLanguage } from "@/components/i18n/LanguageSelector";
import type { PublicCategoryNode } from "@/features/categories/api";

/** Anonymous navigation. Personal badges, profile dropdown and free-text search live in commerce. */
export default function PublicNavbar({ categories, languages }: { categories: PublicCategoryNode[]; languages: SelectableLanguage[] }) {
  const t = useTranslations("Navigation");
  const [open, setOpen] = useState(false);
  return <header data-tracking-public-snapshot={JSON.stringify(categories)} className="sticky top-0 z-40 border-b border-brand-border bg-white">
    <nav aria-label={t("allProducts")} className="relative mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-4">
      <Link href="/" className="me-auto text-3xl font-black tracking-tighter">Bang<span className="text-brand-red">Buy</span></Link>
      <div className="hidden items-center gap-2 xl:flex"><DesktopCategoryMenu categories={categories} active={false} /><Link href="/products" className="rounded-xl px-3 py-2 font-semibold">{t("allProducts")}</Link><Link href="/about" className="rounded-xl px-3 py-2 font-semibold">{t("about")}</Link></div>
      <Link href="/search" aria-label={t("searchProducts")} className="rounded-xl p-3 hover:bg-brand-light-bg"><Search className="h-5 w-5" /></Link>
      <Link href="/profile" aria-label={t("user")} className="rounded-xl p-3 hover:bg-brand-light-bg"><User className="h-5 w-5" /></Link>
      <Link href="/wishlist" aria-label={t("wishlist")} className="rounded-xl p-3 hover:bg-brand-light-bg"><Heart className="h-5 w-5" /></Link>
      <Link href="/cart" aria-label={t("cart")} className="rounded-xl p-3 hover:bg-brand-light-bg"><ShoppingCart className="h-5 w-5" /></Link>
      <LanguageSelector languages={languages} />
      <button type="button" aria-label={t("openMenu")} aria-expanded={open} onClick={() => setOpen(value => !value)} className="rounded-xl p-3 xl:hidden"><Menu className="h-5 w-5" /></button>
      {open && <div className="w-full border-t border-brand-border pt-3 xl:hidden"><LanguageSelector languages={languages} mobile /><MobileCategoryMenu categories={categories} onNavigate={() => setOpen(false)} /><Link href="/products" className="block p-3">{t("allProducts")}</Link><Link href="/contact" className="block p-3">{t("contact")}</Link></div>}
    </nav>
  </header>;
}
