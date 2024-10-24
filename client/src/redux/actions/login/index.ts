import {setLoader} from "@/redux/reducer/loader"
import {setToken} from "@/redux/reducer/login"
import axios from "axios"
import {Dispatch} from "redux"

const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL


export const googleLogin = (token: string | undefined) => async (dispatch: Dispatch) => {

    try {
        dispatch(setLoader(true))
        const user = await axios.post(`${NEXT_PUBLIC_BASE_URL}/user/login`, {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                }
            })
        dispatch(setLoader(false))
        if (user.status === 200 && user?.data?.success) {
            dispatch(setToken(user?.data?.data))
        }
    } catch (e) {
        dispatch(setLoader(false))
    }

}


export const LoginWithCredential = (data: LogCredential) => async (dispatch: Dispatch) => {

    try {
        dispatch(setLoader(true))
        const user = await axios.post(`${NEXT_PUBLIC_BASE_URL}/user/login`, {...data},
            {
                headers: {
                    Accept: "application/json",
                }
            })
        dispatch(setLoader(false))
        if (user.status === 200 && user?.data?.success) {
            if (user?.data?.data?.role === "admin" || user?.data?.data?.role === "broker") {
                dispatch(setToken(user?.data?.data))
            }
        }
    } catch (e) {
        dispatch(setLoader(false))
    }

}

