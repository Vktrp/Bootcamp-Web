import { configureStore } from "@reduxjs/toolkit";
import cart from "../features/cart/slice";
import auth from "../features/auth/slice";
import favorites from "../features/favorites/slice"; // ⬅️ new

export const store = configureStore({
  reducer: { cart, auth, favorites }, // ⬅️ ajoute "favorites"
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
