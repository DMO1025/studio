import type { Metadata } from 'next';
import './globals.css';
import { AppInitializer } from '@/components/app-initializer';
import { AuthProvider } from '@/contexts/auth-context';
import { ProjectProvider } from '@/contexts/project-context';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'PhotoFlow',
  description: 'Gerencie seus projetos de fotografia com facilidade.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <ProjectProvider>
            <AppInitializer>{children}</AppInitializer>
          </ProjectProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
