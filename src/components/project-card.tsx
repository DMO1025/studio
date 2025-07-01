'use client';

import * as React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Calendar, MapPin, Edit, Trash2, CheckCircle, Clock, Package } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useProjects } from '@/contexts/project-context';
import type { Project, ProjectStatus } from '@/types';

interface ProjectCardProps {
  project: Project;
}

const statusConfig = {
  Backlog: { color: 'bg-gray-500', icon: <Package className="h-4 w-4" /> },
  'In Progress': { color: 'bg-blue-500', icon: <Clock className="h-4 w-4" /> },
  Complete: { color: 'bg-green-500', icon: <CheckCircle className="h-4 w-4" /> },
};

export default function ProjectCard({ project }: ProjectCardProps) {
  const { updateProjectStatus, deleteProject } = useProjects();
  const avatarFallback = project.photographer.split(' ').map(s => s[0]).join('');

  return (
    <Card className="flex flex-col overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="relative p-0">
        <Image
          src={project.imageUrl || 'https://placehold.co/600x400.png'}
          alt={`Photo for ${project.clientName}`}
          width={600}
          height={400}
          className="object-cover w-full h-48"
          data-ai-hint="people portrait"
        />
        <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="h-8 w-8 bg-background/70 hover:bg-background">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                {(['Backlog', 'In Progress', 'Complete'] as ProjectStatus[]).map((status) => (
                    <DropdownMenuItem key={status} onClick={() => updateProjectStatus(project.id, status)}>
                        {status}
                    </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => deleteProject(project.id)} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <Badge 
            className={`text-white mb-2 ${statusConfig[project.status].color}`}
          >
            {statusConfig[project.status].icon}
            <span className="ml-1">{project.status}</span>
          </Badge>
          <CardTitle className="text-lg font-bold">{project.clientName}</CardTitle>
          <CardDescription className="line-clamp-2 mt-1 h-[40px]">{project.description}</CardDescription>
        
          <div className="text-sm text-muted-foreground mt-4 space-y-2">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{format(parseISO(project.date), 'MMMM d, yyyy')}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{project.location}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex items-center">
            <Avatar className="h-8 w-8">
              <AvatarImage src={`https://i.pravatar.cc/40?u=${project.photographer}`} />
              <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
            <span className="ml-2 text-sm font-medium">{project.photographer}</span>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold">${project.income.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Est. Income</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
