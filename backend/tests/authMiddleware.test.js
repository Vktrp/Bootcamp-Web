import { describe, it, expect, vi } from "vitest";

 import { requireAdmin } from "../src/middleware/authMiddleware.js";

 function mockRes() {

  return {

    statusCode: 200,

    body: null,

    status(code) { this.statusCode = code; return this; },

    json(payload) { this.body = payload; return this; }

  };

 }

 describe("requireAdmin", () => {

  it("refuse si role != admin", () => {

    const req = { user: { role: "customer" } };

    const res = mockRes();

    const next = vi.fn();

    requireAdmin(req, res, next);

    expect(res.statusCode).toBe(403);

    expect(res.body).toEqual({ message: "Forbidden" });

    expect(next).not.toHaveBeenCalled();

  });

  it("laisse passer un admin", () => {

    const req = { user: { role: "admin" } };

    const res = mockRes();

    const next = vi.fn();

    requireAdmin(req, res, next);

    expect(res.statusCode).toBe(200); // jamais modifié

    expect(next).toHaveBeenCalledTimes(1);

  });

 });