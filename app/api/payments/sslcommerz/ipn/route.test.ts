import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  processSslCommerzNotification: vi.fn(),
  invalidateProductsById: vi.fn(),
  revalidateCacheTags: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/payments", () => ({
  processSslCommerzNotification: mocks.processSslCommerzNotification,
}));
vi.mock("@/lib/cache/catalog-invalidation", () => ({
  invalidateProductsById: mocks.invalidateProductsById,
}));
vi.mock("@/lib/cache/revalidation", () => ({
  revalidateCacheTags: mocks.revalidateCacheTags,
}));

import { ServiceError } from "@/lib/services/service-error";
import { POST } from "@/app/api/payments/sslcommerz/ipn/route";

const validNotification = {
  tran_id: "BB-TRANSACTION-1",
  val_id: "VALIDATION-1",
  status: "VALID",
  amount: "1250.00",
  currency: "BDT",
};

function formRequest(
  fields: Record<string, string> = validNotification,
  headers?: HeadersInit,
) {
  return new Request("http://localhost/api/payments/sslcommerz/ipn", {
    method: "POST",
    headers,
    body: new URLSearchParams(fields),
  });
}

describe("POST /api/payments/sslcommerz/ipn", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.processSslCommerzNotification.mockResolvedValue({
      orderId: "order-1",
      paymentId: "payment-1",
      status: "SUCCESS",
      duplicate: false,
      requiresReview: false,
      affectedProductIds: [],
    });
    mocks.invalidateProductsById.mockResolvedValue(undefined);
  });

  it("rejects a declared body larger than 64 KiB before parsing it", async () => {
    const response = await POST(
      formRequest(validNotification, {
        "content-type": "application/x-www-form-urlencoded",
        "content-length": String(64 * 1024 + 1),
      }),
    );

    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toEqual({
      error: "Payment notification is too large.",
    });
    expect(mocks.processSslCommerzNotification).not.toHaveBeenCalled();
  });

  it("accepts only provider form encodings", async () => {
    const response = await POST(
      new Request("http://localhost/api/payments/sslcommerz/ipn", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(validNotification),
      }),
    );

    expect(response.status).toBe(415);
    await expect(response.json()).resolves.toEqual({
      error: "Payment notification must use form encoding.",
    });
    expect(mocks.processSslCommerzNotification).not.toHaveBeenCalled();
  });

  it("returns 400 when a multipart form cannot be decoded", async () => {
    const response = await POST(
      new Request("http://localhost/api/payments/sslcommerz/ipn", {
        method: "POST",
        headers: { "content-type": "multipart/form-data" },
        body: "not-a-multipart-body",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid payment notification.",
    });
    expect(mocks.processSslCommerzNotification).not.toHaveBeenCalled();
  });

  it("returns field errors without invoking the payment service", async () => {
    const response = await POST(
      formRequest({
        tran_id: "",
        val_id: "",
        status: "valid",
        currency: "TAKA",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Invalid payment notification.",
      fieldErrors: {
        tran_id: expect.any(Array),
        status: expect.any(Array),
        currency: expect.any(Array),
      },
    });
    expect(mocks.processSslCommerzNotification).not.toHaveBeenCalled();
  });

  it("requires a validation ID only for successful notifications", async () => {
    const missingSuccessValidation = await POST(
      formRequest({
        tran_id: "BB-TRANSACTION-1",
        status: "VALID",
      }),
    );
    expect(missingSuccessValidation.status).toBe(400);
    await expect(missingSuccessValidation.json()).resolves.toMatchObject({
      fieldErrors: { val_id: expect.any(Array) },
    });

    mocks.processSslCommerzNotification.mockResolvedValue({
      orderId: "order-1",
      paymentId: "payment-1",
      status: "FAILED",
      duplicate: false,
      requiresReview: false,
      affectedProductIds: [],
    });
    const failedWithoutValidation = await POST(
      formRequest({
        tran_id: "BB-TRANSACTION-1",
        status: "FAILED",
      }),
    );
    expect(failedWithoutValidation.status).toBe(200);
    expect(mocks.processSslCommerzNotification).toHaveBeenLastCalledWith({
      tran_id: "BB-TRANSACTION-1",
      val_id: "",
      status: "FAILED",
    });
  });

  it("passes only normalized, validated provider fields to the service", async () => {
    const response = await POST(
      formRequest({
        tran_id: " BB-TRANSACTION-1 ",
        val_id: " VALIDATION-1 ",
        status: "VALID",
        amount: "1250.00",
        currency: "bdt",
        value_a: " order-1 ",
        ignored_card_number: "4111111111111111",
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.processSslCommerzNotification).toHaveBeenCalledWith({
      tran_id: "BB-TRANSACTION-1",
      val_id: "VALIDATION-1",
      status: "VALID",
      amount: "1250.00",
      currency: "BDT",
      value_a: "order-1",
    });
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: {
        received: true,
        status: "SUCCESS",
        duplicate: false,
        requiresReview: false,
      },
    });
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(mocks.invalidateProductsById).not.toHaveBeenCalled();
    expect(mocks.revalidateCacheTags).toHaveBeenCalledWith([
      "admin-orders",
      "promo-codes",
    ]);
  });

  it("invalidates restored products and exposes duplicate/review semantics", async () => {
    mocks.processSslCommerzNotification.mockResolvedValue({
      orderId: "order-2",
      paymentId: "payment-2",
      status: "CANCELLED",
      duplicate: true,
      requiresReview: true,
      affectedProductIds: ["product-1", "product-2"],
    });

    const response = await POST(formRequest());

    expect(response.status).toBe(200);
    expect(mocks.invalidateProductsById).toHaveBeenCalledWith(
      ["product-1", "product-2"],
      {
        reason: "payment cancelled stock restore: order-2",
      },
    );
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      data: {
        status: "CANCELLED",
        duplicate: true,
        requiresReview: true,
      },
    });
  });

  it("preserves typed payment-service errors", async () => {
    mocks.processSslCommerzNotification.mockRejectedValue(
      new ServiceError(422, "Validated payment amount does not match."),
    );

    const response = await POST(formRequest());

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toEqual({
      error: "Validated payment amount does not match.",
    });
    expect(mocks.revalidateCacheTags).not.toHaveBeenCalled();
  });
});
