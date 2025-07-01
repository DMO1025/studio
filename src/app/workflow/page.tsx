'use client';

import * as React from 'react';
import { useProjects } from '@/contexts/project-context';
import ProjectCard from '@/components/project-card';
import type { Project, ProjectStatus } from '@/types';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const columns: ProjectStatus[] = ['Backlog', 'In Progress', 'Complete'];

export default function WorkflowPage() {
  const { projects } = useProjects();

  const projectsByStatus = React.useMemo(() => {
    return columns.reduce((acc, status) => {
      acc[status] = projects.filter((p: Project) => p.status === status);
      return acc;
    }, {} as Record<ProjectStatus, Project[]>);
  }, [projects]);

  return (
    <div className="flex h-[calc(100vh-10rem)] w-full gap-6">
      {columns.map((status) => (
        <div key={status} className="flex flex-col w-full md:w-1/3 h-full">
          <div className="p-2 sticky top-0 bg-background/95 z-10 backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4">{status} ({projectsByStatus[status].length})</h2>
            <hr />
          </div>
          <ScrollArea className="flex-1 pr-4 -mr-4">
            <div className="flex flex-col gap-4 p-2">
              {projectsByStatus[status].length > 0 ? (
                projectsByStatus[status].map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))
              ) : (
                <div className="text-center py-10 border-2 border-dashed rounded-lg text-muted-foreground">
                  No projects in this stage.
                </div>
              )}
            </div>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </div>
      ))}
    </div>
  );
}
