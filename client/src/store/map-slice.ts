import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  map: {},
};

const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setMap(state, action) {
      state.map = action.payload;
    },
  },
});

export const mapReducer = mapSlice.reducer;
export const mapActions = mapSlice.actions;
