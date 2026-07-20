"use client";

import {
  Menu,
  User,
  ShoppingCart,
  Heart,
  Phone,
  Shield,
  Store,
  Info,
  LogIn,
  UserPlus,
  LogOut,
  Package,
  ChevronDown,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useSelector } from "react-redux";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import SearchBar from "@/components/layout/SearchBar";
import { confirm } from "@/lib/feedback";
import { siteConfig } from "@/lib/seo/site";
import type { RootState } from "@/store";

type MenuItem = {
  href: string;
  label: string;
  icon: typeof Store;
  adminOnly?: boolean;
};

const MENU_ITEMS: readonly MenuItem[] = [
  { href: "/products", label: "All Products", icon: Store },
  { href: "/about", label: "About", icon: Info },
  { href: "/contact", label: "Contact", icon: Phone },
  { href: "/admin", label: "Admin", icon: Shield, adminOnly: true },
] as const;

/** Grace period (ms) so the cursor can travel from trigger to dropdown content. */
const HOVER_CLOSE_DELAY_MS = 120;

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user ?? null;
  const isAdmin = user?.role === "ADMIN";

  // Badge counts from Redux store
  const cartCount = useSelector((state: RootState) =>
    state.cart.items.reduce((sum, item) => sum + item.quantity, 0),
  );
  const wishlistCount = useSelector(
    (state: RootState) => state.wishlist.items.length,
  );

  const visibleMenuItems = MENU_ITEMS.filter(
    (item) => !item.adminOnly || isAdmin,
  );

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement | null>(null);
  const mobileMenuPanelRef = useRef<HTMLElement | null>(null);
  const mobileMenuCloseRef = useRef<HTMLButtonElement | null>(null);
  const mobileSearchRef = useRef<HTMLDivElement | null>(null);
  const mobileSearchButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    document.body.style.overflow = "hidden";

    const focusFrame = requestAnimationFrame(() => {
      mobileMenuCloseRef.current?.focus({ preventScroll: true });
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
        mobileMenuButtonRef.current?.focus({ preventScroll: true });
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = mobileMenuPanelRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const handleDesktopChange = (event: MediaQueryListEvent) => {
      if (event.matches) setMobileMenuOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    desktopQuery.addEventListener("change", handleDesktopChange);

    return () => {
      cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      desktopQuery.removeEventListener("change", handleDesktopChange);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mobileSearchOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !mobileSearchRef.current?.contains(target) &&
        !mobileSearchButtonRef.current?.contains(target)
      ) {
        setMobileSearchOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileSearchOpen(false);
        mobileSearchButtonRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileSearchOpen]);

  const cancelClose = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimerRef.current = setTimeout(() => {
      setProfileMenuOpen(false);
      closeTimerRef.current = null;
    }, HOVER_CLOSE_DELAY_MS);
  };

  const openProfileMenu = () => {
    cancelClose();
    setProfileMenuOpen(true);
  };

  const handleLogout = async () => {
    const ok = await confirm({
      title: "Sign out?",
      description: "You'll need to sign in again to access your account.",
      confirmLabel: "Sign out",
      cancelLabel: "Stay",
      variant: "warning",
    });
    if (!ok) return;
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);
    void signOut({ callbackUrl: "/" });
  };

  return (
    <header className="sticky top-0 z-50 bg-brand-light-bg px-1 py-2 sm:px-4 lg:border-b lg:border-brand-border lg:px-0 lg:py-0">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 rounded-md border border-brand-border bg-brand-white py-2.5 shadow-sm sm:px-4 lg:rounded-none lg:border-none lg:bg-transparent lg:py-3 lg:shadow-none lg:px-6">
        {/* LEFT: Mobile Menu + Brand */}
        <div className="flex items-center gap-2">
          <button
            ref={mobileMenuButtonRef}
            type="button"
            onClick={() => {
              setMobileSearchOpen(false);
              setMobileMenuOpen(true);
            }}
            aria-label="Open menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-drawer"
            className="rounded-full p-2 text-brand-black transition-colors duration-200 hover:bg-brand-white/40 hover:text-brand-red lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>

          <Link
            href="/"
            aria-label={`${siteConfig.name} home`}
            className="group flex shrink-0 items-center rounded-xl px-1 py-1.5 transition-transform duration-300 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2"
          >
            {/* Logo retained for future use.
            <div className="w-[4.35rem] overflow-hidden rounded-lg bg-brand-black shadow-sm ring-1 ring-brand-black/10 transition-shadow duration-300 group-hover:shadow-md sm:w-[4.9rem]">
              <Image
                src="/logo/NavbarLogo1.png"
                alt=""
                width={2653}
                height={1240}
                sizes="(min-width: 640px) 70px, 68px"
                loading="eager"
                className=" h-auto w-full"
              />
            </div>
            */}

            <div
              aria-hidden="true"
              className="flex select-none flex-col"
            >
              <span className="whitespace-nowrap text-xl font-black leading-none tracking-[-0.055em] text-brand-black sm:text-2xl">
                Pixo<span className="text-brand-red">House</span>
              </span>
              <span className="mt-1 whitespace-nowrap text-[0.46rem] font-bold uppercase leading-none tracking-[0.15em] text-brand-text-muted transition-colors duration-300 group-hover:text-brand-black sm:text-[0.5rem] sm:tracking-[0.18em]">
                Smart Finds, Great Deals
              </span>
            </div>
          </Link>
        </div>

        {/* DESKTOP MENU */}
        <nav className="hidden items-center gap-2 lg:flex">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red focus-visible:text-brand-red",
                  active
                    ? "text-brand-red"
                    : "text-brand-black hover:text-brand-red",
                )}
              >
                <Icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                {item.label}
                <span
                  className={cn(
                    "absolute bottom-0 left-1/2 h-0.5 w-[60%] -translate-x-1/2 rounded-full bg-brand-red transition-all duration-200 ease-out",
                    active
                      ? "scale-x-100 opacity-100"
                      : "scale-x-0 opacity-0",
                  )}
                />
              </Link>
            );
          })}
        </nav>

        {/* DESKTOP SEARCH */}
        <SearchBar className="mx-4 hidden max-w-lg flex-1 md:block" />

        {/* RIGHT ICONS */}
        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <button
            ref={mobileSearchButtonRef}
            type="button"
            aria-label={mobileSearchOpen ? "Close product search" : "Search products"}
            aria-expanded={mobileSearchOpen}
            aria-controls="mobile-navbar-search"
            onClick={() => setMobileSearchOpen((open) => !open)}
            className="rounded-full p-2 text-brand-black transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-light-bg hover:text-brand-red md:hidden"
          >
            {mobileSearchOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Search className="h-5 w-5" />
            )}
          </button>

          {!user && (
            <Link
              href="/login"
              className="flex items-center gap-1 px-2 py-1.5 text-sm font-semibold text-brand-black transition-colors duration-200 hover:text-brand-red lg:hidden"
            >
              <span className="hidden sm:inline">Sign in</span>
              <User className="h-5 w-5" />
            </Link>
          )}

          {user && (
            <Link
              href="/profile"
              className="rounded-full p-2 transition-colors duration-200 hover:bg-brand-white/40 lg:hidden"
              aria-label="My profile"
            >
              <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full border-2 border-brand-border bg-brand-light-bg">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || "User"}
                    width={24}
                    height={24}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-3.5 w-3.5 text-brand-black" />
                )}
              </div>
            </Link>
          )}

          <Link
            href="/wishlist"
            aria-label={`Wishlist${wishlistCount > 0 ? `, ${wishlistCount} item${wishlistCount === 1 ? "" : "s"}` : ""}`}
            className="group relative rounded-full p-2 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-white/40"
          >
            <Heart className="h-5 w-5 text-brand-black transition-transform duration-200 group-hover:scale-110 group-hover:text-brand-red" />
            {wishlistCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-red text-[10px] font-bold leading-none text-brand-white ring-2 ring-brand-white">
                {wishlistCount > 99 ? "99+" : wishlistCount}
              </span>
            )}
          </Link>

          <Link
            href="/cart"
            aria-label={`Cart${cartCount > 0 ? `, ${cartCount} item${cartCount === 1 ? "" : "s"}` : ""}`}
            className="group relative rounded-full p-2 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-white/40"
          >
            <ShoppingCart className="h-5 w-5 text-brand-black transition-transform duration-200 group-hover:scale-110 group-hover:text-brand-red" />
            {cartCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-red text-[10px] font-bold leading-none text-brand-white ring-2 ring-brand-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {/* DESKTOP: PROFILE / AUTH */}
          <div className="relative hidden lg:block">
            {user ? (
              <DropdownMenu
                modal={false}
                open={profileMenuOpen}
                onOpenChange={setProfileMenuOpen}
              >
                <div
                  onMouseEnter={openProfileMenu}
                  onMouseLeave={scheduleClose}
                >
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      onPointerDown={(event) => {
                        // When the menu is already open (e.g. via hover), the
                        // trigger's pointerdown would toggle it closed and
                        // leave it stuck — the cursor is still on the button
                        // so no fresh mouseenter fires to reopen it. Block
                        // Radix's toggle in that case; the menu still closes
                        // via mouseleave, outside-click, or Escape.
                        if (profileMenuOpen) {
                          event.preventDefault();
                        }
                      }}
                      className="group flex items-center gap-2 rounded-full p-1.5 transition-colors duration-200 hover:bg-brand-white/40"
                      aria-label="Open profile menu"
                    >
                      <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-brand-border bg-brand-light-bg transition-transform duration-300 group-hover:scale-105">
                        {user.image ? (
                          <Image
                            src={user.image}
                            alt={user.name || "User"}
                            width={32}
                            height={32}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User className="h-4 w-4 text-brand-black" />
                        )}
                      </div>
                      <ChevronDown className="h-4 w-4 text-brand-black transition-transform duration-300 group-data-[state=open]:rotate-180" />
                    </button>
                  </DropdownMenuTrigger>
                </div>

                <DropdownMenuContent
                  align="end"
                  className="w-64 p-0"
                  onMouseEnter={cancelClose}
                  onMouseLeave={scheduleClose}
                >
                  <div className="border-b border-brand-border bg-brand-light-bg p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-brand-border bg-brand-light-bg">
                        {user.image ? (
                          <Image
                            src={user.image}
                            alt={user.name || "User"}
                            width={48}
                            height={48}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User className="h-6 w-6 text-brand-black" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-brand-black">
                          {user.name || "User"}
                        </p>
                        {user.email && (
                          <p className="truncate text-xs text-brand-text-muted">
                            {user.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="p-1.5">
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="h-4 w-4" />
                        My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/orders">
                        <Package className="h-4 w-4" />
                        My Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/wishlist">
                        <Heart className="h-4 w-4" />
                        Wishlist
                      </Link>
                    </DropdownMenuItem>
                  </div>
                  <DropdownMenuSeparator className="my-0" />
                  <div className="p-1.5">
                    <DropdownMenuItem
                      onSelect={(event) => {
                        event.preventDefault();
                        void handleLogout();
                      }}
                      className="text-red-600 focus:bg-red-50 focus:text-red-700"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-brand-black transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-white/40 hover:text-brand-red"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-1.5 rounded-lg bg-brand-red px-3 py-2 text-sm font-medium text-brand-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-red-hover hover:shadow-md"
                >
                  <UserPlus className="h-4 w-4" />
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE NAVBAR SEARCH */}
      <div
        id="mobile-navbar-search"
        ref={mobileSearchRef}
        aria-hidden={!mobileSearchOpen}
        className={cn(
          "absolute left-1 right-1 top-full z-50 origin-top transition-all duration-300 ease-out md:hidden sm:left-4 sm:right-4",
          mobileSearchOpen
            ? "visible translate-y-0 opacity-100"
            : "invisible pointer-events-none -translate-y-2 opacity-0",
        )}
      >
        <div
          className={cn(
            "overflow-visible rounded-b-2xl border-x border-b border-brand-border bg-brand-white p-3 shadow-xl transition-[max-height,padding] duration-300 ease-out",
            mobileSearchOpen ? "max-h-24" : "max-h-0 py-0",
          )}
        >
          <SearchBar
            placeholder="Search products..."
            inputClassName="border-brand-border bg-brand-light-bg"
            shouldFocus={mobileSearchOpen}
            onNavigate={() => setMobileSearchOpen(false)}
          />
        </div>
      </div>

      {/* MOBILE MENU */}
      <button
        type="button"
        aria-label="Close menu"
        aria-hidden={!mobileMenuOpen}
        inert={!mobileMenuOpen}
        tabIndex={mobileMenuOpen ? 0 : -1}
        onClick={() => {
          setMobileMenuOpen(false);
          mobileMenuButtonRef.current?.focus({ preventScroll: true });
        }}
        className={cn(
          "fixed inset-0 z-60 cursor-default border-0 bg-brand-black/40 p-0 transition-opacity duration-200 ease-out motion-reduce:transition-none lg:hidden",
          mobileMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
      />

      <aside
        id="mobile-navigation-drawer"
        ref={mobileMenuPanelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-navigation-title"
        aria-describedby="mobile-navigation-description"
        aria-hidden={!mobileMenuOpen}
        inert={!mobileMenuOpen}
        className={cn(
          "fixed inset-y-0 right-0 z-70 flex h-dvh w-[85%] max-w-sm transform-gpu flex-col overflow-hidden border-l border-brand-border bg-brand-light-bg shadow-xl [backface-visibility:hidden] [contain:paint] transition-transform duration-[420ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform motion-reduce:transition-none lg:hidden",
          mobileMenuOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="relative bg-brand-black px-4 py-3 text-brand-white">
          <h2
            id="mobile-navigation-title"
            className="text-base font-bold text-brand-white"
          >
            Menu
          </h2>
          <p id="mobile-navigation-description" className="sr-only">
            Browse navigation links and account actions.
          </p>
          <button
            ref={mobileMenuCloseRef}
            type="button"
            aria-label="Close menu"
            onClick={() => {
              setMobileMenuOpen(false);
              mobileMenuButtonRef.current?.focus({ preventScroll: true });
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-brand-white/90 transition-colors duration-150 hover:bg-brand-white/15 focus:outline-none focus:ring-2 focus:ring-brand-white/40"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile Search */}
        <div className="border-b border-brand-border bg-brand-white/40 px-4 py-3">
          <SearchBar
            placeholder="Search..."
            inputClassName="rounded-xl border-brand-border bg-brand-white"
            onNavigate={() => setMobileMenuOpen(false)}
          />
        </div>

        <nav className="flex flex-col gap-1 p-3">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red",
                  active
                    ? "bg-brand-red text-brand-white shadow-md"
                    : "text-brand-black hover:translate-x-1 hover:bg-brand-white/60 hover:text-brand-red",
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}

          <div className="mt-2 border-t border-brand-border pt-2">
            {user ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold text-brand-black transition-all duration-200 hover:translate-x-1 hover:bg-brand-white/60 hover:text-brand-red"
                >
                  <User className="h-5 w-5" />
                  My Profile
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    void handleLogout();
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold text-red-600 transition-all duration-200 hover:translate-x-1 hover:bg-red-50"
                >
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold text-brand-black transition-all duration-200 hover:translate-x-1 hover:bg-brand-white/60 hover:text-brand-red"
                >
                  <LogIn className="h-5 w-5" />
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl bg-brand-red px-4 py-3 text-base font-semibold text-brand-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-red-hover"
                >
                  <UserPlus className="h-5 w-5" />
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </nav>
      </aside>
    </header>
  );
}
