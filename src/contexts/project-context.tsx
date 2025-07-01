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
  addGalleryImage: (projectId: string, imageUrl: string) => void;
  getProjectById: (projectId: string) => Project | undefined;
}

const ProjectContext = React.createContext<ProjectContextType | undefined>(undefined);

const isServer = typeof window === 'undefined';

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = React.useState<Project[]>(() => {
    if (isServer) {
      return MOCK_PROJECTS;
    }
    try {
      const item = window.localStorage.getItem('photo-flow-projects');
      return item ? JSON.parse(item) : MOCK_PROJECTS;
    } catch (error) {
      console.error(error);
      return MOCK_PROJECTS;
    }
  });

  React.useEffect(() => {
    try {
      window.localStorage.setItem('photo-flow-projects', JSON.stringify(projects));
    } catch (error) {
      console.error(error);
    }
  }, [projects]);


  const addProject = (project: Omit<Project, 'id'>) => {
    const newProject = { ...project, id: new Date().getTime().toString(), galleryImages: [] };
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
  
  const addGalleryImage = (projectId: string, imageUrl: string) => {
    setProjects((prev) => 
      prev.map((p) => {
        if (p.id === projectId) {
          const updatedImages = [...(p.galleryImages || []), imageUrl];
          return { ...p, galleryImages: updatedImages };
        }
        return p;
      })
    )
  };
  
  const getProjectById = (projectId: string): Project | undefined => {
    return projects.find(p => p.id === projectId);
  }

  return (
    <ProjectContext.Provider value={{ projects, addProject, updateProjectStatus, deleteProject, updateProject, addGalleryImage, getProjectById }}>
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
