'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isServer = typeof window === 'undefined';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for auth token in localStorage on initial load
    const checkAuthStatus = () => {
        try {
            const storedAuth = localStorage.getItem('isAuthenticated');
            if (storedAuth === 'true') {
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error('Could not access local storage:', error);
        } finally {
            setIsLoading(false);
        }
    };
    checkAuthStatus();
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    // Mock login logic
    if (email && pass) {
        try {
            localStorage.setItem('isAuthenticated', 'true');
        } catch (error) {
            console.error('Could not access local storage:', error);
        }
        setIsAuthenticated(true);
        setIsLoading(false);
        return true;
    }
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    try {
        localStorage.removeItem('isAuthenticated');
    } catch (error) {
        console.error('Could not access local storage:', error);
    }
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
