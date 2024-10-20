"use client"
import React from "react"

import {redirect} from "next/navigation"
import {useRouter} from "next/router";

export default function Home() {
    const router = useRouter();
    const {query} = router;
    console.log(query); 
    // redirect("/dashboard")
    return <>Coming Soon</>
}