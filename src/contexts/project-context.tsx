
'use client';

import * as React from 'react';
import type { Project, ProjectStatus } from '@/types';
import { useAuth } from './auth-context';
import { getProjects as getProjectsAction, addProject as addProjectAction, updateProject as updateProjectAction, deleteProject as deleteProjectAction, addGalleryImage as addGalleryImageAction, importProjects as importProjectsAction } from '@/app/projects/actions';

interface ProjectContextType {
  projects: Project[];
  isLoading: boolean;
  addProject: (project: Omit<Project, 'id' | 'user_email' | 'galleryImages'>) => Promise<void>;
  updateProjectStatus: (projectId: string, status: ProjectStatus) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
  addGalleryImage: (projectId: string, imageUrl: string) => Promise<void>;
  getProjectById: (projectId: string) => Project | undefined;
  importProjects: (newProjects: Project[]) => Promise<void>;
}

const ProjectContext = React.createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchProjects = React.useCallback(async () => {
    if (isAuthenticated && user) {
      setIsLoading(true);
      try {
        const userProjects = await getProjectsAction();
        setProjects(userProjects);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    } else if (!isAuthLoading) {
        setProjects([]);
        setIsLoading(false);
    }
  }, [user, isAuthenticated, isAuthLoading]);

  React.useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const addProject = async (project: Omit<Project, 'id' | 'user_email' | 'galleryImages'>) => {
    await addProjectAction(project);
    await fetchProjects();
  };
  
  const updateProject = async (updatedProject: Project) => {
    await updateProjectAction(updatedProject);
    await fetchProjects();
  };

  const updateProjectStatus = async (projectId: string, status: ProjectStatus) => {
    const project = projects.find(p => p.id === projectId);
    if(project) {
        await updateProjectAction({ ...project, status });
        await fetchProjects();
    }
  };

  const deleteProject = async (projectId: string) => {
    await deleteProjectAction(projectId);
    await fetchProjects();
  };
  
  const addGalleryImage = async (projectId: string, imageUrl: string) => {
    await addGalleryImageAction(projectId, imageUrl);
    await fetchProjects();
  };
  
  const getProjectById = (projectId: string): Project | undefined => {
    return projects.find(p => p.id === projectId);
  }

  const importProjects = async (newProjects: Project[]) => {
    await importProjectsAction(newProjects);
    await fetchProjects();
  }

  // Combine auth loading and project loading states
  const isAppLoading = isAuthLoading || (isAuthenticated && isLoading);

  return (
    <ProjectContext.Provider value={{ projects, isLoading, addProject, updateProjectStatus, deleteProject, updateProject, addGalleryImage, getProjectById, importProjects }}>
      {!isAppLoading ? children : null}
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
