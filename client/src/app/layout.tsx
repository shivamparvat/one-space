import type {Metadata} from "next";
import {Inter} from "next/font/google";

import {ToastProvider} from "@/components/ui/toast"
import {Toaster} from "@/components/ui/toaster"

import "./globals.css"
import {Providers} from "./StoreProvider"
import {GoogleOAuthProvider} from "@react-oauth/google";
import {AuthProvider} from "./authProvider";

const inter = Inter({subsets: ["latin"]})

export const metadata: Metadata = {
  title: "Studio Admin",
  description: "",
}

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <Providers>
      <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT || ""}>
        <html lang="en">
          <ToastProvider>
            <body className={`${inter.className} min-h-screen`}>
              {/* <StoreProvider> */}
              <AuthProvider>  
                {children}
              </AuthProvider>
              {/* </StoreProvider> */}
              <Toaster />
            </body>
          </ToastProvider>
        </html></GoogleOAuthProvider>
    </Providers>
  )
}