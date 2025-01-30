import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  userToken: any | null;
}

const initialState: AuthState = {
  userToken: typeof window !== 'undefined' ? localStorage.getItem('userToken') : null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.userToken = action.payload;
      localStorage.setItem('userToken', action.payload);
    },
    clearToken: (state) => {
      state.userToken = null;
      localStorage.removeItem('userToken');
    },
  },
});

export const { setToken, clearToken } = authSlice.actions;
export default authSlice.reducer;