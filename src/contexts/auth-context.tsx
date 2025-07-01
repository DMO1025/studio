'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import type { User } from '@/types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = () => {
        try {
            const storedUser = localStorage.getItem('photoflow_user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error('Could not access local storage:', error);
        } finally {
            setIsLoading(false);
        }
    };
    checkAuthStatus();
  }, []);

  const getUsers = (): User[] => {
    try {
        const users = localStorage.getItem('photoflow_users');
        return users ? JSON.parse(users) : [{ email: 'usuario@photoflow.com', password: 'senha123' }];
    } catch {
        return [{ email: 'usuario@photoflow.com', password: 'senha123' }];
    }
  };

  const saveUsers = (users: User[]) => {
    try {
        localStorage.setItem('photoflow_users', JSON.stringify(users));
    } catch (error) {
        console.error('Could not save users to local storage:', error);
    }
  };

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    const users = getUsers();
    const foundUser = users.find(u => u.email === email && u.password === pass);
    
    if (foundUser) {
        const currentUser = { email: foundUser.email };
        try {
            localStorage.setItem('photoflow_user', JSON.stringify(currentUser));
        } catch (error) {
            console.error('Could not access local storage:', error);
        }
        setUser(currentUser);
        setIsLoading(false);
        return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const register = async (email: string, pass: string): Promise<{ success: boolean; message: string }> => {
    const users = getUsers();
    if (users.some(u => u.email === email)) {
      return { success: false, message: 'Este e-mail já está em uso.' };
    }
    
    const newUser: User = { email, password: pass };
    saveUsers([...users, newUser]);

    return { success: true, message: 'Cadastro realizado com sucesso!' };
  };

  const logout = () => {
    try {
        localStorage.removeItem('photoflow_user');
    } catch (error) {
        console.error('Could not access local storage:', error);
    }
    setUser(null);
  };

  const isAuthenticated = !isLoading && !!user;

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isLoading, login, register, logout }}>
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
