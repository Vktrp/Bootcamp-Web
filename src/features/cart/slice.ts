import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem } from '@/features/catalog/types';

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
if (it) it.qty = action.payload.qty;
},
clear(state) { state.items = []; },
}
});
export const { addItem, removeItem, setQty, clear } = cart.actions;
export default cart.reducer;