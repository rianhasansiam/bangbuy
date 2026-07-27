import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  created,
  jsonError,
  ok,
  tooManyRequests,
} from "@/lib/api/response";

function expectPrivateNoStore(response: Response) {
  expect(response.headers.get("cache-control")).toBe(
    "private, no-cache, no-store, max-age=0, must-revalidate",
  );
  expect(response.headers.get("vary")).toBe("Cookie, Authorization");
  expect(response.headers.get("x-content-type-options")).toBe("nosniff");
}

describe("API JSON responses", () => {
  it.each([
    [ok({ id: "one" }), 200],
    [created({ id: "one" }), 201],
    [jsonError(400, "Invalid request."), 400],
  ])(
    "marks JSON responses private and non-cacheable",
    (response, status) => {
      expect(response.status).toBe(status);
      expectPrivateNoStore(response);
    },
  );

  it("preserves rate-limit headers alongside private cache headers", () => {
    const response = tooManyRequests(2_500);

    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("3");
    expectPrivateNoStore(response);
  });
});
