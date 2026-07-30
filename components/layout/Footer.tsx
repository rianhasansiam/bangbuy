import Link from "next/link";

import { siteConfig } from "@/lib/seo/site";

const quickLinks = [
  { name: "Home", href: "/" },
  { name: "Shop Categories", href: "/categories" },
  { name: "All Products", href: "/products" },
  { name: "Brands", href: "/brands" },
  { name: "About Us", href: "/about" },
];

const supportLinks = [
  { name: "Any Help", href: "/contact" },
  { name: "Terms & Conditions", href: "/terms-and-conditions" },
  { name: "Privacy Policy", href: "/privacy-policy" },
  { name: "Return Policy", href: "/return-policy" },
  { name: "FAQS", href: "/contact" },
];

const socialLinks = [
  {
    name: "Facebook",
    href: siteConfig.social.facebook,
    className: "bg-[#1877F2] hover:bg-[#166FE5]",
    icon: (
      <svg
        className="h-5 w-5"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
] as const;

const Footer = () => {
  return (
    <footer className="bg-brand-black text-brand-white ">
      <div className="container mx-auto px-4 py-8 sm:py-10">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand Section */}
          <div className="col-span-2 sm:col-span-2 md:col-span-1 space-y-3 sm:space-y-4 ">
            <Link
              href="/"
              aria-label={`${siteConfig.name} - Good Quality. Good Service. - home`}
              className="items-center  group inline-flex flex-col rounded-xl py-1 pr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2 focus-visible:ring-offset-brand-black"
            >
              <span className="mb-2 whitespace-nowrap text-3xl font-black leading-none tracking-[-0.06em] text-brand-white sm:text-4xl">
                Bang<span className="text-brand-red">Buy</span>
              </span>
              <span className="mt-1.5 whitespace-nowrap text-[0.52rem] font-bold uppercase leading-none tracking-[0.22em] text-brand-white/55 transition-colors duration-300 group-hover:text-brand-white/80">
                - Good Quality. Good Service. -
              </span>
            </Link>
            <p className="text-brand-white text-xs sm:text-sm leading-relaxed">
              Discover premium verified stores within 50km. Real-time deals,
              clean UI, and a superior local shopping experience.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h2 className="text-base sm:text-lg font-black text-brand-white mb-3 sm:mb-4">
              Quick Links
            </h2>
            <ul className="space-y-1.5 sm:space-y-2">
              {quickLinks.map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.href}
                    className="text-brand-white hover:text-brand-red focus-visible:text-brand-red transition text-xs sm:text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Center */}
          <div>
            <h2 className="text-base sm:text-lg font-black text-brand-white mb-3 sm:mb-4">
              Support Center
            </h2>
            <ul className="space-y-1.5 sm:space-y-2">
              {supportLinks.map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.href}
                    className="text-brand-white hover:text-brand-red focus-visible:text-brand-red transition text-xs sm:text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-2 sm:col-span-2 md:col-span-1">
            {/* Keep In Touch */}
            <h2 className="text-sm sm:text-base font-black text-brand-white mb-2 sm:mb-3">
              Keep In Touch
            </h2>
            <p className="mb-3 max-w-xs text-xs leading-relaxed text-brand-white sm:mb-4 sm:text-sm">
              Follow {siteConfig.name} for fresh deals and local shopping
              updates.
            </p>
            <div className="flex flex-wrap gap-2.5 sm:gap-3">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Follow ${siteConfig.name} on ${social.name}`}
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-lg ring-1 ring-white/15 transition-all duration-300 hover:-translate-y-1 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-black sm:h-11 sm:w-11 ${social.className}`}
                >
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
