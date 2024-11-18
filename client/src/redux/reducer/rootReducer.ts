import { combineReducers } from "@reduxjs/toolkit";
import loader from "@/redux/reducer/loader";
import recall from "@/redux/reducer/RecallApi";
import login from "@/redux/reducer/login";


const rootReducer = combineReducers({
  loader,
  recall,
  login
});

export default rootReducer;
