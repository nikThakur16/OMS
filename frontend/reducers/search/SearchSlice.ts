import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SearchState {
  searchQuery: string;
}
const initialState: SearchState = {
  searchQuery: "",
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    clearSearchTerm(state) {
      state.searchQuery = "";
    },
  },
});
export const { setSearchQuery, clearSearchTerm } = searchSlice.actions;
export default searchSlice.reducer;
