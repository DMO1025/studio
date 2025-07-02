
'use server';

import { z } from 'zod';
import { db } from '@/lib/data';
import { createSession, getSession, deleteSession } from '@/lib/session';
import type { User } from '@/types';
import { revalidatePath } from 'next/cache';

export async function login(email: string, password: string):Promise<{ success: boolean; message?: string }> {
  try {
    const user = db.findUserByEmail(email);
    if (!user || user.password !== password) {
      return { success: false, message: 'Credenciais inválidas.' };
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    await createSession(userWithoutPassword);
    return { success: true };
  } catch (error) {
    return { success: false, message: 'Ocorreu um erro durante o login.' };
  }
}

export async function register(email: string, password: string):Promise<{ success: boolean; message: string }> {
    if (db.findUserByEmail(email)) {
        return { success: false, message: 'Este e-mail já está em uso.' };
    }
    const newUser: User = { 
        email, 
        password: password, 
        profileComplete: false, 
        name: '',
        portfolioSlug: ''
    };
    db.addUser(newUser);
    return { success: true, message: 'Cadastro realizado com sucesso!' };
}

export async function logout() {
  await deleteSession();
}

export async function getCurrentUser(): Promise<User | null> {
  const user = await getSession();
  if (!user?.email) return null;
  
  // Refetch user from DB to get latest data
  const freshUser = db.findUserByEmail(user.email);
  if (!freshUser) return null;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...userWithoutPassword } = freshUser;
  return userWithoutPassword;
}

export async function updateProfile(profileData: Partial<User>): Promise<{ success: boolean; message?: string }> {
    const user = await getSession();
    if (!user?.email) {
        return { success: false, message: 'Usuário não autenticado.' };
    }

    // Server-side validation for portfolio slug uniqueness
    if (profileData.portfolioSlug) {
        const existingUser = db.findUserBySlug(profileData.portfolioSlug);
        if (existingUser && existingUser.email !== user.email) {
            return { success: false, message: 'Este link já está em uso. Por favor, escolha outro.' };
        }
    }

    db.updateUser(user.email, { ...profileData, profileComplete: true });
    
    // Update session with new user data
    const updatedUser = db.findUserByEmail(user.email);
    if(updatedUser) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userWithoutPassword } = updatedUser;
        await createSession(userWithoutPassword);
    }
    
    revalidatePath('/account');
    return { success: true, message: 'Perfil atualizado!' };
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const user = await getSession();
    if (!user?.email) {
        return { success: false, message: 'Usuário não autenticado.' };
    }
    const userFromDb = db.findUserByEmail(user.email);
    if (!userFromDb || userFromDb.password !== currentPassword) {
        return { success: false, message: 'A senha atual está incorreta.' };
    }
    db.updateUser(user.email, { password: newPassword });
    return { success: true, message: 'Senha alterada com sucesso!' };
}

export async function getAllUsers(): Promise<User[]> {
    const user = await getSession();
    if (user?.email !== 'usuario@photoflow.com') {
        // Simple authorization check
        return [];
    }
    return db.getAllUsers();
}
