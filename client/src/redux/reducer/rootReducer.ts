import { combineReducers } from "@reduxjs/toolkit";
import loaderSlice from "./loader";
import sidebarSlice from "./sidebar";
import userLoginSlice from "./login";
import rememberMeSlice from "./rememberMe";
import recallApiSlice from "./RecallApi";

const rootReducer = combineReducers({
  loader: loaderSlice,
  sidebar: sidebarSlice,
  login: userLoginSlice,
  rememberme: rememberMeSlice,
  recallApi: recallApiSlice
});

export default rootReducer;
