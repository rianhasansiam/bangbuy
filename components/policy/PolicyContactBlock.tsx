import { siteConfig } from "@/lib/seo/site";

/**
 * Highlighted customer-support contact callout shared across policy pages
 * (Privacy, Return, Terms). Renders the standard PixoHouse support email,
 * phone, and address inside a violet/pink gradient card.
 */
export default function PolicyContactBlock() {
  return (
    <div className="rounded-2xl bg-brand-light-bg p-4 ring-1 ring-brand-border sm:p-5">
      <p className="text-sm font-bold text-gray-900 sm:text-base">{siteConfig.name} Customer Support</p>
      <ul className="mt-2 space-y-1 text-sm text-gray-700 sm:text-base">
        <li>
          <span className="font-semibold text-gray-900">Email:</span>{" "}
          <a
            href={`mailto:${siteConfig.contact.email}`}
            className="text-brand-red hover:text-brand-red-hover hover:underline"
          >
            {siteConfig.contact.email}
          </a>
        </li>
        <li>
          <span className="font-semibold text-gray-900">Phone:</span>{" "}
          <a
            href={`tel:${siteConfig.contact.phoneIntl}`}
            className="text-brand-red hover:text-brand-red-hover hover:underline"
          >
            {siteConfig.contact.phoneIntl}
          </a>
        </li>
        <li>
          <span className="font-semibold text-gray-900">Address:</span> {siteConfig.contact.address}
        </li>
      </ul>
    </div>
  );
}
