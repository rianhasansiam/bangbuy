import Image from "next/image";
import Link from "next/link";

import type { ImageTextBlock } from "@/lib/types/product-description-blocks";
import { cn } from "@/lib/utils";

const EXTERNAL_URL = /^https?:\/\//i;

function isExternalUrl(url: string) {
  return EXTERNAL_URL.test(url);
}

export default function ImageTextBlockView({
  block,
}: {
  block: ImageTextBlock;
}) {
  if (!block.imageUrl?.trim()) return null;

  const imageOnRight = block.imagePosition === "right";

  return (
    <section
      aria-labelledby={
        block.heading?.trim() ? `it-${block.id}` : undefined
      }
      className={cn(
        "flex flex-col gap-6 md:flex-row md:items-center",
        imageOnRight && "md:flex-row-reverse",
      )}
    >
      {/* Image */}
      <div className="relative w-full overflow-hidden rounded-2xl md:w-1/2">
        <Image
          src={block.imageUrl}
          alt={block.imageAlt}
          width={640}
          height={480}
          className="h-auto w-full rounded-2xl object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {/* Text content */}
      <div className="flex flex-1 flex-col gap-4">
        {block.heading?.trim() && (
          <h2
            id={`it-${block.id}`}
            className="text-xl font-bold text-gray-900 sm:text-2xl"
          >
            {block.heading}
          </h2>
        )}
        {block.description?.trim() && (
          <p className="leading-relaxed text-gray-600">{block.description}</p>
        )}
        {block.ctaLabel?.trim() && block.ctaUrl?.trim() && (
          <Link
            href={block.ctaUrl}
            {...(isExternalUrl(block.ctaUrl)
              ? {
                  target: "_blank",
                  rel: "noopener noreferrer",
                }
              : {})}
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-brand-red px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-red-hover"
          >
            {block.ctaLabel}
          </Link>
        )}
      </div>
    </section>
  );
}
