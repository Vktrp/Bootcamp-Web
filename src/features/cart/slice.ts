import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem { productId: string; variantSKU: string; qty: number; priceCents: number }

type CartState = { items: CartItem[] };
const initialState: CartState = { items: [] };

const cart = createSlice({
name: 'cart', initialState,
reducers: {
addItem(state, action: PayloadAction<CartItem>) {
const i = state.items.findIndex(it => it.variantSKU === action.payload.variantSKU);
if (i >= 0) state.items[i].qty += action.payload.qty; else state.items.push(action.payload);
},
removeItem(state, action: PayloadAction<{ sku: string }>) {
state.items = state.items.filter(it => it.variantSKU !== action.payload.sku);
},
setQty(state, action: PayloadAction<{ sku: string; qty: number }>) {
const it = state.items.find(i => i.variantSKU === action.payload.sku);
if (it) it.qty = Math.max(1, action.payload.qty);
},
clear(state) { state.items = []; },
}
});

export const { addItem, removeItem, setQty, clear } = cart.actions;
export default cart.reducer;

export const selectCart = (s:{cart:CartState}) => s.cart;
export const selectCartCount = (s:{cart:CartState}) => s.cart.items.reduce((n, it) => n + it.qty, 0);
export const selectCartTotalCents = (s:{cart:CartState}) => s.cart.items.reduce((sum, it) => sum + it.priceCents * it.qty, 0);
export const cartCount = (state: { cart: CartState }) => 
  state.cart.items.reduce((total, item) => total + item.qty, 0);