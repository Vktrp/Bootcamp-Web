import { describe, it, expect } from "vitest";

 import reducer, {

  addItem,

  setQty,

  removeItem,

  clearCart,

  selectCartItems,

  selectCartCount,

  selectCartTotalCents,

  type CartState,

 } from "../slice";

 // petit helper pour démarrer avec un état vide

 const empty = (): CartState => ({ items: [] });

 describe("cart slice", () => {

  it("ajoute un article (nouvelle ligne)", () => {

    const state1 = reducer(

      empty(),

      addItem({

        sku: "IF2624-100",

        size: "39",

        name: "Air Max Bia",

        priceCents: 9000,

      })

    );

    expect(state1.items).toHaveLength(1);

    expect(state1.items[0]).toMatchObject({

      key: "IF2624-100:39",

      qty: 1,

      priceCents: 9000,

    });

  });

  it("déduplique par (sku:size) et incrémente la quantité", () => {

    const s0 = empty();

    const s1 = reducer(

      s0,

      addItem({ sku: "IF2624-100", size: "39", name: "Air Max", priceCents: 9000 })

    );

    const s2 = reducer(

      s1,

      addItem({ sku: "IF2624-100", size: "39", name: "Air Max", priceCents: 9000 })

    );

    expect(s2.items).toHaveLength(1);

    expect(s2.items[0].qty).toBe(2);

  });

  it("addItem avec qty explicite additionne correctement", () => {

    const s1 = reducer(

      empty(),

      addItem({

        sku: "SKU-1",

        size: "42",

        name: "Runner",

        priceCents: 12000,

        qty: 3,

      })

    );

    expect(s1.items[0].qty).toBe(3);

  });

  it("setQty force un minimum à 1 et arrondit à l’entier", () => {

    const s1 = reducer(

      empty(),

      addItem({ sku: "SKU-2", size: "41", name: "Sneak", priceCents: 10000 })

    );

    const s2 = reducer(s1, setQty({ key: "SKU-2:41", qty: 0 }));

    expect(s2.items[0].qty).toBe(1);

    const s3 = reducer(s2, setQty({ key: "SKU-2:41", qty: 2.8 as any }));

    expect(s3.items[0].qty).toBe(2);

  });

  it("removeItem supprime la ligne concernée", () => {

    const s1 = reducer(

      empty(),

      addItem({ sku: "SKU-A", size: "40", name: "A", priceCents: 5000 })

    );

    const s2 = reducer(

      s1,

      addItem({ sku: "SKU-B", size: "41", name: "B", priceCents: 7000 })

    );

    const s3 = reducer(s2, removeItem({ key: "SKU-A:40" }));

    expect(s3.items).toHaveLength(1);

    expect(s3.items[0].key).toBe("SKU-B:41");

  });

  it("clearCart vide le panier", () => {

    const s1 = reducer(

      empty(),

      addItem({ sku: "SKU-X", size: "44", name: "X", priceCents: 8000 })

    );

    const s2 = reducer(s1, clearCart());

    expect(s2.items).toHaveLength(0);

  });

  it("sélecteurs: selectCartItems / selectCartCount / selectCartTotalCents", () => {

    // on fabrique un RootState minimal avec 2 lignes

    const state = {

      cart: {

        items: [

          { key: "A:40", sku: "A", size: "40", name: "A", priceCents: 5000, qty: 1 },

          { key: "B:", sku: "B", size: undefined, name: "B", priceCents: 7000, qty: 3 },

        ],

      },

    } as any;

    expect(selectCartItems(state)).toHaveLength(2);

    expect(selectCartCount(state)).toBe(4); // 1 + 3

    expect(selectCartTotalCents(state)).toBe(5000 * 1 + 7000 * 3);

  });

 });