import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";

/* ================== Types ================== */
export type CartItem = {
  /** clé interne (sku:size) */
  key: string;
  sku: string;
  name: string;
  size?: string;
  priceCents?: number;
  image?: string | null;
  colorway?: string | null;
  qty: number;
};

export type CartState = {
  items: CartItem[];
};

function load(): CartState {
  try {
    const raw = localStorage.getItem("__cart__");
    if (!raw) return { items: [] };
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.items)) return { items: [] };
    return { items: parsed.items as CartItem[] };
  } catch {
    return { items: [] };
  }
}
function save(state: CartState) {
  try {
    localStorage.setItem("__cart__", JSON.stringify(state));
  } catch {}
}

const initialState: CartState = load();

/* ================ Slice ===================== */
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    /** Ajoute un article (dédupliqué par sku+size) */
    addItem(
      state,
      action: PayloadAction<
        Omit<CartItem, "key" | "qty"> & { qty?: number }
      >
    ) {
      const { sku, size, name, priceCents, image, colorway } = action.payload;
      const key = `${sku}:${size ?? ""}`;
      const found = state.items.find((it) => it.key === key);
      if (found) {
        found.qty += action.payload.qty ?? 1;
      } else {
        state.items.push({
          key,
          sku,
          size,
          name,
          priceCents,
          image: image ?? null,
          colorway: colorway ?? null,
          qty: action.payload.qty ?? 1,
        });
      }
      save(state);
    },
    /** Modifie la quantité d’un article via sa key */
    setQty(state, action: PayloadAction<{ key: string; qty: number }>) {
      const it = state.items.find((i) => i.key === action.payload.key);
      if (it) {
        it.qty = Math.max(1, Math.floor(action.payload.qty || 1));
        save(state);
      }
    },
    /** Retire un article du panier */
    removeItem(state, action: PayloadAction<{ key: string }>) {
      state.items = state.items.filter((i) => i.key !== action.payload.key);
      save(state);
    },
    /** Vide le panier */
    clearCart(state) {
      state.items = [];
      save(state);
    },
  },
});

export const { addItem, setQty, removeItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;

/* ================= Selectors ================ */
export const selectCartItems = (s: RootState) => s.cart.items;

export const selectCartCount = (s: RootState): number =>
  s.cart.items.reduce((sum: number, it) => sum + (it.qty ?? 0), 0);

export const selectCartTotalCents = (s: RootState): number =>
  s.cart.items.reduce(
    (sum: number, it) => sum + ((it.priceCents ?? 0) * (it.qty ?? 0)),
    0
  );
