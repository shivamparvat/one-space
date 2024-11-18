'use client';

import {useRouter} from 'next/navigation';
import React, {createContext, useContext, useEffect, useState, ReactNode} from 'react';
import {useSelector} from 'react-redux';
import {RootState} from '@/redux/store'; // Adjust the import path based on your project
import {useDispatch} from 'react-redux';
import {getToken, setToken} from '@/redux/reducer/login'; // Import your Redux action

// Define the AuthContext
interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props for the AuthProvider
interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  // Get token from Redux state
  const token = useSelector((state: RootState) => state.login.userToken);

  useEffect(() => {
    // Check for token in Redux or fallback to localStorage
    let storedToken = token?.token;
    if (!storedToken) {
      dispatch(getToken());
    }

    // Set authentication status
    if (storedToken) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      router.push('/login');
    }
  }, [token, dispatch, router]);


  if (!isAuthenticated) {
    router.replace("/login")
  } else {
    router.replace("/dashboard")
  }

  return (
    <AuthContext.Provider value={{isAuthenticated, token}}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
