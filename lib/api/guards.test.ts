import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  userFindUnique: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/db/prisma", () => ({
  prisma: { user: { findUnique: mocks.userFindUnique } },
}));

import { isAdminRequest, requireAdmin } from "@/lib/api/guards";

function session(role: "ADMIN" | "USER") {
  return {
    expires: "2099-01-01T00:00:00.000Z",
    user: {
      id: "user-1",
      name: "Test User",
      email: "test@example.com",
      role,
    },
  };
}

describe("admin guards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects an ADMIN token after the user is demoted in the database", async () => {
    mocks.auth.mockResolvedValue(session("ADMIN"));
    mocks.userFindUnique.mockResolvedValue({ role: "USER" });

    const result = await requireAdmin();

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("Expected the admin guard to reject.");
    expect(result.response.status).toBe(403);
    await expect(result.response.json()).resolves.toEqual({
      error: "Admin access only.",
    });
  });

  it("accepts a current database admin even when the token role is stale", async () => {
    mocks.auth.mockResolvedValue(session("USER"));
    mocks.userFindUnique.mockResolvedValue({ role: "ADMIN" });

    const result = await requireAdmin();

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("Expected the admin guard to succeed.");
    expect(result.session.user.role).toBe("ADMIN");
  });

  it("does not expose admin-only fields to a demoted token holder", async () => {
    mocks.auth.mockResolvedValue(session("ADMIN"));
    mocks.userFindUnique.mockResolvedValue({ role: "USER" });

    await expect(isAdminRequest()).resolves.toBe(false);
  });
});
