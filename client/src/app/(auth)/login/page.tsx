"use client";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {signIn} from "next-auth/react";
import {useEffect, useState} from "react";
import Image from "next/image";
import googleIcon from "@/asset/icon/google-icon-logo-svgrepo-com.svg"
import {GoogleLogin} from "@react-oauth/google";
import {googleLogin} from "@/redux/actions/login";
import {useDispatch, useSelector} from "react-redux";
import {AnyAction} from "redux";
import { RootState } from "@/redux/store";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const token = useSelector((state: RootState) => state.login.userToken);
    const router = useRouter();
    const dispatch = useDispatch()

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            await signIn("google", {callbackUrl: "/"});
        } catch (error) {
            console.error("Google Login failed:", error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        if(token){
            router.push("/dashboard")
        }
    }, [token])
    
    const getGoogleData = async (token: string | undefined) => {
        dispatch(googleLogin(token) as unknown as AnyAction);
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gray-100">
            <Card className="w-full max-w-md shadow-md">
                <CardHeader>
                    <CardTitle className="text-center text-lg font-semibold">Login</CardTitle>
                </CardHeader>
                <CardContent>
                    <form>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="email" className="mb-2 block text-sm font-medium">
                                    Email
                                </Label>
                                <Input
                                    type="email"
                                    id="email"
                                    placeholder="Enter your email"
                                    className="w-full"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="password" className="mb-2 block text-sm font-medium">
                                    Password
                                </Label>
                                <Input
                                    type="password"
                                    id="password"
                                    placeholder="Enter your password"
                                    className="w-full"
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                Login
                            </Button>
                        </div>
                    </form>
                    <div className="relative mt-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-white px-2 text-gray-500">Or</span>
                        </div>
                    </div>
                    <div className="mt-6">
                        <GoogleLogin
                            onSuccess={(credentialResponse) => {
                                getGoogleData(credentialResponse.credential);
                            }}
                            onError={() => {
                                console.log("Login Failed");
                            }}
                        />
                    </div>
                </CardContent>
                <CardFooter className="text-center text-sm">
                    <p>
                        Don't have an account?{" "}
                        <a href="/register" className="text-blue-500 hover:underline">
                            Sign up
                        </a>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
