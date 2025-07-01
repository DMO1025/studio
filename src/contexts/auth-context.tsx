
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
  getUsers: () => User[];
  updateProfile: (profileData: Partial<User>) => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
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
        return users ? JSON.parse(users) : [{ email: 'usuario@photoflow.com', password: 'senha123', profileComplete: true }];
    } catch {
        return [{ email: 'usuario@photoflow.com', password: 'senha123', profileComplete: true }];
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userToStore } = foundUser;
        try {
            localStorage.setItem('photoflow_user', JSON.stringify(userToStore));
        } catch (error) {
            console.error('Could not access local storage:', error);
        }
        setUser(userToStore);
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
    
    const newUser: User = { email, password: pass, profileComplete: false, name: '', phone: '', company: '' };
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
  
  const updateProfile = (profileData: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...profileData, profileComplete: true };
    setUser(updatedUser);
    try {
        localStorage.setItem('photoflow_user', JSON.stringify(updatedUser));
        const allUsers = getUsers();
        const userIndex = allUsers.findIndex(u => u.email === user.email);
        if (userIndex !== -1) {
            const fullUserRecord = allUsers[userIndex];
            // Make sure to retain password when updating
            const password = fullUserRecord.password;
            allUsers[userIndex] = { ...fullUserRecord, ...profileData, password, profileComplete: true };
            saveUsers(allUsers);
        }
    } catch (error) {
        console.error('Could not update profile in local storage:', error);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    if (!user) return { success: false, message: 'Usuário não autenticado.' };

    const users = getUsers();
    const userIndex = users.findIndex(u => u.email === user.email);
    
    if (userIndex === -1) {
        return { success: false, message: 'Usuário não encontrado.' };
    }
    
    const storedUser = users[userIndex];
    if (storedUser.password !== currentPassword) {
        return { success: false, message: 'A senha atual está incorreta.' };
    }
    
    users[userIndex].password = newPassword;
    saveUsers(users);
    
    return { success: true, message: 'Senha alterada com sucesso!' };
  };


  const isAuthenticated = !isLoading && !!user;

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isLoading, login, register, logout, getUsers, updateProfile, changePassword }}>
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
