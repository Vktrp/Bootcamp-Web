import { describe, it, expect, vi } from "vitest";
import express from "express";
import request from "supertest";

vi.mock("../src/controllers/checkoutController.js", () => ({
  createOrder: (req, res) => res.status(201).json({ orderId: "ord_123" }),
}));

describe("routes/checkout", async () => {
  const app = express();
  app.use(express.json());
  const router = (await import("../src/routes/checkout.js")).default;
  app.use("/checkout", router);

  it("POST /checkout/pay -> 201 + orderId", async () => {
    const r = await request(app).post("/checkout/pay").send({ items: [] });
    expect(r.status).toBe(201);
    expect(r.body.orderId).toBe("ord_123");
  });
});
