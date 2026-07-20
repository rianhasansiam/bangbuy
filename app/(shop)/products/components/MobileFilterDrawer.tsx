"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import FilterSidebar from "./FilterSidebar";

type Filters = {
  categories: string[];
  brands: string[];
  priceRange: [number, number];
  minRating: number;
  inStockOnly: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
  filters: Filters;
  onChange: (next: Filters) => void;
  onReset: () => void;
  categories: string[];
  brands: string[];
  priceBounds: [number, number];
};

export default function MobileFilterDrawer({
  open,
  onClose,
  filters,
  onChange,
  onReset,
  categories,
  brands,
  priceBounds,
}: Props) {
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="left"
        className="w-[85%] max-w-sm bg-brand-light-bg p-0 lg:hidden"
      >
        <SheetHeader className="bg-brand-black px-4 py-3 text-brand-white">
          <SheetTitle className="text-base font-bold text-brand-white">
            Filters
          </SheetTitle>
        </SheetHeader>

        <div className="h-[calc(100%-3.25rem)] overflow-y-auto p-3">
          <FilterSidebar
            filters={filters}
            onChange={onChange}
            onReset={onReset}
            categories={categories}
            brands={brands}
            priceBounds={priceBounds}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
