'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from '@/components/ui/sidebar';
import { LayoutDashboard, KanbanSquare, CalendarDays, TrendingUp, PlusCircle, Camera, ImageIcon, LogOut } from 'lucide-react';
import { CreateProjectDialog } from './create-project-dialog';
import { Button } from './ui/button';
import { useAuth } from '@/contexts/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from './ui/dropdown-menu';

const navItems = [
  { href: '/', label: 'Painel', icon: LayoutDashboard },
  { href: '/workflow', label: 'Fluxo de Trabalho', icon: KanbanSquare },
  { href: '/calendar', label: 'Calendário', icon: CalendarDays },
  { href: '/revenue', label: 'Receita', icon: TrendingUp },
  { href: '/gallery', label: 'Galeria', icon: ImageIcon },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isCreateProjectOpen, setCreateProjectOpen] = React.useState(false);

  const currentPage = navItems.find((item) => pathname.startsWith(item.href) && (item.href === '/' ? pathname.length === 1 : true))?.label || 'PhotoFlow';

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <div className="bg-primary p-2 rounded-lg">
               <Camera className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-semibold">PhotoFlow</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} legacyBehavior passHref>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="justify-start w-full p-2 h-auto">
                    <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src="https://i.pravatar.cc/40?u=user" />
                            <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <div className='text-left'>
                            <p className="text-sm font-medium">Usuário</p>
                            <p className="text-xs text-muted-foreground">online</p>
                        </div>
                    </div>
                  </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="end" className="w-56">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="md:hidden" />
            <h2 className="text-2xl font-semibold">{currentPage}</h2>
          </div>
          <Button onClick={() => setCreateProjectOpen(true)}>
            <PlusCircle className="mr-2 h-5 w-5" />
            Criar Projeto
          </Button>
        </header>
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
      <CreateProjectDialog open={isCreateProjectOpen} onOpenChange={setCreateProjectOpen} />
    </SidebarProvider>
  );
}
