"use client";

import NextLink from "next/link";
import { usePathname as useNextPathname, useRouter as useNextRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { forwardRef, useCallback, useMemo, type ComponentProps } from "react";
import { localizeHref, stripLocalePrefix } from "./paths";
import { getBrowserSurfaceOrigins, needsDocumentNavigation, surfaceHref } from "@/lib/security/surfaces";
import { useSurface } from "@/components/layout/SurfaceContext";

type LinkProps = ComponentProps<typeof NextLink>;
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function LocaleLink({ href, ...props }, ref) {
  const locale = useLocale();
  const surface = useSurface();
  const origins = getBrowserSurfaceOrigins();
  const text = typeof href === "string" ? href : `${href.pathname ?? "/"}${href.search ?? (href.query ? `?${new URLSearchParams(Object.entries(href.query).flatMap(([key, value]) => Array.isArray(value) ? value.map(entry => [key, String(entry)]) : value == null ? [] : [[key, String(value)]]))}` : "")}${href.hash ?? ""}`;
  const localized = surfaceHref(localizeHref(text, locale), origins);
  const targetPath = text.split(/[?#]/, 1)[0];
  const hard = surface === "public" || !text.startsWith("/") || targetPath === "/" || /^\/(?:products|categories|brands|about|privacy-policy|return-policy|terms-and-conditions)(?:\/|$)/.test(stripLocalePrefix(targetPath));
  if (hard || (origins.separated && localized.startsWith("http"))) {
    const { prefetch: _prefetch, replace: _replace, scroll: _scroll, shallow: _shallow, locale: _locale, onNavigate: _onNavigate, ...anchorProps } = props;
    void _prefetch; void _replace; void _scroll; void _shallow; void _locale; void _onNavigate;
    return <a ref={ref} href={localized} {...anchorProps} />;
  }
  return <NextLink ref={ref} href={localized} {...props} />;
});
export default Link;

/** Existing active-menu and route checks keep using the original page pathname. */
export function usePathname(): string {
  return stripLocalePrefix(useNextPathname() ?? "/");
}

export function useRouter() {
  const router = useNextRouter();
  const locale = useLocale();
  const resolve = useCallback((href: string) => surfaceHref(localizeHref(href, locale), getBrowserSurfaceOrigins()), [locale]);
  return useMemo(() => ({
    ...router,
    push: (href: string, options?: Parameters<typeof router.push>[1]) => { const target = resolve(href); if (typeof window !== "undefined" && needsDocumentNavigation(window.location.href, target, getBrowserSurfaceOrigins())) window.location.assign(target); else router.push(target, options); },
    replace: (href: string, options?: Parameters<typeof router.replace>[1]) => { const target = resolve(href); if (typeof window !== "undefined" && needsDocumentNavigation(window.location.href, target, getBrowserSurfaceOrigins())) window.location.replace(target); else router.replace(target, options); },
    prefetch: (href: string, options?: Parameters<typeof router.prefetch>[1]) => { const target = resolve(href); if (typeof window === "undefined" || !needsDocumentNavigation(window.location.href, target, getBrowserSurfaceOrigins())) router.prefetch(target, options); },
  }), [router, resolve]);
}
