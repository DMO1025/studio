
import type { User, Project, ProjectStatus } from '@/types';

// --- IN-MEMORY DATABASE ---
// IMPORTANT: This data is not persistent and will be reset on every server restart.
// It's a simulation for the development environment.

let users: User[] = [
    { 
      email: 'usuario@photoflow.com', 
      password: 'senha123', 
      name: 'Admin User',
      profileComplete: true, 
      portfolioSlug: 'admin-portfolio',
      profilePictureUrl: '',
      bio: 'Sou o administrador do sistema.',
      website: '',
      instagram: '',
      twitter: '',
    }
];

let projects: { [userEmail: string]: Project[] } = {};

// This holds active sessions, mapping a session ID to a user email
let sessions: { [sessionId: string]: string } = {};


export interface FullBackupData {
  users: User[];
  projects: Record<string, Project[]>;
}

export const db = {
  // User Management
  findUserByEmail: (email: string): User | undefined => users.find(u => u.email === email),
  findUserBySlug: (slug: string): User | undefined => users.find(u => u.portfolioSlug === slug),
  addUser: (user: User): User => {
    if (db.findUserByEmail(user.email!)) {
      throw new Error("User already exists");
    }
    users.push(user);
    projects[user.email!] = [];
    return user;
  },
  updateUser: (email: string, data: Partial<User>): User | undefined => {
    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex > -1) {
      users[userIndex] = { ...users[userIndex], ...data };
      return users[userIndex];
    }
    return undefined;
  },
  getAllUsers: (): User[] => {
    // Return users without their passwords for security
    return users.map(({ password, ...userWithoutPassword }) => userWithoutPassword);
  },

  // Project Management
  getProjectsForUser: (email: string): Project[] => projects[email] || [],
  getProjectByIdForUser: (email: string, projectId: string): Project | undefined => {
    return (projects[email] || []).find(p => p.id === projectId);
  },
  addProjectForUser: (email: string, projectData: Omit<Project, 'id' | 'user_email'>): Project => {
    if (!projects[email]) {
      projects[email] = [];
    }
    const newProject: Project = { 
      ...projectData, 
      id: new Date().getTime().toString(),
      user_email: email,
      galleryImages: [],
    };
    projects[email].unshift(newProject);
    return newProject;
  },
  updateProjectForUser: (email: string, updatedProject: Project): Project | undefined => {
    const userProjects = projects[email];
    if (!userProjects) return undefined;
    const projectIndex = userProjects.findIndex(p => p.id === updatedProject.id);
    if (projectIndex > -1) {
      userProjects[projectIndex] = updatedProject;
      return updatedProject;
    }
    return undefined;
  },
  deleteProjectForUser: (email: string, projectId: string): boolean => {
    const userProjects = projects[email];
    if (!userProjects) return false;
    const initialLength = userProjects.length;
    projects[email] = userProjects.filter(p => p.id !== projectId);
    return projects[email].length < initialLength;
  },
  addGalleryImageToProject: (email: string, projectId: string, imageUrl: string): Project | undefined => {
    const project = db.getProjectByIdForUser(email, projectId);
    if(project) {
        project.galleryImages = [...(project.galleryImages || []), imageUrl];
        return db.updateProjectForUser(email, project);
    }
    return undefined;
  },
  importProjectsForUser(email: string, newProjects: Project[]) {
    projects[email] = newProjects;
  },

  // Session Management
  createSession: (email: string, sessionId: string): void => {
    sessions[sessionId] = email;
  },
  getSession: (sessionId: string): string | undefined => {
    return sessions[sessionId];
  },
  deleteSession: (sessionId: string): void => {
    delete sessions[sessionId];
  },

  // Admin / Backup
  getFullBackup: (): FullBackupData => {
    return {
      users,
      projects
    }
  },
};
