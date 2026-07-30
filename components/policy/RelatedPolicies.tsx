import Link from "next/link";

type RelatedPoliciesProps = {
  /** Path of the page currently being rendered, so it can be excluded from the list. */
  currentPath?: string;
};

const LINKS = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/return-policy", label: "Return Policy" },
  { href: "/terms-and-conditions", label: "Terms & Conditions" },
  { href: "/contact", label: "Contact Us" },
];

/**
 * Footer navigation card linking to the other customer-facing policies.
 * Shown at the bottom of every policy page; the current page is filtered
 * out when `currentPath` is provided.
 */
export default function RelatedPolicies({ currentPath }: RelatedPoliciesProps) {
  const links = currentPath ? LINKS.filter((l) => l.href !== currentPath) : LINKS;

  return (
    <nav
      aria-label="Related policies"
      className="rounded-3xl bg-brand-light-bg p-5 ring-1 ring-brand-border sm:p-6"
    >
      <h2 className="text-base font-black text-gray-900 sm:text-lg">Related policies</h2>
      <p className="mt-1 text-xs text-gray-600 sm:text-sm">
        Please also review our other customer policies.
      </p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="inline-flex items-center rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-brand-red ring-1 ring-brand-border transition hover:bg-brand-red hover:text-brand-white sm:text-sm"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
