import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CartItem } from "@/features/cart/api";
import type { PlaceOrderRequest } from "@/features/checkout/api";
import type { CommerceItem } from "@/lib/analytics/ecommerce";
type PixelCommand = unknown[];
type TestPixel = ((...args: unknown[]) => void) & {
    queue?: ArrayLike<unknown>[];
    callMethod?: (...args: unknown[]) => void;
};
function fakeBrowser(storage = new Map<string, string>()) {
    const scripts: Array<Record<string, unknown>> = [];
    const appendChild = vi.fn((script: Record<string, unknown>) => {
        scripts.push(script);
        return script;
    });
    const firstScript = { parentNode: { insertBefore: appendChild } };
    const document = {
        head: { appendChild },
        body: { appendChild },
        createElement: vi.fn(() => ({ setAttribute: vi.fn() })),
        getElementById: vi.fn((id: string) => scripts.find((script) => script.id === id)),
        querySelector: vi.fn(() => scripts[0] ?? null),
        getElementsByTagName: vi.fn(() => [firstScript]),
    };
    const browser: {
        fbq?: TestPixel;
        _fbq?: TestPixel;
        document: typeof document;
        location: {
            href: string;
            pathname: string;
            search: string;
        };
        localStorage: {
            readonly length: number;
            key: (index: number) => string | null;
            getItem: (key: string) => string | null;
            setItem: (key: string, value: string) => void;
            removeItem: (key: string) => void;
        };
    } = {
        document,
        location: { href: "https://bangbuy.test/products/shirt", pathname: "/products/shirt", search: "" },
        localStorage: {
            get length() { return storage.size; },
            key: (index) => [...storage.keys()][index] ?? null,
            getItem: (key) => storage.get(key) ?? null,
            setItem: (key, value) => { storage.set(key, value); },
            removeItem: (key) => { storage.delete(key); },
        },
    };
    vi.stubGlobal("window", browser);
    vi.stubGlobal("document", document);
    return { browser, scripts, storage };
}
function queuedCommands(browser: ReturnType<typeof fakeBrowser>["browser"]): PixelCommand[] {
    return (browser.fbq?.queue ?? []).map((command) => Array.from(command));
}
async function observeInteractions() {
    const pixel = await import("@/lib/analytics/meta-pixel");
    const events: import("@/lib/analytics/events").TrackingEvent[] = [];
    pixel.subscribeFirstPartyInteractions(event => events.push(event));
    return { pixel, events };
}
function purchaseSnapshot(overrides: Record<string, unknown> = {}) {
    return {
        eventId: "purchase:order-confirmed-1", eventTime: 1791072000,
        items: [{ ...commerceItem }], currency: "BDT" as const, value: 980,
        ...overrides,
    };
}
const commerceItem: CommerceItem = {
    productId: "product-shirt",
    productCode: "CATALOG-SHIRT",
    variantId: "variant-red-large",
    name: "Shirt",
    quantity: 2,
    unitPrice: 450,
};
function serverLine(overrides: Partial<CartItem> = {}): CartItem {
    return {
        id: "cart-row",
        productId: "product-shirt",
        productCode: "CATALOG-SHIRT",
        variantId: "variant-red-large",
        name: "Shirt",
        image: null,
        quantity: 8,
        unitPrice: 450,
        originalPrice: 500,
        lineTotal: 3600,
        stock: 20,
        status: "ACTIVE",
        ...overrides,
    };
}
function envelopeResponse(data: unknown, status = 200): Response {
    return new Response(JSON.stringify({ success: status < 400, data, message: "Cart rejected" }), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}
beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_META_PIXEL_ID", "1234567890");
});
afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
});
describe("legacy commerce helpers never load a marketing SDK", () => {
    it("keeps repeated legacy initialization and delayed actions inert without a subscriber", async () => {
        const { browser, scripts } = fakeBrowser();
        const pixel = await import("@/lib/analytics/meta-pixel");
        expect(pixel.initializeMetaPixel()).toBe(false);
        expect(pixel.initializeMetaPixel()).toBe(false);
        pixel.trackPageView("/products/shirt");
        pixel.trackAddToCart(commerceItem, pixel.createEventId());
        expect(queuedCommands(browser)).toEqual([]);
        expect(scripts).toEqual([]);
    });
    it("disables delivery without configuration and is safe during server execution", async () => {
        const { browser, scripts } = fakeBrowser();
        vi.stubEnv("NEXT_PUBLIC_META_PIXEL_ID", "");
        const pixel = await import("@/lib/analytics/meta-pixel");
        expect(pixel.initializeMetaPixel()).toBe(false);
        pixel.trackAddToCart(commerceItem, pixel.createEventId());
        expect(queuedCommands(browser)).toEqual([]);
        expect(scripts).toEqual([]);
        vi.stubGlobal("window", undefined);
        vi.stubGlobal("document", undefined);
        expect(() => pixel.trackViewContent(commerceItem, pixel.createEventId())).not.toThrow();
        expect(pixel.initializeMetaPixel()).toBe(false);
    });
    it("deduplicates first-party callbacks while retaining independent additions", async () => {
        const { browser, scripts } = fakeBrowser();
        const { pixel, events } = await observeInteractions();
        const first = pixel.createEventId(), second = pixel.createEventId();
        pixel.trackAddToCart(commerceItem, first);
        pixel.trackAddToCart(commerceItem, first);
        pixel.trackAddToCart(commerceItem, second);
        pixel.trackViewContent(commerceItem, first);
        expect(events.map(event => [event.name, event.eventId])).toEqual([["AddToCart", first], ["AddToCart", second], ["ViewContent", first]]);
        expect(queuedCommands(browser)).toEqual([]);
        expect(scripts).toEqual([]);
    });
    it("drops unobserved actions without replaying them when a subscriber appears", async () => {
        fakeBrowser();
        const pixel = await import("@/lib/analytics/meta-pixel");
        pixel.trackAddToCart(commerceItem, pixel.createEventId());
        const { events } = await observeInteractions();
        expect(events).toEqual([]);
        pixel.trackAddToCart(commerceItem, pixel.createEventId());
        expect(events).toHaveLength(1);
    });
    it("does not let legacy consent setters create SDK state or queued replay", async () => {
        const { browser, scripts } = fakeBrowser();
        const pixel = await import("@/lib/analytics/meta-pixel");
        pixel.trackAddToCart(commerceItem, pixel.createEventId());
        pixel.setMetaPixelConsent(false);
        pixel.setMetaPixelConsent(true);
        pixel.trackAddToCart(commerceItem, pixel.createEventId());
        expect(queuedCommands(browser)).toEqual([]);
        expect(scripts).toEqual([]);
    });
    it("assigns genuine later navigation identities and suppresses repeated first-party effects", async () => {
        const { browser } = fakeBrowser();
        const { pixel, events } = await observeInteractions();
        pixel.trackPageView("/products/shirt");
        const first = pixel.getNavigationEventId("product", "/products/shirt");
        expect(pixel.getNavigationEventId("product", "/products/shirt")).toBe(first);
        pixel.trackPageView("/products/shirt");
        pixel.trackPageView("/cart");
        pixel.trackPageView("/products/shirt");
        expect(pixel.getNavigationEventId("product", "/products/shirt")).not.toBe(first);
        expect(events.filter(event => event.name === "PageView")).toHaveLength(3);
        expect(new Set(events.map(event => event.eventId)).size).toBe(3);
        expect(queuedCommands(browser)).toEqual([]);
    });
    it("projects only the typed first-party InitiateCheckout snapshot without browser delivery", async () => {
        const { browser } = fakeBrowser();
        const { pixel, events } = await observeInteractions();
        const id = pixel.createEventId();
        const snapshot = { items: [{ ...commerceItem, unitPrice: 12.5 }], currency: "USD" as const, value: 28.75 };
        pixel.trackInitiateCheckout(snapshot, id);
        pixel.trackInitiateCheckout(snapshot, id);
        expect(events).toEqual([{ name: "InitiateCheckout", eventId: id, eventTime: expect.any(Number), parameters: { content_ids: ["CATALOG-SHIRT"], content_type: "product", contents: [{ id: "CATALOG-SHIRT", quantity: 2, item_price: 12.5 }], num_items: 2, value: 28.75, currency: "USD" } }]);
        expect(queuedCommands(browser)).toEqual([]);
    });
    it("does not create Purchase markers across repeated callbacks or document refresh", async () => {
        const initial = fakeBrowser();
        const pixel = await import("@/lib/analytics/meta-pixel");
        const snapshot = purchaseSnapshot();
        pixel.trackPurchase(snapshot, snapshot.eventId);
        pixel.trackPurchase(snapshot, snapshot.eventId);
        expect(initial.storage.size).toBe(0);
        expect(initial.scripts).toEqual([]);
        expect(initial.browser.fbq).toBeUndefined();
        vi.resetModules();
        const refreshed = fakeBrowser(initial.storage);
        const again = await import("@/lib/analytics/meta-pixel");
        again.trackPurchase(snapshot, snapshot.eventId);
        const next = purchaseSnapshot({ eventId: "purchase:next" });
        again.trackPurchase(next, next.eventId);
        expect(refreshed.storage.size).toBe(0);
        expect(refreshed.scripts).toEqual([]);
        expect(refreshed.browser.fbq).toBeUndefined();
    });
    it("does not queue delayed Purchase for retry after a refresh", async () => {
        const initial = fakeBrowser();
        const pixel = await import("@/lib/analytics/meta-pixel");
        const snapshot = purchaseSnapshot();
        pixel.trackPurchase(snapshot, snapshot.eventId);
        vi.resetModules();
        const refreshed = fakeBrowser(initial.storage);
        const again = await import("@/lib/analytics/meta-pixel");
        again.trackPurchase(snapshot, snapshot.eventId);
        expect(refreshed.storage.size).toBe(0);
        expect(refreshed.scripts).toEqual([]);
        expect(refreshed.browser.fbq).toBeUndefined();
    });
    it("keeps mutated or cleared purchase snapshots out of browser delivery", async () => {
        const { browser, scripts, storage } = fakeBrowser();
        const pixel = await import("@/lib/analytics/meta-pixel");
        const snapshot = purchaseSnapshot();
        pixel.trackPurchase(snapshot, snapshot.eventId);
        snapshot.value = 1500;
        snapshot.items[0].unitPrice = 999;
        snapshot.items.splice(0);
        pixel.trackPurchase(snapshot, snapshot.eventId);
        expect(browser.fbq).toBeUndefined();
        expect(scripts).toEqual([]);
        expect(storage.size).toBe(0);
    });
    it.each([undefined, null, "", "980", "৳980", "980 BDT", "1,500", NaN, Infinity, -1, 0, 980.123])("rejects invalid purchase value %s without using product sums", async (value) => {
        const { browser, scripts, storage } = fakeBrowser();
        const pixel = await import("@/lib/analytics/meta-pixel");
        const snapshot = purchaseSnapshot({ value });
        const { validatePurchaseSnapshot } = await import("@/lib/analytics/purchase-payload");
        expect(validatePurchaseSnapshot(snapshot).valid).toBe(false);
        pixel.trackPurchase(snapshot, snapshot.eventId);
        expect(browser.fbq).toBeUndefined();
        expect(scripts).toEqual([]);
        expect(storage.size).toBe(0);
    });
    it.each([undefined, null, "", "XYZ", "bdt"])("rejects unsupported purchase currency %s", async (currency) => {
        const { browser, scripts } = fakeBrowser();
        const pixel = await import("@/lib/analytics/meta-pixel");
        const snapshot = purchaseSnapshot({ currency });
        const { validatePurchaseSnapshot } = await import("@/lib/analytics/purchase-payload");
        expect(validatePurchaseSnapshot(snapshot).valid).toBe(false);
        pixel.trackPurchase(snapshot, snapshot.eventId);
        expect(browser.fbq).toBeUndefined();
        expect(scripts).toEqual([]);
    });
    it("preserves valid required saved parameters without sending a catalog-free browser Purchase", async () => {
        const { browser, scripts } = fakeBrowser();
        const pixel = await import("@/lib/analytics/meta-pixel");
        const snapshot = purchaseSnapshot({ items: [], value: 1500.25 });
        const { buildPurchaseEventParameters } = await import("@/lib/analytics/purchase-payload");
        expect(buildPurchaseEventParameters(snapshot)).toEqual({ value: 1500.25, currency: "BDT" });
        pixel.trackPurchase(snapshot, snapshot.eventId);
        expect(browser.fbq).toBeUndefined();
        expect(scripts).toEqual([]);
    });
    it("does not convert mismatched identities or missing conversion timestamps", async () => {
        const { browser, scripts } = fakeBrowser();
        const pixel = await import("@/lib/analytics/meta-pixel");
        const snapshot = purchaseSnapshot();
        pixel.trackPurchase(snapshot, "purchase:another");
        pixel.trackPurchase({ ...snapshot, eventTime: undefined }, snapshot.eventId);
        expect(browser.fbq).toBeUndefined();
        expect(scripts).toEqual([]);
    });
    it("does not attempt a failed script or retry Purchase from private callers", async () => {
        const { browser, scripts, storage } = fakeBrowser();
        const pixel = await import("@/lib/analytics/meta-pixel");
        const snapshot = purchaseSnapshot();
        pixel.trackPurchase(snapshot, snapshot.eventId);
        pixel.trackPurchase(snapshot, snapshot.eventId);
        expect(browser.fbq).toBeUndefined();
        expect(scripts).toEqual([]);
        expect(storage.size).toBe(0);
    });
    it("never hands a Purchase to an independently installed throwing SDK", async () => {
        const { browser, storage } = fakeBrowser();
        const external = vi.fn(() => { throw new Error("blocked SDK"); });
        browser.fbq = external;
        const pixel = await import("@/lib/analytics/meta-pixel");
        const snapshot = purchaseSnapshot();
        expect(() => pixel.trackPurchase(snapshot, snapshot.eventId)).not.toThrow();
        expect(external).not.toHaveBeenCalled();
        expect(storage.size).toBe(0);
    });
    it("never exposes saved amount or metadata to a mutating external SDK", async () => {
        const { browser, storage } = fakeBrowser();
        const external = vi.fn((...args: unknown[]) => { Object.assign(args[3] as object, { value: 1, currency: "USD" }); throw new Error("mutated"); });
        browser.fbq = external;
        const pixel = await import("@/lib/analytics/meta-pixel");
        const snapshot = purchaseSnapshot();
        pixel.trackPurchase(snapshot, snapshot.eventId);
        expect(external).not.toHaveBeenCalled();
        expect(snapshot.value).toBe(980);
        expect(snapshot.items[0].unitPrice).toBe(450);
        expect(storage.size).toBe(0);
    });
    it("discards denied and revoked legacy Purchase attempts without later replay", async () => {
        const { browser, scripts, storage } = fakeBrowser();
        const pixel = await import("@/lib/analytics/meta-pixel");
        const denied = purchaseSnapshot();
        pixel.setMetaPixelConsent(false);
        pixel.trackPurchase(denied, denied.eventId);
        pixel.setMetaPixelConsent(true);
        const revoked = purchaseSnapshot({ eventId: "purchase:revoked" });
        pixel.trackPurchase(revoked, revoked.eventId);
        pixel.setMetaPixelConsent(false);
        pixel.setMetaPixelConsent(true);
        pixel.trackPurchase(denied, denied.eventId);
        pixel.trackPurchase(revoked, revoked.eventId);
        expect(browser.fbq).toBeUndefined();
        expect(scripts).toEqual([]);
        expect(storage.size).toBe(0);
    });
    it("does not replay historical browser markers or mutate them during receipt reads", async () => {
        const { browser, scripts, storage } = fakeBrowser();
        const snapshot = purchaseSnapshot();
        storage.set("enterfly:meta-purchase:1234567890:" + snapshot.eventId, "1");
        const pixel = await import("@/lib/analytics/meta-pixel");
        pixel.trackPurchase(snapshot, snapshot.eventId);
        expect(browser.fbq).toBeUndefined();
        expect(scripts).toEqual([]);
        expect(storage.size).toBe(1);
    });
    it("does not let a throwing first-party listener escape into business code", async () => {
        fakeBrowser();
        const pixel = await import("@/lib/analytics/meta-pixel");
        pixel.subscribeFirstPartyInteractions(() => { throw new Error("unavailable marketing"); });
        expect(() => pixel.trackAddToCart(commerceItem, pixel.createEventId())).not.toThrow();
        expect(() => pixel.trackPageView("/cart")).not.toThrow();
    });
});
describe("confirmed cart operations emit AddToCart", () => {
    it("tracks a simple-product server success from canonical response data", async () => {
        const { browser } = fakeBrowser();
        const { events } = await observeInteractions();
        const line = serverLine({ variantId: "default-variant", quantity: 5, unitPrice: 425 });
        const fetchMock = vi.fn().mockResolvedValue(envelopeResponse(line));
        vi.stubGlobal("fetch", fetchMock);
        const { createCartItemOnServer } = await import("@/features/cart/api");
        await expect(createCartItemOnServer("product-shirt", 1)).resolves.toEqual(line);
        expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ productId: "product-shirt", quantity: 1 });
        expect(events).toEqual([
            expect.objectContaining({ name: "AddToCart", parameters: expect.objectContaining({
                    content_ids: ["CATALOG-SHIRT"],
                    contents: [{ id: "CATALOG-SHIRT", quantity: 1, item_price: 425 }],
                    value: 425,
                    currency: "BDT",
                }), eventId: expect.any(String) }),
        ]);
        expect(queuedCommands(browser)).toEqual([]);
    });
    it("captures the submitted variant and quantity while selections change during the request", async () => {
        const { browser } = fakeBrowser();
        const { events } = await observeInteractions();
        let completeRequest!: (response: Response) => void;
        const fetchMock = vi.fn<typeof fetch>().mockImplementation(() => new Promise<Response>((resolve) => { completeRequest = resolve; }));
        vi.stubGlobal("fetch", fetchMock);
        const { createCartItemOnServer } = await import("@/features/cart/api");
        let selectedVariant = "variant-blue-small";
        selectedVariant = "variant-red-large";
        let quantity = 3;
        const operation = createCartItemOnServer("product-shirt", quantity, selectedVariant);
        selectedVariant = "variant-green-medium";
        quantity = 9;
        expect(queuedCommands(browser).filter((command) => command[1] === "AddToCart")).toEqual([]);
        expect(events).toEqual([]);
        completeRequest(envelopeResponse(serverLine()));
        await operation;
        expect(selectedVariant).toBe("variant-green-medium");
        expect(quantity).toBe(9);
        expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({
            productId: "product-shirt", variantId: "variant-red-large", quantity: 3,
        });
        expect(events).toEqual([
            expect.objectContaining({ name: "AddToCart", parameters: expect.objectContaining({
                    contents: [{ id: "CATALOG-SHIRT", quantity: 3, item_price: 450 }],
                    value: 1350,
                }), eventId: expect.any(String) }),
        ]);
        expect(JSON.stringify(events)).not.toContain("variant-red-large");
        expect(queuedCommands(browser)).toEqual([]);
    });
    it("gives two independent successful additions of the same variant different event identities", async () => {
        const { browser } = fakeBrowser();
        const { events } = await observeInteractions();
        vi.stubGlobal("fetch", vi.fn().mockImplementation(() => Promise.resolve(envelopeResponse(serverLine()))));
        const { addToCartOnServer } = await import("@/features/cart/api");
        await addToCartOnServer("product-shirt", 1, "variant-red-large");
        await addToCartOnServer("product-shirt", 1, "variant-red-large");
        expect(events).toHaveLength(2);
        expect(events[0].eventId).not.toEqual(events[1].eventId);
        expect(queuedCommands(browser)).toEqual([]);
    });
    it("deduplicates repeated cart callbacks that share an operation identity", async () => {
        const { browser } = fakeBrowser();
        const { events, pixel } = await observeInteractions();
        const eventId = pixel.createEventId();
        vi.stubGlobal("fetch", vi.fn().mockImplementation(() => Promise.resolve(envelopeResponse(serverLine()))));
        const { createCartItemOnServer } = await import("@/features/cart/api");
        await createCartItemOnServer("product-shirt", 2, "variant-red-large", eventId);
        await createCartItemOnServer("product-shirt", 2, "variant-red-large", eventId);
        expect(events).toEqual([expect.objectContaining({ name: "AddToCart", parameters: expect.objectContaining({ value: 900 }), eventId })]);
        expect(queuedCommands(browser)).toEqual([]);
    });
    it.each([
        ["missing required variant", 400, 1, undefined],
        ["unavailable stock", 409, 1, "variant-red-large"],
        ["invalid quantity", 400, 0, "variant-red-large"],
        ["failed server cart request", 503, 1, "variant-red-large"],
    ] as const)("emits nothing for %s", async (_reason, status, quantity, variantId) => {
        const { browser } = fakeBrowser();
        const { events } = await observeInteractions();
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(envelopeResponse(null, status)));
        const { createCartItemOnServer } = await import("@/features/cart/api");
        await expect(createCartItemOnServer("product-shirt", quantity, variantId)).rejects.toThrow("Cart rejected");
        expect(queuedCommands(browser).filter((command) => command[0] === "track")).toEqual([]);
        expect(events).toEqual([]);
    });
    it("emits nothing on a network failure and preserves the cart failure", async () => {
        const { browser } = fakeBrowser();
        const { events } = await observeInteractions();
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network offline")));
        const { createCartItemOnServer } = await import("@/features/cart/api");
        await expect(createCartItemOnServer("product-shirt", 1)).rejects.toThrow("Network offline");
        expect(queuedCommands(browser).filter((command) => command[0] === "track")).toEqual([]);
        expect(events).toEqual([]);
    });
    it("returns the successfully persisted cart line even if analytics throws", async () => {
        const { browser } = fakeBrowser();
        browser.fbq = vi.fn(() => { throw new Error("analytics unavailable"); });
        const line = serverLine();
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(envelopeResponse(line)));
        const { createCartItemOnServer } = await import("@/features/cart/api");
        await expect(createCartItemOnServer("product-shirt", 2, "variant-red-large")).resolves.toEqual(line);
    });
    it("tracks only the actual persisted guest-cart increase when stock caps the addition", async () => {
        const { browser } = fakeBrowser();
        const { events, pixel } = await observeInteractions();
        const eventId = pixel.createEventId();
        const { upsertLocalCartItem, writeLocalCart } = await import("@/features/cart/storage");
        const { trackLocalCartAddition } = await import("@/lib/analytics/meta-pixel");
        const before = [serverLine({ quantity: 4, stock: 5 })];
        const after = upsertLocalCartItem(before, serverLine({ quantity: 3, stock: 5 }));
        writeLocalCart(after);
        trackLocalCartAddition(before, after, eventId);
        trackLocalCartAddition(before, after, eventId);
        trackLocalCartAddition(after, after, pixel.createEventId());
        trackLocalCartAddition(after, [], pixel.createEventId());
        expect(events).toEqual([
            expect.objectContaining({ name: "AddToCart", parameters: expect.objectContaining({
                    contents: [{ id: "CATALOG-SHIRT", quantity: 1, item_price: 450 }],
                    value: 450,
                }), eventId }),
        ]);
        expect(queuedCommands(browser)).toEqual([]);
    });
    it.each([
        ["zero stock", { stock: 0 }],
        ["inactive product", { status: "INACTIVE" as const }],
        ["quantity beyond stock", { quantity: 6, stock: 5 }],
    ])("does not report a guest addition with %s", async (_reason, overrides) => {
        const { browser } = fakeBrowser();
        const { events, pixel } = await observeInteractions();
        const { trackLocalCartAddition } = await import("@/lib/analytics/meta-pixel");
        trackLocalCartAddition([], [serverLine({ quantity: 1, ...overrides })], pixel.createEventId());
        expect(queuedCommands(browser).filter((command) => command[0] === "track")).toEqual([]);
        expect(events).toEqual([]);
    });
});
describe("payment purchase attribution", () => {
    const request: PlaceOrderRequest = {
        customerName: "Test buyer",
        customerPhone: "01700000000",
        customerAddress: "Test address",
        deliveryZone: "INSIDE_DHAKA",
        paymentMethod: "SSLCOMMERZ",
    };
    const result = { order: { id: "new-order", orderNumber: "TEST-ORDER" }, summary: {}, promo: null };
    it.each(["SSLCOMMERZ", "AIRWALLEX"] as const)("keeps committed %s checkout and gateway return free of browser intent storage", async (paymentMethod) => {
        const { browser, storage } = fakeBrowser();
        let finishRequest!: (response: Response) => void;
        vi.stubGlobal("fetch", vi.fn(() => new Promise<Response>((resolve) => { finishRequest = resolve; })));
        const pixel = await import("@/lib/analytics/meta-pixel");
        const { placeCheckoutOrder } = await import("@/features/checkout/api");
        expect(pixel.hasPurchaseIntent("new-order")).toBe(false);
        const operation = placeCheckoutOrder({ ...request, paymentMethod });
        expect(pixel.hasPurchaseIntent("new-order")).toBe(false);
        finishRequest(envelopeResponse(result));
        await expect(operation).resolves.toEqual(result);
        expect(pixel.hasPurchaseIntent("new-order")).toBe(false);
        expect(queuedCommands(browser).filter((command) => command[1] === "Purchase")).toEqual([]);
        vi.resetModules();
        fakeBrowser(storage);
        const refreshed = await import("@/lib/analytics/meta-pixel");
        expect(refreshed.hasPurchaseIntent("new-order")).toBe(false);
        expect(refreshed.hasPurchaseIntent("historical-order")).toBe(false);
        expect(storage.size).toBe(0);
    });
    it("does not create online-payment attribution for a COD order", async () => {
        fakeBrowser();
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(envelopeResponse(result)));
        const { placeCheckoutOrder } = await import("@/features/checkout/api");
        const pixel = await import("@/lib/analytics/meta-pixel");
        await placeCheckoutOrder({ ...request, paymentMethod: "CASH_ON_DELIVERY" });
        expect(pixel.hasPurchaseIntent("new-order")).toBe(false);
    });
    it("does not create intent after failed checkout or without granted consent", async () => {
        const { browser, storage } = fakeBrowser();
        const fetchMock = vi.fn().mockResolvedValueOnce(envelopeResponse(null, 503)).mockResolvedValueOnce(envelopeResponse(result));
        vi.stubGlobal("fetch", fetchMock);
        const { placeCheckoutOrder } = await import("@/features/checkout/api");
        const pixel = await import("@/lib/analytics/meta-pixel");
        await expect(placeCheckoutOrder(request)).rejects.toThrow("Cart rejected");
        expect(pixel.hasPurchaseIntent("new-order")).toBe(false);
        pixel.setMetaPixelConsent(false);
        await expect(placeCheckoutOrder(request)).resolves.toEqual(result);
        expect(pixel.hasPurchaseIntent("new-order")).toBe(false);
        expect(storage.size).toBe(0);
        expect(queuedCommands(browser).filter((command) => command[0] === "track")).toEqual([]);
    });
    it("never trusts legacy pending attribution from this or previous documents", async () => {
        const { storage } = fakeBrowser();
        const pixel = await import("@/lib/analytics/meta-pixel");
        storage.set("enterfly:meta-checkout:1234567890:prior-document-order", "1");
        storage.set("unrelated-storage", "preserved");
        pixel.registerPurchaseIntent("current-order");
        expect(pixel.hasPurchaseIntent("prior-document-order")).toBe(false);
        expect(pixel.hasPurchaseIntent("current-order")).toBe(false);
        pixel.setMetaPixelConsent(false);
        pixel.setMetaPixelConsent(true);
        expect(pixel.hasPurchaseIntent("prior-document-order")).toBe(false);
        expect(pixel.hasPurchaseIntent("current-order")).toBe(false);
        expect(storage.get("unrelated-storage")).toBe("preserved");
        pixel.registerPurchaseIntent("later-order");
        expect(pixel.hasPurchaseIntent("later-order")).toBe(false);
    });
    it("keeps browser intents unavailable when storage deletion throws or a later intent is requested", async () => {
        const { browser, storage } = fakeBrowser();
        const pixel = await import("@/lib/analytics/meta-pixel");
        pixel.registerPurchaseIntent("old-order");
        browser.localStorage.removeItem = () => { throw new Error("Storage deletion denied"); };
        pixel.setMetaPixelConsent(false);
        pixel.setMetaPixelConsent(true);
        expect(storage.has("enterfly:meta-checkout:1234567890:old-order")).toBe(false);
        expect(pixel.hasPurchaseIntent("old-order")).toBe(false);
        pixel.registerPurchaseIntent("fresh-order");
        expect(pixel.hasPurchaseIntent("fresh-order")).toBe(false);
    });
});
