"use client";

import { MapPin, Navigation, Building2 } from "lucide-react";

import { siteConfig } from "@/lib/seo/site";

const offices = [
  {
    city: "Dhaka (HQ)",
    address: siteConfig.contact.address,
    phone: siteConfig.contact.phone,
  },
];

export default function ContactMap() {
  return (
    <section id="location">
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-light-bg px-3 py-1.5">
          <Building2 className="h-3.5 w-3.5 text-brand-red" />
          <span className="text-[11px] font-bold uppercase tracking-wide text-brand-red">
            Our Offices
          </span>
        </div>
        <h2 className="mt-3 text-2xl font-black tracking-tight text-foreground sm:text-3xl lg:text-4xl">
          Find us across{" "}
          <span className="text-brand-red">
            the country
          </span>
        </h2>
      </div>

      <div className="h-0.5 w-full bg-brand-border rounded-full mb-6" />

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Map */}
        <div className="lg:col-span-3">
          <div className="relative h-72 overflow-hidden rounded-3xl shadow-lg ring-1 ring-brand-border sm:h-80 lg:h-full lg:min-h-[420px]">
            <iframe
              title={`${siteConfig.name} HQ`}
              src="https://www.google.com/maps?q=Mirpur+Dhaka&output=embed"
              className="h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            {/* Overlay badge */}
            <div className="pointer-events-none absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 shadow-md ring-1 ring-brand-border backdrop-blur-sm">
              <MapPin className="h-3.5 w-3.5 text-brand-red" />
              <span className="text-xs font-bold text-foreground">{siteConfig.name} HQ</span>
            </div>
          </div>
        </div>

        {/* Office list */}
        <div className="lg:col-span-2">
          <div className="grid gap-3 sm:gap-4">
            {offices.map((o, i) => (
              <div
                key={o.city}
                className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-brand-border transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-red text-white shadow-md">
                    {i === 0 ? (
                      <Navigation className="h-5 w-5" />
                    ) : (
                      <MapPin className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-foreground">
                        {o.city}
                      </h3>
                      {i === 0 && (
                        <span className="rounded-full bg-brand-gold px-2 py-0.5 text-[10px] font-bold text-brand-black">
                          HQ
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {o.address}
                    </p>
                    <a
                      href={`tel:${o.phone.replace(/\s/g, "")}`}
                      className="mt-2 inline-block text-sm font-bold text-brand-red hover:text-brand-red-hover hover:underline"
                    >
                      {o.phone}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
