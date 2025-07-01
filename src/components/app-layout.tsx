'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { LayoutDashboard, KanbanSquare, CalendarDays, TrendingUp, PlusCircle, Camera } from 'lucide-react';
import { CreateProjectDialog } from './create-project-dialog';
import { Button } from './ui/button';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/workflow', label: 'Workflow', icon: KanbanSquare },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/revenue', label: 'Revenue', icon: TrendingUp },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isCreateProjectOpen, setCreateProjectOpen] = React.useState(false);

  const currentPage = navItems.find((item) => item.href === pathname) || { label: 'PhotoFlow' };

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
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="md:hidden" />
            <h2 className="text-2xl font-semibold">{currentPage.label}</h2>
          </div>
          <Button onClick={() => setCreateProjectOpen(true)}>
            <PlusCircle className="mr-2 h-5 w-5" />
            Create Project
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
