"use client";

import { createSlice } from "@reduxjs/toolkit";
import _ from "lodash";

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.error = null;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    clearUser(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearUser: (state) => {
      state.user = null;
    },
  },
});

export const { setUser, setError, clearUser } = appSlice.actions;
export default appSlice.reducer;
