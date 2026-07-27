import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  SslCommerzConfigurationError,
  SslCommerzGatewayResponseError,
  SslCommerzInputError,
  SslCommerzNetworkError,
} from "../gateways/sslcommerz/sslcommerz.types";
import type { SslCommerzSessionInput } from "../gateways/sslcommerz/sslcommerz.types";
import {
  createSslCommerzSession,
  querySslCommerzTransaction,
  validateSslCommerzPayment,
} from "../gateways/sslcommerz/sslcommerz.service";

const STORE_ID = "test-store";
const STORE_PASSWORD = "qwerty-secret";
const FULL_CARD_NUMBER = "4111111111111111";

function sessionInput(): SslCommerzSessionInput {
  return {
    transactionId: "BB-20260726-abc123",
    orderId: "order_123",
    paymentRecordId: "payment_456",
    totalAmount: "300.00",
    currency: "BDT",
    invoice: {
      productAmount: "250.00",
      vat: "20.00",
      discountAmount: "0.00",
      convenienceFee: "30.00",
    },
    callbacks: {
      successUrl: "https://bangbuy.example/api/payments/sslcommerz/success",
      failUrl: "https://bangbuy.example/api/payments/sslcommerz/fail",
      cancelUrl: "https://bangbuy.example/api/payments/sslcommerz/cancel",
      ipnUrl: "https://bangbuy.example/api/payments/sslcommerz/ipn",
    },
    customer: {
      name: "Test Customer",
      email: "customer@example.com",
      address1: "27/A Example Road",
      address2: "Level 2",
      city: "Dhaka",
      state: "Dhaka",
      postcode: "1205",
      country: "Bangladesh",
      phone: "01700000000",
      fax: "01700000001",
    },
    shipping: {
      name: "Test Customer",
      address1: "27/A Example Road",
      address2: "Level 2",
      area: "Dhanmondi",
      city: "Dhaka",
      subCity: "Dhaka",
      state: "Dhaka",
      postcode: "1205",
      country: "Bangladesh",
    },
    items: [
      {
        sku: "MOTOR-1",
        name: "Industrial Motor",
        category: "Motors",
        quantity: 1,
        unitPrice: "200.00",
        totalAmount: "200.00",
      },
      {
        sku: "BEARING-2",
        name: "Bearing",
        category: "Parts",
        quantity: 2,
        unitPrice: "25.00",
        totalAmount: "50.00",
      },
    ],
  };
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("SSLCommerz provider", () => {
  let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>;

  beforeEach(() => {
    vi.stubEnv("SSLCOMMERZ_STORE_ID", STORE_ID);
    vi.stubEnv("SSLCOMMERZ_STORE_PASSWORD", STORE_PASSWORD);
    vi.stubEnv("SSLCOMMERZ_IS_LIVE", "false");
    fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("creates a sandbox session with full form data and safe output", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        status: "SUCCESS",
        failedreason: "",
        sessionkey: "sandbox-session-key",
        GatewayPageURL:
          "https://sandbox.sslcommerz.com/gwprocess/v4/gw.php?Q=PAY&SESSIONKEY=sandbox-session-key",
      }),
    );

    const result = await createSslCommerzSession(sessionInput());

    expect(result).toEqual({
      sessionKey: "sandbox-session-key",
      paymentUrl:
        "https://sandbox.sslcommerz.com/gwprocess/v4/gw.php?Q=PAY&SESSIONKEY=sandbox-session-key",
    });
    expect(fetchMock).toHaveBeenCalledOnce();

    const [requestUrl, requestInit] = fetchMock.mock.calls[0];
    expect(String(requestUrl)).toBe(
      "https://sandbox.sslcommerz.com/gwprocess/v4/api.php",
    );
    expect(requestInit).toMatchObject({
      method: "POST",
      cache: "no-store",
      redirect: "error",
    });

    const form = new URLSearchParams(String(requestInit?.body));
    expect(Object.fromEntries(form)).toMatchObject({
      store_id: STORE_ID,
      store_passwd: STORE_PASSWORD,
      total_amount: "300.00",
      currency: "BDT",
      tran_id: "BB-20260726-abc123",
      success_url:
        "https://bangbuy.example/api/payments/sslcommerz/success",
      fail_url: "https://bangbuy.example/api/payments/sslcommerz/fail",
      cancel_url: "https://bangbuy.example/api/payments/sslcommerz/cancel",
      ipn_url: "https://bangbuy.example/api/payments/sslcommerz/ipn",
      cus_name: "Test Customer",
      cus_email: "customer@example.com",
      cus_add1: "27/A Example Road",
      cus_add2: "Level 2",
      cus_city: "Dhaka",
      cus_state: "Dhaka",
      cus_postcode: "1205",
      cus_country: "Bangladesh",
      cus_phone: "01700000000",
      cus_fax: "01700000001",
      shipping_method: "YES",
      num_of_item: "3",
      ship_name: "Test Customer",
      ship_add1: "27/A Example Road",
      ship_add2: "Level 2",
      ship_area: "Dhanmondi",
      ship_city: "Dhaka",
      ship_sub_city: "Dhaka",
      ship_state: "Dhaka",
      ship_postcode: "1205",
      ship_country: "Bangladesh",
      product_name: "Industrial Motor,Bearing",
      product_category: "Motors,Parts",
      product_profile: "physical-goods",
      product_amount: "250.00",
      vat: "20.00",
      discount_amount: "0.00",
      convenience_fee: "30.00",
      value_a: "order_123",
      value_b: "payment_456",
    });
    expect(JSON.parse(form.get("cart") ?? "null")).toEqual([
      {
        sku: "MOTOR-1",
        product: "Industrial Motor",
        quantity: "1",
        amount: "200.00",
        unit_price: "200.00",
      },
      {
        sku: "BEARING-2",
        product: "Bearing",
        quantity: "2",
        amount: "50.00",
        unit_price: "25.00",
      },
    ]);
    expect(JSON.stringify(result)).not.toContain(STORE_PASSWORD);
  });

  it("selects live endpoints only when live mode is explicit", async () => {
    vi.stubEnv("SSLCOMMERZ_IS_LIVE", "true");
    fetchMock.mockResolvedValue(
      jsonResponse({
        status: "SUCCESS",
        sessionkey: "live-session-key",
        GatewayPageURL:
          "https://securepay.sslcommerz.com/gwprocess/v4/gw.php?Q=PAY&SESSIONKEY=live-session-key",
      }),
    );

    await createSslCommerzSession(sessionInput());

    expect(String(fetchMock.mock.calls[0][0])).toBe(
      "https://securepay.sslcommerz.com/gwprocess/v4/api.php",
    );
  });

  it("rejects an invoice breakdown that does not reconcile with the total", async () => {
    const input = sessionInput();

    await expect(
      createSslCommerzSession({
        ...input,
        invoice: {
          ...input.invoice,
          convenienceFee: "29.00",
        },
      }),
    ).rejects.toBeInstanceOf(SslCommerzInputError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fails safely when server configuration is missing", async () => {
    vi.stubEnv("SSLCOMMERZ_STORE_PASSWORD", "");

    const error = await createSslCommerzSession(sessionInput()).catch(
      (caught: unknown) => caught,
    );

    expect(error).toBeInstanceOf(SslCommerzConfigurationError);
    expect(error).toMatchObject({
      code: "SSLCOMMERZ_CONFIGURATION_ERROR",
    });
    expect(String(error)).not.toContain(STORE_ID);
    expect(String(error)).not.toContain(STORE_PASSWORD);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects successful session responses without a payment URL", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        status: "SUCCESS",
        sessionkey: "session-key",
      }),
    );

    await expect(createSslCommerzSession(sessionInput())).rejects.toMatchObject({
      code: "SSLCOMMERZ_GATEWAY_RESPONSE_ERROR",
      reason: "MISSING_PAYMENT_URL",
    });
  });

  it("rejects payment URLs outside the environment host allow-list", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        status: "SUCCESS",
        sessionkey: "session-key",
        GatewayPageURL:
          "https://attacker.example/collect?SESSIONKEY=session-key",
      }),
    );

    await expect(createSslCommerzSession(sessionInput())).rejects.toMatchObject({
      code: "SSLCOMMERZ_GATEWAY_RESPONSE_ERROR",
      reason: "UNSAFE_PAYMENT_URL",
    });
  });

  it("classifies network failures without exposing their cause", async () => {
    fetchMock.mockRejectedValue(
      new Error(
        `request containing ${STORE_PASSWORD} and ${FULL_CARD_NUMBER} failed`,
      ),
    );

    const error = await createSslCommerzSession(sessionInput()).catch(
      (caught: unknown) => caught,
    );

    expect(error).toBeInstanceOf(SslCommerzNetworkError);
    expect(error).toMatchObject({
      code: "SSLCOMMERZ_NETWORK_ERROR",
      reason: "NETWORK_FAILURE",
    });
    expect(String(error)).not.toContain(STORE_PASSWORD);
    expect(String(error)).not.toContain(FULL_CARD_NUMBER);
  });

  it("classifies requests that exceed the bounded timeout", async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation(
      (_input, init) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener(
            "abort",
            () => reject(new DOMException("Aborted", "AbortError")),
            { once: true },
          );
        }),
    );

    const assertion = expect(
      createSslCommerzSession(sessionInput()),
    ).rejects.toMatchObject({
      code: "SSLCOMMERZ_NETWORK_ERROR",
      reason: "TIMEOUT",
    });

    await vi.advanceTimersByTimeAsync(30_000);
    await assertion;
  });

  it.each(["VALID", "VALIDATED"] as const)(
    "parses %s validation into an exact, sanitized result",
    async (status) => {
      fetchMock.mockResolvedValue(
        jsonResponse({
          status,
          tran_date: "2026-07-26 21:10:11",
          tran_id: "BB-20260726-abc123",
          val_id: "validation_123",
          amount: "300.00",
          currency: "BDT",
          currency_amount: "300.00",
          currency_type: "BDT",
          bank_tran_id: "bank_789",
          card_type: "VISA",
          risk_level: "0",
          APIConnect: "DONE",
          card_no: FULL_CARD_NUMBER,
          store_passwd: STORE_PASSWORD,
          value_a: "order_123",
          value_b: "payment_456",
        }),
      );

      const result = await validateSslCommerzPayment("validation_123");

      expect(result).toEqual({
        transactionId: "BB-20260726-abc123",
        validationId: "validation_123",
        amount: "300.00",
        currency: "BDT",
        currencyAmount: "300.00",
        currencyType: "BDT",
        bankTransactionId: "bank_789",
        cardType: "VISA",
        riskLevel: 0,
        paidAt: "2026-07-26 21:10:11",
        status,
        metadata: {
          orderId: "order_123",
          paymentRecordId: "payment_456",
        },
        raw: {
          status,
          tran_date: "2026-07-26 21:10:11",
          tran_id: "BB-20260726-abc123",
          val_id: "validation_123",
          amount: "300.00",
          currency: "BDT",
          currency_amount: "300.00",
          currency_type: "BDT",
          bank_tran_id: "bank_789",
          card_type: "VISA",
          risk_level: 0,
          value_a: "order_123",
          value_b: "payment_456",
        },
      });

      const [requestUrl, requestInit] = fetchMock.mock.calls[0];
      const url = new URL(String(requestUrl));
      expect(`${url.origin}${url.pathname}`).toBe(
        "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php",
      );
      expect(url.searchParams.get("val_id")).toBe("validation_123");
      expect(url.searchParams.get("store_id")).toBe(STORE_ID);
      expect(url.searchParams.get("store_passwd")).toBe(STORE_PASSWORD);
      expect(url.searchParams.get("format")).toBe("json");
      expect(requestInit).toMatchObject({
        method: "GET",
        cache: "no-store",
        redirect: "error",
      });
      expect(JSON.stringify(result)).not.toContain(FULL_CARD_NUMBER);
      expect(JSON.stringify(result)).not.toContain(STORE_PASSWORD);
      expect(result.raw).not.toHaveProperty("card_no");
      expect(result.raw).not.toHaveProperty("store_passwd");
      expect(result.metadata).toEqual({
        orderId: "order_123",
        paymentRecordId: "payment_456",
      });
    },
  );

  it("does not expose gateway failure details or credentials", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        status: "FAILED",
        failedreason: `declined ${STORE_PASSWORD} ${FULL_CARD_NUMBER}`,
      }),
    );
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const error = await createSslCommerzSession(sessionInput()).catch(
      (caught: unknown) => caught,
    );

    expect(error).toBeInstanceOf(SslCommerzGatewayResponseError);
    expect(error).toMatchObject({
      code: "SSLCOMMERZ_GATEWAY_RESPONSE_ERROR",
      reason: "SESSION_REJECTED",
    });
    expect(String(error)).not.toContain(STORE_PASSWORD);
    expect(String(error)).not.toContain(FULL_CARD_NUMBER);
    expect(JSON.stringify(error)).not.toContain(STORE_PASSWORD);
    expect(JSON.stringify(error)).not.toContain(FULL_CARD_NUMBER);
    expect(consoleError).not.toHaveBeenCalled();
  });

  it.each([
    "PENDING",
    "FAILED",
    "CANCELLED",
    "CANCEL",
    "EXPIRED",
    "UNATTEMPTED",
  ] as const)(
    "queries and sanitizes the sandbox %s transaction status",
    async (status) => {
      fetchMock.mockResolvedValue(
        jsonResponse({
          APIConnect: "DONE",
          no_of_trans_found: 1,
          element: [
            {
              status,
              tran_id: "BB-20260726-abc123",
              val_id: "",
              tran_date: "2026-07-26 21:10:11",
              amount: "300.00",
              currency: "BDT",
              currency_amount: "300.00",
              currency_type: "BDT",
              bank_tran_id: "",
              card_type: "VISA",
              risk_level: "0",
              value_a: "order_123",
              value_b: "payment_456",
              card_no: FULL_CARD_NUMBER,
              store_passwd: STORE_PASSWORD,
              error: `unsafe ${STORE_PASSWORD}`,
            },
          ],
        }),
      );

      const result = await querySslCommerzTransaction(
        "BB-20260726-abc123",
      );

      expect(result).toEqual({
        transactionId: "BB-20260726-abc123",
        status,
        validationId: null,
        transactionDate: "2026-07-26 21:10:11",
        amount: "300.00",
        currency: "BDT",
        currencyAmount: "300.00",
        currencyType: "BDT",
        bankTransactionId: null,
        cardType: "VISA",
        riskLevel: 0,
        metadata: {
          orderId: "order_123",
          paymentRecordId: "payment_456",
        },
        raw: {
          status,
          tran_id: "BB-20260726-abc123",
          tran_date: "2026-07-26 21:10:11",
          amount: "300.00",
          currency: "BDT",
          currency_amount: "300.00",
          currency_type: "BDT",
          card_type: "VISA",
          risk_level: 0,
          value_a: "order_123",
          value_b: "payment_456",
        },
      });

      const [requestUrl, requestInit] = fetchMock.mock.calls[0];
      const url = new URL(String(requestUrl));
      expect(`${url.origin}${url.pathname}`).toBe(
        "https://sandbox.sslcommerz.com/validator/api/merchantTransIDvalidationAPI.php",
      );
      expect(url.searchParams.get("tran_id")).toBe(
        "BB-20260726-abc123",
      );
      expect(url.searchParams.get("store_id")).toBe(STORE_ID);
      expect(url.searchParams.get("store_passwd")).toBe(STORE_PASSWORD);
      expect(url.searchParams.get("format")).toBe("json");
      expect(requestInit).toMatchObject({
        method: "GET",
        cache: "no-store",
        redirect: "error",
      });
      expect(JSON.stringify(result)).not.toContain(FULL_CARD_NUMBER);
      expect(JSON.stringify(result)).not.toContain(STORE_PASSWORD);
      expect(result.raw).not.toHaveProperty("card_no");
      expect(result.raw).not.toHaveProperty("store_passwd");
      expect(result.raw).not.toHaveProperty("error");
    },
  );

  it("uses the live transaction-query endpoint when explicitly configured", async () => {
    vi.stubEnv("SSLCOMMERZ_IS_LIVE", "true");
    fetchMock.mockResolvedValue(
      jsonResponse({
        APIConnect: "DONE",
        no_of_trans_found: 1,
        element: [
          {
            status: "VALIDATED",
            tran_id: "BB-20260726-abc123",
            val_id: "validation_123",
            tran_date: "2026-07-26 21:10:11",
            amount: "300.00",
            currency: "BDT",
            currency_amount: "300.00",
            currency_type: "BDT",
            bank_tran_id: "bank_789",
            card_type: "VISA",
            risk_level: 0,
            value_a: "order_123",
            value_b: "payment_456",
          },
        ],
      }),
    );

    const result = await querySslCommerzTransaction(
      "BB-20260726-abc123",
    );

    expect(result.status).toBe("VALIDATED");
    expect(String(fetchMock.mock.calls[0][0])).toMatch(
      /^https:\/\/securepay\.sslcommerz\.com\/validator\/api\/merchantTransIDvalidationAPI\.php\?/,
    );
  });

  it("returns null for unavailable terminal transaction details", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        APIConnect: "DONE",
        no_of_trans_found: 1,
        element: [
          {
            status: "EXPIRED",
            tran_id: "BB-20260726-abc123",
            val_id: "",
            tran_date: "",
            amount: "",
            currency: "",
            currency_amount: "",
            currency_type: "",
            bank_tran_id: "",
            card_type: "",
            risk_level: "",
            value_a: "",
            value_b: "",
          },
        ],
      }),
    );

    const result = await querySslCommerzTransaction(
      "BB-20260726-abc123",
    );

    expect(result).toMatchObject({
      status: "EXPIRED",
      validationId: null,
      transactionDate: null,
      amount: null,
      currency: null,
      currencyAmount: null,
      currencyType: null,
      bankTransactionId: null,
      cardType: null,
      riskLevel: null,
      metadata: {
        orderId: null,
        paymentRecordId: null,
      },
    });
    expect(result.raw).toEqual({
      status: "EXPIRED",
      tran_id: "BB-20260726-abc123",
      risk_level: null,
    });
  });

  it.each([
    [
      {
        APIConnect: "FAILED",
        no_of_trans_found: 0,
        element: [],
      },
      "INVALID_RESPONSE",
    ],
    [
      {
        APIConnect: "DONE",
        no_of_trans_found: 1,
        element: [
          {
            status: "FAILED",
            tran_id: "different-transaction",
          },
        ],
      },
      "TRANSACTION_NOT_FOUND",
    ],
    [
      {
        APIConnect: "DONE",
        no_of_trans_found: 1,
        element: [{ status: "FAILED" }],
      },
      "TRANSACTION_NOT_FOUND",
    ],
  ] as const)(
    "rejects malformed or missing transaction-query matches",
    async (body, reason) => {
      fetchMock.mockResolvedValue(jsonResponse(body));

      await expect(
        querySslCommerzTransaction("BB-20260726-abc123"),
      ).rejects.toMatchObject({
        code: "SSLCOMMERZ_GATEWAY_RESPONSE_ERROR",
        reason,
      });
    },
  );

  it("classifies transaction-query network failures safely", async () => {
    fetchMock.mockRejectedValue(
      new Error(`query failed with ${STORE_PASSWORD}`),
    );

    const error = await querySslCommerzTransaction(
      "BB-20260726-abc123",
    ).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(SslCommerzNetworkError);
    expect(error).toMatchObject({
      code: "SSLCOMMERZ_NETWORK_ERROR",
      reason: "NETWORK_FAILURE",
    });
    expect(String(error)).not.toContain(STORE_PASSWORD);
  });
});
