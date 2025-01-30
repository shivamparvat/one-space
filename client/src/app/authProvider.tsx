"use client";

import { useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { setToken, clearToken } from "@/redux/reducer/login";

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.login?.userToken?.token);
  console.log(token)

  useEffect(
    () => {
      if (!token) {
        router.push("/login");
      } else {
        dispatch(setToken(token));
      }
    },
    [token, router]
  );

  const login = (newToken: string) => {
    dispatch(setToken(newToken));
  };

  const logout = () => {
    dispatch(clearToken());
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated:!!token, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
