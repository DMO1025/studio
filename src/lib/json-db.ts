
import 'server-only';

import fs from 'fs';
import path from 'path';
import type { User, Project, FullBackupData } from '@/types';

const dbPath = path.join(process.cwd(), 'db.json');

const defaultData: FullBackupData = {
    users: [
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
    ],
    projects: {
        'usuario@photoflow.com': [],
    },
};

function readDb(): FullBackupData {
    try {
        if (!fs.existsSync(dbPath)) {
            fs.writeFileSync(dbPath, JSON.stringify(defaultData, null, 2), 'utf-8');
            return defaultData;
        }
        const data = fs.readFileSync(dbPath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading or creating db.json:", error);
        // In case of a corrupted file, return default data.
        return defaultData;
    }
}

function writeDb(data: FullBackupData): void {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
}

export const db = {
  // User Management
  findUserByEmail: async (email: string): Promise<User | undefined> => {
    const data = readDb();
    return data.users.find(u => u.email === email);
  },
  findUserBySlug: async (slug: string): Promise<User | undefined> => {
    const data = readDb();
    return data.users.find(u => u.portfolioSlug === slug);
  },
  addUser: async (user: User): Promise<User> => {
    const data = readDb();
    if (data.users.some(u => u.email === user.email)) {
      throw new Error("User already exists");
    }
    data.users.push(user);
    if (user.email) {
        data.projects[user.email] = [];
    }
    writeDb(data);
    return user;
  },
  updateUser: async (email: string, partialUser: Partial<User>): Promise<User | undefined> => {
    const data = readDb();
    const userIndex = data.users.findIndex(u => u.email === email);
    if (userIndex > -1) {
      data.users[userIndex] = { ...data.users[userIndex], ...partialUser };
      writeDb(data);
      return data.users[userIndex];
    }
    return undefined;
  },
  getAllUsers: async (): Promise<User[]> => {
    const data = readDb();
    return data.users.map(({ password, ...userWithoutPassword }) => userWithoutPassword);
  },

  // Project Management
  getProjectsForUser: async (email: string): Promise<Project[]> => {
    const data = readDb();
    return data.projects[email] || [];
  },
  addProjectForUser: async (email: string, projectData: Omit<Project, 'id' | 'user_email' | 'galleryImages'>): Promise<Project> => {
    const data = readDb();
    if (!data.projects[email]) {
      data.projects[email] = [];
    }
    const newProject: Project = { 
      ...projectData, 
      id: new Date().getTime().toString(),
      user_email: email,
      galleryImages: [],
    };
    data.projects[email].unshift(newProject);
    writeDb(data);
    return newProject;
  },
  updateProjectForUser: async (email: string, updatedProject: Project): Promise<Project | undefined> => {
    const data = readDb();
    const userProjects = data.projects[email];
    if (!userProjects) return undefined;
    const projectIndex = userProjects.findIndex(p => p.id === updatedProject.id);
    if (projectIndex > -1) {
      userProjects[projectIndex] = updatedProject;
      writeDb(data);
      return updatedProject;
    }
    return undefined;
  },
  deleteProjectForUser: async (email: string, projectId: string): Promise<boolean> => {
    const data = readDb();
    const userProjects = data.projects[email];
    if (!userProjects) return false;
    const initialLength = userProjects.length;
    data.projects[email] = userProjects.filter(p => p.id !== projectId);
    const success = data.projects[email].length < initialLength;
    if (success) {
        writeDb(data);
    }
    return success;
  },
  addGalleryImageToProject: async (email: string, projectId: string, imageUrl: string): Promise<Project | undefined> => {
    const data = readDb();
    const userProjects = data.projects[email] || [];
    const project = userProjects.find(p => p.id === projectId);
    if(project) {
        project.galleryImages = [...(project.galleryImages || []), imageUrl];
        // We already have a reference to the project in the data object, so we can just write.
        writeDb(data);
        return project;
    }
    return undefined;
  },
  importProjectsForUser: async (email: string, newProjects: Project[]) => {
    const data = readDb();
    data.projects[email] = newProjects;
    writeDb(data);
  },

  // Admin / Backup
  getFullBackup: async (): Promise<FullBackupData> => {
    return readDb();
  },
};
