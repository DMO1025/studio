
'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import type { User } from '@/types';
import { getCurrentUser, login as loginAction, logout as logoutAction, register as registerAction, updateProfile as updateProfileAction, changePassword as changePasswordAction, getAllUsers as getAllUsersAction } from '@/app/auth/actions';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  register: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  getAllUsers: () => Promise<User[]>;
  updateProfile: (profileData: Partial<User>) => Promise<{ success: boolean; message?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true);
    try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
    } catch (error) {
        setUser(null);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (email: string, pass: string) => {
    const result = await loginAction(email, pass);
    if (result.success) {
      await checkAuthStatus(); 
    }
    return result;
  };

  const register = async (email: string, pass: string) => {
    const result = await registerAction(email, pass);
    return result;
  };

  const logout = async () => {
    await logoutAction();
    setUser(null);
    router.push('/login');
  };
  
  const updateProfile = async (profileData: Partial<User>) => {
    const result = await updateProfileAction(profileData);
    if (result.success) {
        await checkAuthStatus();
    }
    return result;
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    return await changePasswordAction(currentPassword, newPassword);
  };
  
  const getAllUsers = async (): Promise<User[]> => {
      return await getAllUsersAction();
  }

  const isAuthenticated = !isLoading && !!user;

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isLoading, login, register, logout, getAllUsers, updateProfile, changePassword }}>
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
