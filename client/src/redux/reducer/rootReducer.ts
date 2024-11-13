import { combineReducers } from "@reduxjs/toolkit";
import activitySlice from "./Activity";


const rootReducer = combineReducers({
  activity: activitySlice,
});

export default rootReducer;
