'use client';

import * as React from 'react';
import type { Project, ProjectStatus } from '@/types';
import { MOCK_PROJECTS } from '@/lib/mock-data';

interface ProjectContextType {
  projects: Project[];
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProjectStatus: (projectId: string, status: ProjectStatus) => void;
  deleteProject: (projectId: string) => void;
  updateProject: (project: Project) => void;
}

const ProjectContext = React.createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = React.useState<Project[]>(MOCK_PROJECTS);

  const addProject = (project: Omit<Project, 'id'>) => {
    const newProject = { ...project, id: new Date().getTime().toString() };
    setProjects((prev) => [newProject, ...prev]);
  };

  const updateProjectStatus = (projectId: string, status: ProjectStatus) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, status } : p))
    );
  };
  
  const updateProject = (updatedProject: Project) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
    );
  };

  const deleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
  };

  return (
    <ProjectContext.Provider value={{ projects, addProject, updateProjectStatus, deleteProject, updateProject }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = React.useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
}
