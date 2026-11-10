/** Synthetic browser fixture. Never imported by an application route. */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { NextIntlClientProvider } from "next-intl";
import PublicTracking from "@/components/analytics/PublicTracking";
import messages from "@/messages/core-en.json";
import { collectBrowserTrackingContext } from "@/lib/analytics/browser-context";
import { dispatchPublicPixelEvent, revalidatePublicPixel } from "@/lib/analytics/browser-pixel";
import { SurfaceContext } from "@/components/layout/SurfaceContext";

Reflect.set(window, "__marketingTest", { collectBrowserTrackingContext, dispatchPublicPixelEvent, revalidatePublicPixel });
const root = document.getElementById("consent-ui");
if (root) createRoot(root).render(<StrictMode><SurfaceContext.Provider value="public"><NextIntlClientProvider locale="en" messages={messages}><PublicTracking /></NextIntlClientProvider></SurfaceContext.Provider></StrictMode>);
