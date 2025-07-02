'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Project, User } from '@/types';
import Image from 'next/image';
import { Camera, ShieldOff, ArrowLeft, Globe, Instagram, Twitter } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface PortfolioData {
  user: User;
  projects: Project[];
}

export default function PublicPortfolioPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [portfolioData, setPortfolioData] = React.useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!slug) return;

    if (typeof window === 'undefined') {
        return;
    }

    try {
      const allUsersJson = localStorage.getItem('photoflow_users');
      if (!allUsersJson) {
        throw new Error('Nenhum usuário encontrado.');
      }
      const allUsers: User[] = JSON.parse(allUsersJson);
      
      const portfolioUser = allUsers.find(u => u.portfolioSlug === slug);

      if (!portfolioUser || !portfolioUser.email) {
        throw new Error('Portfólio não encontrado.');
      }
      
      const projectsJson = localStorage.getItem(`photo-flow-projects-${portfolioUser.email}`);
      const allProjects: Project[] = projectsJson ? JSON.parse(projectsJson) : [];
      
      const completedProjects = allProjects.filter(p => p.status === 'Concluído');

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...publicUser } = portfolioUser;
      
      setPortfolioData({ user: publicUser, projects: completedProjects });

    } catch (e: any) {
      setError(e.message || 'Ocorreu um erro ao carregar o portfólio.');
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  if (isLoading) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <p className="animate-pulse">Carregando portfólio...</p>
        </div>
    );
  }

  if (error || !portfolioData) {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
            <ShieldOff className="h-16 w-16 text-destructive mb-4" />
            <h1 className="text-2xl font-bold">Portfólio não encontrado</h1>
            <p className="text-muted-foreground mt-2">{error || 'O link que você acessou pode estar quebrado ou o portfólio foi removido.'}</p>
            <Button variant="outline" asChild className="mt-6">
                <Link href="/login">
                    <ArrowLeft className="mr-2 h-4 w-4"/>
                    Voltar
                </Link>
            </Button>
        </div>
    );
  }

  const { user, projects } = portfolioData;

  return (
    <div className="min-h-screen bg-secondary/30 text-foreground">
        <header className="p-8 flex flex-col items-center justify-center text-center border-b bg-background">
             <Avatar className="h-24 w-24 mb-4 border-4 border-primary">
                <AvatarImage src={user.profilePictureUrl} alt={user.name} />
                <AvatarFallback>{user.name ? user.name.split(' ').map(s => s[0]).join('') : user.email?.[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <h1 className="text-4xl font-bold tracking-tight">{user.name || 'Fotógrafo Profissional'}</h1>
            {user.company && <p className="text-lg text-muted-foreground mt-1">{user.company}</p>}
            {user.bio && <p className="text-base text-muted-foreground mt-4 max-w-2xl">{user.bio}</p>}
            <div className="flex items-center gap-4 mt-4">
              {user.website && (
                <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Globe className="h-6 w-6" />
                </a>
              )}
              {user.instagram && (
                <a href={user.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Instagram className="h-6 w-6" />
                </a>
              )}
              {user.twitter && (
                <a href={user.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Twitter className="h-6 w-6" />
                </a>
              )}
            </div>
        </header>
        <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
            <h2 className="text-2xl font-semibold mb-6">Projetos Concluídos</h2>
            {projects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map(project => (
                        <div key={project.id} className="group relative aspect-video overflow-hidden rounded-lg shadow-lg bg-background">
                            <Image
                                src={project.imageUrl || 'https://placehold.co/600x400.png'}
                                alt={`Foto para ${project.clientName}`}
                                layout="fill"
                                objectFit="cover"
                                className="transition-transform duration-300 group-hover:scale-105"
                                data-ai-hint="photo gallery"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                            <div className="absolute bottom-0 left-0 p-4 text-white">
                                <h3 className="font-bold text-lg">{project.clientName}</h3>
                                <p className="text-sm opacity-90">{project.location}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center text-center py-24 bg-background rounded-lg">
                     <Camera className="h-16 w-16 text-muted-foreground mb-4" />
                     <h2 className="text-2xl font-semibold">Nenhum projeto concluído para exibir</h2>
                     <p className="text-muted-foreground mt-2">Este fotógrafo ainda não adicionou projetos públicos ao seu portfólio.</p>
                </div>
            )}
        </main>
         <footer className="text-center p-6 mt-8">
            <p className="text-sm text-muted-foreground">Powered by PhotoFlow</p>
        </footer>
    </div>
  );
}
