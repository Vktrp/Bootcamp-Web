import { createSlice, PayloadAction } from "@reduxjs/toolkit";

 /* ========= Types ========= */

 export type Role = "customer" | "seller" | "admin" | null;

 export type AuthUser = {

  id: string | null;

  email: string | null;

  role: Role;

  first_name: string | null;

  last_name: string | null;

  address: string | null;

 };

 export type AuthState = {

  user: AuthUser | null;

  token: string | null;

 };

 /* ========= State ========= */

 const initialState: AuthState = {

  user: null,

  token: null,

 };

 /* ========= Slice ========= */

 const slice = createSlice({

  name: "auth",

  initialState,

  reducers: {

    // Pose d’un “snapshot” complet de session (après login/register/bootstrap)

    setSession(

      state,

      action: PayloadAction<{

        user: {

          id: string;

          email: string;

          role?: Role;

          first_name?: string | null;

          last_name?: string | null;

          address?: string | null;

        };

        token: string;

      }>

    ) {

      const { user, token } = action.payload;

      state.token = token;

      state.user = {

        id: String(user.id),

        email: user.email ?? null,

        role: (user.role ?? null) as Role,

        first_name: user.first_name ?? null,

        last_name: user.last_name ?? null,

        address: user.address ?? null,

      };

    },

    // Mise à jour partielle du profil (jamais de “clés dupliquées”)

    setUser(state, action: PayloadAction<Partial<AuthUser> | AuthUser | null>) {

      if (action.payload === null) {

        state.user = null;

        return;

      }

      const p = action.payload as Partial<AuthUser>;

      if (!state.user) {

        state.user = {

          id: p.id ?? null,

          email: p.email ?? null,

          role: (p.role ?? null) as Role,

          first_name: p.first_name ?? null,

          last_name: p.last_name ?? null,

          address: p.address ?? null,

        };

      } else {

        state.user = {

          id: p.id ?? state.user.id,

          email: p.email ?? state.user.email,

          role: (p.role ?? state.user.role) as Role,

          first_name: p.first_name ?? state.user.first_name,

          last_name: p.last_name ?? state.user.last_name,

          address: p.address ?? state.user.address,

        };

      }

    },

    // Purge totale (logout / token invalide)

    clearSession(state) {

      state.user = null;

      state.token = null;

    },

  },

 });

 /* ========= Exports actions / reducer ========= */

 export const { setSession, setUser, clearSession } = slice.actions;

 export default slice.reducer;

 /* ========= Selectors ========= */

 export const selectUser = (s: { auth: AuthState }) => s.auth.user;

 export const selectRole = (s: { auth: AuthState }) => s.auth.user?.role ?? null;

 export const selectToken = (s: { auth: AuthState }) => s.auth.token;