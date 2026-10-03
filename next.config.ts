import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async rewrites() {
    if (process.env.NODE_ENV !== "development") return [];

    return {
      beforeFiles: [
        {
          source: "/_next/image",
          has: [
            {
              type: "query",
              key: "url",
              value: "https://i\\.ibb\\.co/.*",
            },
          ],
          // ImgBB originals can exceed the local optimizer's fetch timeout.
          // Reuse the storefront's resized cache for public images in dev.
          destination: "https://bangbuy.net/_next/image",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/a/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/seed/**",
      },
      {
        protocol: "https",
        hostname: "i.ibb.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/photo-1542838132-92c53300491e",
      },
    ],
  },
};

export default nextConfig;
