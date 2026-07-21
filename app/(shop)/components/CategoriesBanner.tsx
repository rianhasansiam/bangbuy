import Image from "next/image";
import Link from "next/link";

type SaleBanner = {
  image: string;
  label: string;
  heading: string;
  discount: string;
  description: string;
  link: string;
};

export function CategoriesBanner({ saleBanner }: { saleBanner: SaleBanner }) {
  return (
    <div className="group relative hidden w-52 shrink-0 overflow-hidden rounded-2xl bg-brand-black p-4 text-brand-white shadow-lg transition-all duration-300 hover:shadow-xl lg:flex lg:flex-col lg:justify-center">
      <Image
        src={saleBanner.image}
        alt={saleBanner.heading}
        fill
        className="object-cover opacity-80 transition-all duration-500 group-hover:scale-110 group-hover:opacity-50"
      />
      <div className="absolute right-0 top-0 h-24 w-24 -translate-y-1/2 translate-x-1/2 rounded-full bg-brand-white/10" />
      <div className="absolute bottom-0 left-0 h-32 w-32 -translate-x-1/2 translate-y-1/2 rounded-full bg-brand-white/5" />

      <div className="relative z-10">
        <div className="mb-3 inline-block rounded-full bg-brand-red px-2.5 py-1 text-[10px] font-bold text-brand-white shadow-md">
          {saleBanner.label}
        </div>
        <h3 className="mb-1 text-2xl font-black leading-tight tracking-tight">
          {saleBanner.heading}
        </h3>
        <div className="mb-2 text-4xl font-black text-brand-gold drop-shadow-lg">
          {saleBanner.discount}
        </div>
        <p className="mb-4 text-[11px] leading-relaxed opacity-90">
          {saleBanner.description}
        </p>
        <Link
          href={saleBanner.link}
          className="block w-full rounded-full bg-brand-white px-4 py-2 text-center text-xs font-bold text-brand-black shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-red hover:text-brand-white hover:shadow-lg"
        >
          Shop now →
        </Link>
      </div>
    </div>
  );
}
