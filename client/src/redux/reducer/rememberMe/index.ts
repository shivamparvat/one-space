import { createSlice } from "@reduxjs/toolkit"

const initialState: any = {
    email: '',
    password: '',
    rememberme: false,
};

const rememberMe = createSlice({
    name: "rememberme",
    initialState,
    reducers: {
        setRememberMe: (state, action) => {
            state.email = action.payload.email
            state.password = action.payload.password
            state.rememberme = action.payload.rememberme
        },
        removeRememberMe: (state) => {
            state.email = ""
            state.password = ""
            state.rememberme = false
        }
    }
})


export const { setRememberMe, removeRememberMe } = rememberMe.actions
export default rememberMe.reducer