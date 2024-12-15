"use client"
import React, {useEffect} from "react"
import axios from "axios"

import {useRouter, useSearchParams} from "next/navigation"

export default function Home() {
    const Params = useSearchParams();
    const router = useRouter()
    const state = Params.get("state")
    const token = Params.get("code")
    const scope = Params.get("scope")
    console.table({
        state,
        token,
        scope
    })
    useEffect(() => {
        const storeData = async () => {
            if (state && token) {
                try {
                    const response = await axios.post(process.env.NEXT_PUBLIC_BASE_URL+'/api/v1/token/store', {state, token, scope});
                    console.log(response.data); // You can log the response to check if it was successful
                    router.replace("/dashboard/connect")
                } catch (error:any) {
                    if(error?.status == 401){
                      router.replace("/login")
                    }
                }
            }
        };

        storeData();
    }, [state, token, scope, router]);
    // redirect("/dashboard")
    return <>Coming Soon</>
}