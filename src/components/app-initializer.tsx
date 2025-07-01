'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useEffect } from 'react';
import { AppLayout } from './app-layout';
import { Loader2 } from 'lucide-react';

const PUBLIC_ROUTES = ['/login', '/register'];

export function AppInitializer({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (isLoading) return;

        const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

        if (!isAuthenticated && !isPublicRoute) {
            router.push('/login');
        } else if (isAuthenticated && isPublicRoute) {
            router.push('/');
        }
    }, [isLoading, isAuthenticated, pathname, router]);
    
    if (PUBLIC_ROUTES.includes(pathname)) {
        return <main className="flex min-h-screen w-full items-center justify-center bg-background p-4">{children}</main>;
    }

    if (isLoading || !isAuthenticated) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return <AppLayout>{children}</AppLayout>;
}
