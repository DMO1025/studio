'use server';
import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { User } from '@/types';

const secretKey = process.env.SESSION_SECRET || 'fallback-secret-key-for-photoflow-app';
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d') // 1 day
    .sign(key);
}

export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    console.log('Failed to verify session');
    return null;
  }
}

export async function createSession(user: Omit<User, 'password'>) {
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
    // Only encrypt the user data. The expiration is handled by setExpirationTime.
    const session = await encrypt({ user });

    cookies().set('session', session, {
        expires,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
    });
}

export async function getSession() {
    const cookie = cookies().get('session')?.value;
    const session = await decrypt(cookie);
    if (!session?.user) {
        return null;
    }
    return session.user as User;
}

export async function deleteSession() {
    cookies().delete('session');
}
