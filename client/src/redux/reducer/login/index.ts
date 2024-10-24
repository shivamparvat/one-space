import { createSlice } from "@reduxjs/toolkit";

const initialState: any = {
  userToken: null,
};

const userLoginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.userToken = action.payload;
    },
    removeToken: (state) => {
      state.userToken = null;
    },
  },
});

export const { setToken, removeToken } = userLoginSlice.actions;

export default userLoginSlice.reducer;
