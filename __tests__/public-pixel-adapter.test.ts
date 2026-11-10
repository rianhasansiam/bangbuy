import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { approvedTestPolicy, grantedConsent, trackingContext, trackingTestEvent, TRACKING_TEST_TIME as now } from "./fixtures/tracking-policy";
import type { MarketingConsent } from "@/lib/analytics/consent";

const contextMock = vi.hoisted(() => vi.fn());
vi.mock("@/lib/analytics/browser-context", () => ({ collectBrowserTrackingContext: contextMock }));
type TestPixel = ((...args: unknown[]) => void) & { queue?: unknown[][]; callMethod?: (...args: unknown[]) => void; disablePushState?: boolean };

function browserFixture(mode: "success" | "delayed" | "failure" = "success") {
  let policy = approvedTestPolicy();
  let consent: MarketingConsent = grantedConsent();
  const storage = new Map<string, string>();
  const local = {
    get length() { return storage.size; }, key: (index: number) => [...storage.keys()][index] ?? null,
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => { storage.set(key, value); },
    removeItem: (key: string) => { storage.delete(key); },
  };
  const scripts: Array<{ onload?: () => void; onerror?: () => void; src?: string; id?: string }> = [];
  const handoff = vi.fn();
  const location = { href: trackingContext.url, pathname: "/en/products/example", protocol: "https:", reload: vi.fn() };
  const browser = { fbq: undefined as TestPixel | undefined, location, localStorage: local, sessionStorage: local, setTimeout: vi.fn(() => 1), clearTimeout: vi.fn() };
  const finish = () => { browser.fbq!.callMethod = handoff; scripts.at(-1)?.onload?.(); };
  const document = {
    cookie: "", getElementById: (id: string) => scripts.find((entry) => entry.id === id) ?? null,
    createElement: () => ({}),
    head: { appendChild: vi.fn((script) => {
      scripts.push(script);
      if (mode === "success") queueMicrotask(finish);
      if (mode === "failure") queueMicrotask(() => script.onerror?.());
    }) },
  };
  const request = vi.fn(async () => new Response(JSON.stringify({ policy, consent })));
  vi.stubGlobal("window", browser); vi.stubGlobal("document", document); vi.stubGlobal("location", location);
  vi.stubGlobal("localStorage", local); vi.stubGlobal("sessionStorage", local); vi.stubGlobal("fetch", request);
  contextMock.mockReset().mockImplementation(async () => ({ ...trackingContext, url: location.href }));
  return { browser, scripts, handoff, storage, request, finish, location, document,
    policy: () => policy, setPolicy: (value: typeof policy) => { policy = value; },
    setConsent: (value: MarketingConsent) => { consent = value; },
  };
}

beforeEach(() => { vi.resetModules(); vi.useFakeTimers(); vi.setSystemTime(now); });
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe("explicit public browser transport", () => {
  it("initializes once per document and suppresses Strict Mode or concurrent action duplicates", async () => {
    const fixture = browserFixture();
    const { dispatchPublicPixelEvent } = await import("@/lib/analytics/browser-pixel");
    const event = trackingTestEvent();
    const results = await Promise.all([dispatchPublicPixelEvent(event), dispatchPublicPixelEvent(event)]);
    expect(results.filter(Boolean)).toHaveLength(1); expect(await dispatchPublicPixelEvent(event)).toBe(false);
    expect(fixture.scripts).toHaveLength(1); expect(fixture.scripts[0].src).toBe("https://connect.facebook.net/en_US/fbevents.js");
    const commands = fixture.browser.fbq!.queue!;
    expect(commands.filter((entry) => entry[0] === "init")).toEqual([["init", "100000000000000"]]);
    expect(fixture.handoff).toHaveBeenCalledExactlyOnceWith("trackSingle", "100000000000000", "PageView", {}, { eventID: event.eventId });
  });
  it("disables automatic configuration and matching before initialization", async () => {
    const fixture = browserFixture(); const { dispatchPublicPixelEvent } = await import("@/lib/analytics/browser-pixel");
    await dispatchPublicPixelEvent(trackingTestEvent());
    const queue = fixture.browser.fbq!.queue!;
    expect(queue.indexOf(queue.find((entry) => entry[0] === "set")!)).toBeLessThan(queue.indexOf(queue.find((entry) => entry[0] === "init")!));
    expect(queue).toContainEqual(["set", "autoConfig", false, "100000000000000"]);
    for (const feature of ["AutomaticSetup", "AutomaticMatching", "AutomaticMatchingRegex", "AutomaticMatchingAI", "FirstPartyCookies"]) expect(queue).toContainEqual(["optOut", "100000000000000", feature]);
    expect(fixture.browser.fbq!.disablePushState).toBe(true);
  });
  it("uses exact approved item fields and independent event identities", async () => {
    const fixture = browserFixture(); const { dispatchPublicPixelEvent } = await import("@/lib/analytics/browser-pixel");
    const view = trackingTestEvent("ViewContent");
    expect(await dispatchPublicPixelEvent(view)).toBe(true);
    const add = { ...view, name: "AddToCart", eventId: "6fdeaf6c-d776-4a38-b8f9-d5247d154cd2" };
    expect(await dispatchPublicPixelEvent(add)).toBe(true);
    expect(fixture.handoff.mock.calls).toEqual([
      ["trackSingle", "100000000000000", "ViewContent", view.parameters, { eventID: view.eventId }],
      ["trackSingle", "100000000000000", "AddToCart", view.parameters, { eventID: add.eventId }],
    ]);
    expect(JSON.stringify(fixture.handoff.mock.calls)).not.toMatch(/content_name|variant_ids|email|phone|address|user_agent/);
  });
  it.each(["unknown", "denied", "revoked"] as const)("requests no SDK while consent is %s", async (state) => {
    const fixture = browserFixture(); fixture.setConsent({ ...grantedConsent(), state });
    const { dispatchPublicPixelEvent } = await import("@/lib/analytics/browser-pixel");
    expect(await dispatchPublicPixelEvent(trackingTestEvent())).toBe(false); expect(fixture.scripts).toEqual([]); expect(fixture.browser.fbq).toBeUndefined(); expect(fixture.handoff).not.toHaveBeenCalled();
  });
  it("never replays a denied event after grant, while allowing a genuinely new event", async () => {
    const fixture = browserFixture(); fixture.setConsent({ ...grantedConsent(), state: "denied" });
    const { dispatchPublicPixelEvent } = await import("@/lib/analytics/browser-pixel");
    const event = trackingTestEvent(); expect(await dispatchPublicPixelEvent(event)).toBe(false); expect(fixture.scripts).toEqual([]);
    fixture.setConsent(grantedConsent()); expect(await dispatchPublicPixelEvent(event)).toBe(false);
    expect(await dispatchPublicPixelEvent({ ...event, eventId: "5de4a009-9c1e-4797-bae3-737bd8c674dd" })).toBe(true); expect(fixture.handoff).toHaveBeenCalledOnce();
  });
  it.each(["business", "source", "routes", "contents"] as const)("requests no SDK without %s approval", async (field) => {
    const fixture = browserFixture(); const policy = fixture.policy();
    fixture.setPolicy({ ...policy, [field]: Array.isArray(policy[field]) ? [] : { ...policy[field], approved: false } });
    const { dispatchPublicPixelEvent } = await import("@/lib/analytics/browser-pixel");
    expect(await dispatchPublicPixelEvent(trackingTestEvent())).toBe(false); expect(fixture.scripts).toEqual([]);
  });
  it("rejects private screens and real unsafe URL context before requesting SDK", async () => {
    const fixture = browserFixture(); fixture.location.pathname = "/en/checkout";
    const { dispatchPublicPixelEvent } = await import("@/lib/analytics/browser-pixel");
    expect(await dispatchPublicPixelEvent(trackingTestEvent())).toBe(false); expect(fixture.request).not.toHaveBeenCalled();
    fixture.location.pathname = "/en/products/example"; fixture.location.href += "?q=private";
    expect(await dispatchPublicPixelEvent({ ...trackingTestEvent(), eventId: "b8e0a97f-6d80-4b80-b59f-b0c3868c9639" })).toBe(false); expect(fixture.scripts).toEqual([]);
  });
  it("rejects private conversions and raw payload fields without loading SDK", async () => {
    const fixture = browserFixture(); const { dispatchPublicPixelEvent } = await import("@/lib/analytics/browser-pixel");
    expect(await dispatchPublicPixelEvent(trackingTestEvent("Purchase"))).toBe(false);
    expect(await dispatchPublicPixelEvent({ ...trackingTestEvent(), parameters: { email: "private@example.test" } })).toBe(false);
    expect(fixture.scripts).toEqual([]); expect(fixture.request).not.toHaveBeenCalled();
  });
  it("honors runtime disablement during script download and replaces the loaded document", async () => {
    const fixture = browserFixture("delayed"); const { dispatchPublicPixelEvent } = await import("@/lib/analytics/browser-pixel");
    const pending = dispatchPublicPixelEvent(trackingTestEvent());
    await vi.waitFor(() => expect(fixture.scripts).toHaveLength(1));
    fixture.setPolicy({ ...fixture.policy(), runtimeEnabled: false }); fixture.finish();
    expect(await pending).toBe(false); expect(fixture.handoff).not.toHaveBeenCalledWith("trackSingle", expect.anything(), expect.anything(), expect.anything(), expect.anything()); expect(fixture.location.reload).toHaveBeenCalledOnce();
  });
  it("withdraws synchronously, drops queued application activity and cleans only marketing storage", async () => {
    const fixture = browserFixture("delayed"); const { dispatchPublicPixelEvent, suspendPublicPixel } = await import("@/lib/analytics/browser-pixel");
    const pending = dispatchPublicPixelEvent(trackingTestEvent()); await vi.waitFor(() => expect(fixture.scripts).toHaveLength(1));
    fixture.storage.set("enterfly:meta-checkout:old", "1"); fixture.storage.set("bangbuy:marketing:test", "1"); fixture.storage.set("enterfly:cart:v1", "preserved");
    suspendPublicPixel(true); fixture.finish(); expect(await pending).toBe(false);
    expect(fixture.storage.has("enterfly:meta-checkout:old")).toBe(false); expect(fixture.storage.has("bangbuy:marketing:test")).toBe(false); expect(fixture.storage.get("enterfly:cart:v1")).toBe("preserved");
    expect(fixture.location.reload).toHaveBeenCalledOnce();
    expect(await dispatchPublicPixelEvent({ ...trackingTestEvent(), eventId: "c25e182f-fd6a-43a0-8b66-26678dba4bc0" })).toBe(false);
  });
  it("treats blockers and script failures as non-fatal and discards the failed action", async () => {
    const fixture = browserFixture("failure"); const { dispatchPublicPixelEvent } = await import("@/lib/analytics/browser-pixel");
    const event = trackingTestEvent(); expect(await dispatchPublicPixelEvent(event)).toBe(false); expect(await dispatchPublicPixelEvent(event)).toBe(false); expect(fixture.scripts).toHaveLength(1); expect(fixture.handoff).not.toHaveBeenCalled();
  });
  it("does not trust or call an independently installed SDK", async () => {
    const fixture = browserFixture(); fixture.browser.fbq = vi.fn<(...args: unknown[]) => void>(); const { dispatchPublicPixelEvent } = await import("@/lib/analytics/browser-pixel");
    expect(await dispatchPublicPixelEvent(trackingTestEvent())).toBe(false); expect(fixture.scripts).toEqual([]); expect(fixture.browser.fbq).not.toHaveBeenCalled();
  });
  it("isolates a mutating or throwing SDK from the original approved payload", async () => {
    const fixture = browserFixture(); fixture.handoff.mockImplementation((...args: unknown[]) => { (args[3] as { value: number }).value = 1; throw new Error("synthetic SDK failure"); });
    const { dispatchPublicPixelEvent } = await import("@/lib/analytics/browser-pixel"); const event = trackingTestEvent("ViewContent");
    expect(await dispatchPublicPixelEvent(event)).toBe(false); expect(event.parameters).toMatchObject({ value: 125.5 }); expect(await dispatchPublicPixelEvent(event)).toBe(false); expect(fixture.handoff).toHaveBeenCalledOnce();
  });
  it.each(["enterfly:cart:v1", "enterfly:wishlist:v1", "enterfly:saved-for-later:v1", "enterfly:order:last:v1", "enterfly:meta-checkout:legacy-order", "enterfly:meta-purchase:legacy-order", "bangbuy:locale-draft:checkout"])("vetoes SDK loading when legacy private state remains under %s", async (key) => {
    const fixture = browserFixture(); fixture.storage.set(key, "synthetic-private-value");
    const read = vi.spyOn(fixture.browser.localStorage, "getItem");
    const { dispatchPublicPixelEvent } = await import("@/lib/analytics/browser-pixel");
    expect(await dispatchPublicPixelEvent(trackingTestEvent())).toBe(false); expect(fixture.scripts).toEqual([]); expect(fixture.request).not.toHaveBeenCalled();
    expect(read).not.toHaveBeenCalledWith(key);
  });
  it("fails closed when browser storage cannot be inspected", async () => {
    const fixture = browserFixture(); Object.defineProperty(fixture.browser, "sessionStorage", { get: () => { throw new Error("synthetic restricted storage"); } });
    const { dispatchPublicPixelEvent } = await import("@/lib/analytics/browser-pixel");
    expect(await dispatchPublicPixelEvent(trackingTestEvent())).toBe(false); expect(fixture.scripts).toEqual([]);
  });
  it("does not mistake the current public product choice for legacy private history", async () => {
    const fixture = browserFixture(); fixture.storage.set("bangbuy:public-product-selection", JSON.stringify({ productId: "synthetic-product", selectedVariantId: "synthetic-variant", quantity: 2, savedAt: now }));
    const { dispatchPublicPixelEvent } = await import("@/lib/analytics/browser-pixel");
    expect(await dispatchPublicPixelEvent(trackingTestEvent())).toBe(true); expect(fixture.scripts).toHaveLength(1);
  });
});
