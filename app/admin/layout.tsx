"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, ShieldCheck } from "lucide-react";
import AdminSidebar from "./components/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);

  // Close the mobile drawer whenever the route changes.
  // Adjusts state during render instead of in an effect to avoid the cascading-render warning.
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    if (sidebarOpen) setSidebarOpen(false);
  }

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = sidebarOpen ? "hidden" : previous;
    return () => {
      document.body.style.overflow = previous;
    };
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-brand-light-bg">
      <div className="flex w-full">
        <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="min-w-0 flex-1 px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">
            {/* Mobile top bar — exposes the off-canvas sidebar toggle below lg. */}
            <div className="sticky top-0 z-40 mb-4 flex items-center gap-3 rounded-2xl border border-brand-border bg-white/95 px-3 py-2.5 shadow-sm backdrop-blur-md lg:hidden">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open admin menu"
                className="rounded-lg p-2 text-gray-700 transition-colors duration-200 hover:bg-brand-light-bg hover:text-brand-red"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-red">
                  <ShieldCheck className="h-4 w-4 text-white" />
                </div>
                <span className="text-base font-extrabold text-brand-black">
                  Admin Panel
                </span>
              </div>
            </div>

            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
