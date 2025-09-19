import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { User } from "./api";

export type AuthState = { user: User | null };
const initial: AuthState = { user: null };

const auth = createSlice({
  name: "auth",
  initialState: initial,
  reducers: {
    setUser(s, a: PayloadAction<User | null>) {
      s.user = a.payload;
    },
  },
});

export const { setUser } = auth.actions;
export default auth.reducer;

export const selectUser = (s: { auth: AuthState }) => s.auth.user;
export const selectRole = (s: { auth: AuthState }) =>
  s.auth.user?.role ?? "anon";
