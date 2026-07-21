import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { HomeCategory } from "@/lib/services/home-categories.service";

type HomeCategoriesState = {
  items: HomeCategory[];
  isHydrated: boolean;
};

const initialState: HomeCategoriesState = {
  items: [],
  isHydrated: false,
};

const homeCategoriesSlice = createSlice({
  name: "homeCategories",
  initialState,
  reducers: {
    setHomeCategories(state, action: PayloadAction<HomeCategory[]>) {
      state.items = action.payload;
      state.isHydrated = true;
    },
  },
});

export const { setHomeCategories } = homeCategoriesSlice.actions;
export default homeCategoriesSlice.reducer;
