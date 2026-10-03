"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    fbq?: (command: "track", event: "PageView") => void;
  }
}

export default function MetaPixel({ pixelId }: { pixelId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isReady, setIsReady] = useState(false);
  const lastTrackedPage = useRef<string | null>(null);
  const query = searchParams.toString();
  const page = query ? `${pathname}?${query}` : pathname;

  useEffect(() => {
    if (!isReady || !window.fbq || lastTrackedPage.current === page) return;

    // One effect owns initial and navigation events, including Strict Mode replay.
    window.fbq("track", "PageView");
    lastTrackedPage.current = page;
  }, [isReady, page]);

  return (
    <Script
      id="meta-pixel"
      strategy="afterInteractive"
      onReady={() => setIsReady(true)}
    >
      {`
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', ${JSON.stringify(pixelId).replace(/</g, "\\u003c")});
      `}
    </Script>
  );
}
