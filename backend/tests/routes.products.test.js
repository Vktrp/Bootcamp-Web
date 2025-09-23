// backend/tests/routes.products.test.js
import { describe, it, expect, vi } from "vitest";
import express from "express";
import request from "supertest";

// ⚠️ Mock avec exactement les mêmes exports que la route importe
vi.mock("../src/controllers/productController.js", () => ({
  getProducts: (req, res) => res.json([{ id: "p1", name: "Alpha" }]),
  getProductById: (req, res) => res.json({ id: req.params.id, name: "X" }),
}));

function makeApp() {
  const app = express();
  app.use(express.json());
  return app;
}

describe("routes/products", async () => {
  const app = makeApp();
  const router = (await import("../src/routes/products.js")).default;
  app.use("/products", router);

  it("GET /products -> 200 + tableau", async () => {
    const r = await request(app).get("/products");
    expect(r.status).toBe(200);
    expect(r.body).toEqual([{ id: "p1", name: "Alpha" }]);
  });

  it("GET /products/:id -> 200 + item", async () => {
    const r = await request(app).get("/products/xyz");
    expect(r.status).toBe(200);
    expect(r.body).toMatchObject({ id: "xyz" });
  });
});
