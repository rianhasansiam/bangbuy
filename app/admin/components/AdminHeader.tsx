"use client";

import { Bell, Menu, User } from "lucide-react";

import SearchBar from "@/components/layout/SearchBar";

type Props = {
  title: string;
  subtitle?: string;
  onOpenSidebar: () => void;
};

export default function AdminHeader({ title, subtitle, onOpenSidebar }: Props) {
  return (
    <header className="mb-4 flex items-center gap-3 rounded-2xl border border-brand-border bg-white/80 px-3 py-3 shadow-sm backdrop-blur-md sm:px-4 lg:px-5">
      <button
        type="button"
        onClick={onOpenSidebar}
        aria-label="Open sidebar"
        className="rounded-lg p-2 text-gray-700 transition-colors duration-200 hover:bg-brand-light-bg hover:text-brand-red lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="min-w-0">
        <h1 className="truncate text-base font-extrabold text-brand-black sm:text-lg">
          {title}
        </h1>
        {subtitle && (
          <p className="hidden truncate text-xs font-medium text-gray-500 sm:block">
            {subtitle}
          </p>
        )}
      </div>

      <div className="ml-auto hidden w-72 md:block">
        <SearchBar
          placeholder="Search products, categories…"
          inputClassName="h-9 rounded-xl border-brand-border bg-white"
        />
      </div>

      <button
        type="button"
        aria-label="Notifications"
        className="relative rounded-full p-2 text-gray-700 transition-colors duration-200 hover:bg-brand-light-bg hover:text-brand-red"
      >
        <Bell className="h-5 w-5" />
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-red ring-2 ring-white" />
      </button>

      <div className="flex items-center gap-2 rounded-full border border-brand-border bg-white px-1 py-1 pr-3 shadow-sm">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-red/10 text-brand-red">
          <User className="h-4 w-4" />
        </div>
        <div className="hidden leading-tight sm:block">
          <p className="text-xs font-bold text-gray-900">Admin</p>
          <p className="text-[10px] text-gray-500">Super Admin</p>
        </div>
      </div>
    </header>
  );
}
