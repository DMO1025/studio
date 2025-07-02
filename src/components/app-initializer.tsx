
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useEffect } from 'react';
import { AppLayout } from './app-layout';
import { Loader2 } from 'lucide-react';

const AUTH_ROUTES = ['/login', '/register'];
const PUBLIC_ROUTES = ['/login', '/register', '/p/'];

export function AppInitializer({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (isLoading) return;

        const isAuthRoute = AUTH_ROUTES.includes(pathname);
        const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));

        if (!isPublicRoute && !isAuthenticated) {
            router.push('/login');
        } else if (isAuthRoute && isAuthenticated) {
            router.push('/');
        }
    }, [isLoading, isAuthenticated, pathname, router]);
    
    if (AUTH_ROUTES.includes(pathname)) {
        return <main className="flex min-h-screen w-full items-center justify-center bg-background p-4">{children}</main>;
    }
    
    if (pathname.startsWith('/p/')) {
        return <>{children}</>;
    }

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // or a loading spinner, handled by useEffect redirect
    }

    return <AppLayout>{children}</AppLayout>;
}
