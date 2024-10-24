import React from "react"

import type {Metadata} from "next"
import {Inter} from "next/font/google"

import {ToastProvider} from "@/components/ui/toast"
import {Toaster} from "@/components/ui/toaster"

import "./globals.css"
import StoreProvider from "./StoreProvider"

const inter = Inter({subsets: ["latin"]})

export const metadata: Metadata = {
  title: "Studio Admin",
  description: "",
}

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="en">
      <ToastProvider>
        <body className={`${inter.className} min-h-screen`}>
          {/* <StoreProvider> */}
            {children}
          {/* </StoreProvider> */}
          <Toaster />
        </body>
      </ToastProvider>
    </html>
  )
}