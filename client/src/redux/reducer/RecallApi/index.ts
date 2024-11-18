import { createSlice } from "@reduxjs/toolkit";
const initialState = {
    recallApi: false,
};

const recallApiSlice = createSlice({
    name: "recallApi",
    initialState,
    reducers: {
        setRecallApi(state, action) {
            state.recallApi = action.payload as never;
        },
    },
});

export const { setRecallApi } = recallApiSlice.actions;
export default recallApiSlice.reducer;