import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";

export type FavoritesState = {
  ids: string[];
};

function load(): FavoritesState {
  try {
    const raw = localStorage.getItem("__favs__");
    const ids = raw ? (JSON.parse(raw) as string[]) : [];
    return { ids: Array.isArray(ids) ? ids : [] };
  } catch {
    return { ids: [] };
  }
}
function save(state: FavoritesState) {
  try {
    localStorage.setItem("__favs__", JSON.stringify(state.ids));
  } catch {}
}

const initialState: FavoritesState = load();

const slice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    toggleFavorite(state, action: PayloadAction<string>) {
      const id = String(action.payload);
      const i = state.ids.indexOf(id);
      if (i >= 0) state.ids.splice(i, 1);
      else state.ids.push(id);
      save(state);
    },
    clearFavorites(state) {
      state.ids = [];
      save(state);
    },
  },
});

export const { toggleFavorite, clearFavorites } = slice.actions;
export default slice.reducer;

/* Selectors */
export const selectFavorites = (s: RootState) => s.favorites.ids;
export const selectIsFavorite = (id?: string | null) => (s: RootState) =>
  !!id && s.favorites.ids.includes(String(id));
