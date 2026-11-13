import type { Surface } from "./surfaces";

/** Documents permit first-party assets and the providers needed for their surface. */
export function documentSecurityHeaders(surface: Surface): Record<string, string> {
  const scripts = surface === "public" ? "" : "https://*.airwallex.com https://*.sslcommerz.com";
  const connections = surface === "public" ? "" : "https://*.airwallex.com https://*.sslcommerz.com https://api.emailjs.com";
  const metaEnabled = process.env.NODE_ENV === "production" && /^\d+$/.test(process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() ?? "");
  const metaScript = metaEnabled ? "https://connect.facebook.net" : "";
  const metaEvents = metaEnabled ? "https://www.facebook.com https://connect.facebook.net" : "";
  return {
    "Content-Security-Policy": [
      "default-src 'self'", "base-uri 'self'", "object-src 'none'", "frame-ancestors 'none'",
      `script-src 'self' 'unsafe-inline' ${process.env.NODE_ENV === "development" ? "'unsafe-eval'" : ""} ${scripts} ${metaScript}`,
      "style-src 'self' 'unsafe-inline'", "font-src 'self' data:",
      `img-src 'self' data: blob: https://lh3.googleusercontent.com https://placehold.co https://picsum.photos https://i.ibb.co https://images.unsplash.com https://api.dicebear.com ${uploadImageOrigin()} ${metaEvents}`,
      `connect-src 'self' ${connections} ${metaEvents} ${process.env.NODE_ENV === "development" ? "ws://localhost:* ws://127.0.0.1:*" : ""}`,
      "frame-src 'self' https://*.airwallex.com https://*.sslcommerz.com https://www.google.com/maps",
      "form-action 'self' https://accounts.google.com https://*.sslcommerz.com https://*.airwallex.com",
    ].join("; "),
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
  };
}

function uploadImageOrigin(): string {
  try {
    const url = new URL(process.env.UPLOAD_PUBLIC_URL ?? "");
    const trackingHost = /(?:^|\.)(?:facebook\.com|facebook\.net|fbcdn\.net|googletagmanager\.com|google-analytics\.com)$/.test(url.hostname);
    return url.protocol === "https:" && !trackingHost ? url.origin : "";
  } catch { return ""; }
}
