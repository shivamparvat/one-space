import { useState, useEffect } from 'react';

// Define the shape of the user object
interface User {
  id: string;
  name: string;
  email: string;
}

// Define the shape of the auth context
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

// Custom hook to manage authentication
const useAuth = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check local storage or session storage for user data on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('userToken');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
    }
  }, []);

  // Login function
  const login = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('userToken', JSON.stringify(userData));
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('userToken');
  };

  return {
    user,
    isAuthenticated,
    login,
    logout,
  };
};

export default useAuth;