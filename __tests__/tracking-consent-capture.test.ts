import { webcrypto } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { captureApprovedConsentContext, collectCurrentConversionContext } from "@/lib/analytics/consent-capture";
import { approvedTestPolicy, TRACKING_TEST_TIME as now } from "./fixtures/tracking-policy";

let cookieReads = 0;
let uaReads = 0;
let policy = approvedTestPolicy();
let cookieValue = "_fbp=fb.1.1794290400000.1234567890123456";
const fetchMock = vi.fn();
beforeEach(async () => {
  vi.useFakeTimers(); vi.setSystemTime(now); cookieReads = 0; uaReads = 0; policy = approvedTestPolicy(); cookieValue = "_fbp=fb.1.1794290400000.1234567890123456";
  vi.stubGlobal("crypto", webcrypto);
  const wrapper = {
    textContent: "Synthetic ordinary catalog page",
    querySelectorAll: (selector: string) => selector === "[data-tracking-content-id]" ? [{ getAttribute: () => "SKU-EXAMPLE" }] : [],
    cloneNode: () => wrapper,
  };
  vi.stubGlobal("document", { title: "Synthetic catalog", referrer: "", querySelector: () => wrapper, querySelectorAll: () => [], get cookie() { cookieReads++; return cookieValue; } });
  vi.stubGlobal("window", { location: { href: "https://public.example.test/en/products/example" } });
  vi.stubGlobal("navigator", { get userAgent() { uaReads++; return "SyntheticBrowser"; } });
  const actual = await collectCurrentConversionContext(policy);
  policy.routes[0].metadataFingerprint = actual!.metadataFingerprint;
  fetchMock.mockReset().mockImplementation(async () => new Response(JSON.stringify({ policy })));
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe("optional conversion attribution is captured only after an approved grant", () => {
  it.each(["denied", "revoked"] as const)("does not even fetch policy or read identifiers for %s", async (choice) => {
    expect(await captureApprovedConsentContext(choice)).toEqual({}); expect(fetchMock).not.toHaveBeenCalled(); expect(cookieReads).toBe(0); expect(uaReads).toBe(0);
  });
  it("reads no marketing cookies or browser identifiers without field and context approvals", async () => {
    policy.matching.fields = [];
    expect(await captureApprovedConsentContext("granted")).toEqual({}); expect(cookieReads).toBe(0); expect(uaReads).toBe(0);
    policy = approvedTestPolicy();
    policy.routes[0].approved = false;
    expect(await captureApprovedConsentContext("granted")).toEqual({}); expect(cookieReads).toBe(0); expect(uaReads).toBe(0);
  });
  it("captures the actual approved URL, document hash, existing attribution and truthful UA", async () => {
    const result = await captureApprovedConsentContext("granted");
    expect(result.context).toMatchObject({ url: window.location.href, contentIds: ["SKU-EXAMPLE"], metadataFingerprint: policy.routes[0].metadataFingerprint });
    expect(result.matching).toEqual({ fbp: "fb.1.1794290400000.1234567890123456", client_user_agent: "SyntheticBrowser" });
    expect(cookieReads).toBe(2); expect(uaReads).toBe(1);
  });
  it("never manufactures missing attribution or sends a query as a safe URL", async () => {
    cookieValue = "essential-cookie=synthetic";
    expect(await captureApprovedConsentContext("granted")).toEqual({}); expect(uaReads).toBe(0);
    window.location.href += "?fbclid=unapproved";
    const previous = cookieReads;
    expect(await captureApprovedConsentContext("granted")).toEqual({}); expect(cookieReads).toBe(previous);
  });
  it("stops on runtime disablement or network failure without affecting the consent action", async () => {
    policy.runtimeEnabled = false;
    expect(await captureApprovedConsentContext("granted")).toEqual({}); expect(cookieReads).toBe(0);
    fetchMock.mockRejectedValue(new Error("synthetic unavailable"));
    expect(await captureApprovedConsentContext("granted")).toEqual({});
  });
  it("never reads guest commerce attribution or UA, while public capture never reads an account", async () => {
    await captureApprovedConsentContext("granted"); expect(fetchMock.mock.calls.map((call) => call[0])).not.toContain("/api/auth/session");
    cookieReads = 0; uaReads = 0; window.location.href = "https://commerce.example.test/en/checkout"; policy.routes[0].pathname = "/en/checkout";
    fetchMock.mockImplementation(async (url: string) => new Response(JSON.stringify(url === "/api/auth/session" ? { user: null } : { policy })));
    expect(await captureApprovedConsentContext("granted")).toEqual({}); expect(cookieReads).toBe(0); expect(uaReads).toBe(0);
  });
});
