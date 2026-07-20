"use client";

import Image from "next/image";
import { Heart, PackageCheck, Target } from "lucide-react";

export default function OurStory() {
  return (
    <section>
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Image side */}
        <div className="relative">
          <div className="relative h-72 w-full overflow-hidden rounded-3xl bg-brand-black shadow-xl sm:h-80 lg:h-96">
            <Image
              src="/logo/logo.png"
              alt="PixoHouse imported product story"
              fill
              className="object-contain p-10"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority={false}
            />

            <div className="absolute inset-0 bg-gradient-to-br from-brand-black/70 via-brand-black/35 to-brand-red/30" />
          </div>

          {/* Floating badge */}
          <div className="absolute -bottom-5 -right-3 hidden rounded-2xl bg-white px-4 py-3 shadow-lg ring-1 ring-brand-border sm:flex sm:items-center sm:gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-red text-white">
              <PackageCheck className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Imported with</p>
              <p className="text-sm font-black text-foreground">Care & Quality</p>
            </div>
          </div>

          {/* Decorative blobs */}
          <div className="absolute -left-4 -top-4 -z-10 h-24 w-24 rounded-full bg-brand-red/10 blur-2xl" />
          <div className="absolute -bottom-6 -right-6 -z-10 h-32 w-32 rounded-full bg-brand-red/10 blur-2xl" />
        </div>

        {/* Text side */}
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-light-bg px-3 py-1.5">
            <Target className="h-3.5 w-3.5 text-brand-red" />
            <span className="text-[11px] font-bold uppercase tracking-wide text-brand-red">
              Our Story
            </span>
          </div>

          <h2 className="mt-3 text-2xl font-black tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            Bringing{" "}
            <span className="text-brand-red">
              China-imported
            </span>{" "}
            products closer to you.
          </h2>

          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            PixoHouse was created with one clear goal: to make stylish,
            useful, and carefully selected China-imported products easier to
            buy online. We focus on sourcing products that match modern trends,
            practical needs, and customer expectations.
          </p>

          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            From product selection to quality checking, every item is chosen
            with care so customers can shop with confidence. Our mission is to
            offer attractive imported collections, fair pricing, and a smooth
            e-commerce experience from browsing to delivery.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-brand-light-bg p-4 ring-1 ring-brand-border">
              <p className="text-2xl font-black text-brand-red">CN</p>
              <p className="text-xs font-medium text-muted-foreground">
                Imported Products
              </p>
            </div>

            <div className="rounded-2xl bg-brand-light-bg p-4 ring-1 ring-brand-border">
              <p className="text-2xl font-black text-brand-red">QC</p>
              <p className="text-xs font-medium text-muted-foreground">
                Quality Checked
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}