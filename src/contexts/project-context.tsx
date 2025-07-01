'use client';

import * as React from 'react';
import type { Project, ProjectStatus } from '@/types';
import { MOCK_PROJECTS } from '@/lib/mock-data';
import { useAuth } from './auth-context';

interface ProjectContextType {
  projects: Project[];
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProjectStatus: (projectId: string, status: ProjectStatus) => void;
  deleteProject: (projectId: string) => void;
  updateProject: (project: Project) => void;
  addGalleryImage: (projectId: string, imageUrl: string) => void;
  getProjectById: (projectId: string) => Project | undefined;
  importProjects: (newProjects: Project[]) => void;
}

const ProjectContext = React.createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const getStorageKey = React.useCallback(() => {
    return user ? `photo-flow-projects-${user.email}` : null;
  }, [user]);

  React.useEffect(() => {
    if (isAuthenticated && user) {
        const storageKey = getStorageKey();
        if (!storageKey) {
            setIsLoading(false);
            return;
        };

        try {
            const item = window.localStorage.getItem(storageKey);
            setProjects(item ? JSON.parse(item) : MOCK_PROJECTS);
        } catch (error) {
            console.error(error);
            setProjects(MOCK_PROJECTS);
        } finally {
            setIsLoading(false);
        }
    } else {
        setProjects([]);
        setIsLoading(false);
    }
  }, [user, isAuthenticated, getStorageKey]);

  React.useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    
    const storageKey = getStorageKey();
    if (!storageKey) return;

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(projects));
    } catch (error) {
      console.error(error);
    }
  }, [projects, isLoading, isAuthenticated, getStorageKey]);


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

  const importProjects = (newProjects: Project[]) => {
    setProjects(newProjects);
  }

  return (
    <ProjectContext.Provider value={{ projects, addProject, updateProjectStatus, deleteProject, updateProject, addGalleryImage, getProjectById, importProjects }}>
      {!isLoading ? children : null}
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
