import {createSlice} from '@reduxjs/toolkit';

const initialState:any = {
  userToken: window.localStorage.getItem('userToken') || null, // Read token from localStorage on app load
};

const userLoginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.userToken = action.payload;
      window.localStorage.setItem('userToken', JSON.stringify(action.payload)); 
    },
    removeToken: (state) => {
      state.userToken = null;
      window.localStorage.removeItem('userToken');
    },
    getToken: (state) => {
      const strData = window.localStorage.getItem('userToken')
      const JsonData = strData?JSON.parse(strData): null
      state.userToken =  JsonData;
    }
  },
});

export const {setToken, removeToken, getToken} = userLoginSlice.actions;

export default userLoginSlice.reducer;