import { z } from "zod";

/** External events are deliberately narrower than commerce objects. */
export const TRACKING_EVENT_NAMES = ["PageView", "ViewContent", "AddToCart", "InitiateCheckout", "Purchase", "OrderPlaced"] as const;
export type TrackingEventName = (typeof TRACKING_EVENT_NAMES)[number];
export const TRACKING_FIELDS = ["content_ids", "content_type", "contents", "value", "currency", "num_items"] as const;
export type TrackingField = (typeof TRACKING_FIELDS)[number];
export const MATCHING_FIELDS = ["fbp", "fbc", "client_user_agent"] as const;
export type TrackingMatchingField = (typeof MATCHING_FIELDS)[number];

const amount = z.number().finite().nonnegative().refine((value) => Number.isSafeInteger(Math.round(value * 100)) && Math.abs(value * 100 - Math.round(value * 100)) < 0.00001, "Expected numeric monetary major units with at most two decimals");
const contentId = z.string().regex(/^[A-Za-z0-9_.:-]{1,128}$/);
const currency = z.enum(["BDT", "AUD", "EUR", "GBP", "USD", "CNY"]);
const item = z.object({ id: contentId, quantity: z.number().int().min(1).max(1000), item_price: amount }).strict();
const money = { value: amount, currency };
const commerce = {
  ...money,
  content_ids: z.array(contentId).min(1).max(100),
  content_type: z.literal("product"),
  contents: z.array(item).min(1).max(100),
  num_items: z.number().int().min(1).max(100000),
};
const identity = { eventId: z.string().uuid(), eventTime: z.number().int().positive() };
const conversion = z.object({
  ...money,
  content_ids: commerce.content_ids.optional(),
  content_type: commerce.content_type.optional(),
  contents: commerce.contents.optional(),
  num_items: commerce.num_items.optional(),
}).strict();

export const trackingEventSchema = z.discriminatedUnion("name", [
  z.object({ ...identity, name: z.literal("PageView"), parameters: z.object({}).strict() }).strict(),
  z.object({ ...identity, name: z.literal("ViewContent"), parameters: z.object(commerce).strict() }).strict(),
  z.object({ ...identity, name: z.literal("AddToCart"), parameters: z.object(commerce).strict() }).strict(),
  z.object({ ...identity, name: z.literal("InitiateCheckout"), parameters: conversion }).strict(),
  z.object({ ...identity, name: z.literal("Purchase"), parameters: conversion }).strict(),
  z.object({ ...identity, name: z.literal("OrderPlaced"), parameters: conversion }).strict(),
]);
export type TrackingEvent = z.infer<typeof trackingEventSchema>;

export const META_EVENT_MAPPING: Readonly<Record<TrackingEventName, Exclude<TrackingEventName, "OrderPlaced"> | null>> = Object.freeze({
  PageView: "PageView", ViewContent: "ViewContent", AddToCart: "AddToCart", InitiateCheckout: "InitiateCheckout", Purchase: "Purchase", OrderPlaced: null,
});

/** Invalid or private fields are rejected, never silently stripped. */
export function parseTrackingEvent(value: unknown): TrackingEvent | null {
  const result = trackingEventSchema.safeParse(value);
  if (!result.success) return null;
  const event = result.data;
  if ("contents" in event.parameters && event.parameters.contents) {
    const contents = event.parameters.contents;
    const ids = event.parameters.content_ids;
    if (!ids || event.parameters.content_type !== "product" || event.parameters.num_items !== contents.reduce((sum, entry) => sum + entry.quantity, 0)) return null;
    if (new Set(ids).size !== ids.length || contents.some((entry) => !ids.includes(entry.id)) || ids.some((id) => !contents.some((entry) => entry.id === id))) return null;
  } else if ("content_ids" in event.parameters && (event.parameters.content_ids || event.parameters.content_type || event.parameters.num_items)) {
    return null;
  }
  return event;
}
