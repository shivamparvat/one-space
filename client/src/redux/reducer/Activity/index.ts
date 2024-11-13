import { createSlice } from "@reduxjs/toolkit";


const initialState:{activity : any[]} = { activity: [] };

const activitySlice = createSlice({
  name: "activity",
  initialState,
  reducers: {
    setActivity(state, action) {
      state.activity = action.payload;
    },
  },
});

export const { setActivity } = activitySlice.actions;
export default activitySlice.reducer;
