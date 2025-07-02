
import 'server-only';

import mysql from 'mysql2/promise';
import type { User, Project, FullBackupData } from '@/types';

// Centralized connection pool
let pool: mysql.Pool | null = null;

function getPool() {
    if (pool) {
        return pool;
    }
    const dbConfig = {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    };
    pool = mysql.createPool(dbConfig);
    return pool;
}

export const db = {
  // User Management
  findUserByEmail: async (email: string): Promise<User | undefined> => {
    const [rows] = await getPool().execute<mysql.RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] as User | undefined;
  },
  findUserBySlug: async (slug: string): Promise<User | undefined> => {
    const [rows] = await getPool().execute<mysql.RowDataPacket[]>('SELECT * FROM users WHERE portfolioSlug = ?', [slug]);
    return rows[0] as User | undefined;
  },
  addUser: async (user: User): Promise<User> => {
    await getPool().execute(
      'INSERT INTO users (email, password, name, profileComplete, portfolioSlug) VALUES (?, ?, ?, ?, ?)',
      [user.email, user.password, user.name || '', user.profileComplete || false, user.portfolioSlug || null]
    );
    return user;
  },
  updateUser: async (email: string, data: Partial<User>): Promise<User | undefined> => {
    // Dynamically build the update query
    const fields = Object.keys(data).filter(k => k !== 'email');
    const values = fields.map(k => (data as any)[k]);
    if (fields.length === 0) return db.findUserByEmail(email);

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    
    await getPool().execute(`UPDATE users SET ${setClause} WHERE email = ?`, [...values, email]);
    return db.findUserByEmail(email);
  },
  getAllUsers: async (): Promise<User[]> => {
    const [rows] = await getPool().execute<mysql.RowDataPacket[]>('SELECT * FROM users');
    return (rows as User[]).map(({ password, ...user }) => user);
  },

  // Project Management
  getProjectsForUser: async (email: string): Promise<Project[]> => {
    const [projects] = await getPool().execute<mysql.RowDataPacket[]>('SELECT * FROM projects WHERE user_email = ? ORDER BY createdAt DESC', [email]);
    for (const project of projects as Project[]) {
        const [images] = await getPool().execute<mysql.RowDataPacket[]>('SELECT imageUrl FROM gallery_images WHERE project_id = ? ORDER BY createdAt ASC', [project.id]);
        project.galleryImages = images.map(img => img.imageUrl);
    }
    return projects as Project[];
  },
  addProjectForUser: async (email: string, projectData: Omit<Project, 'id' | 'user_email' | 'galleryImages'>): Promise<Project> => {
    const id = new Date().getTime().toString();
    const newProject: Project = { 
        ...projectData, 
        id,
        user_email: email,
        galleryImages: [],
    };
    await getPool().execute(
        `INSERT INTO projects (id, clientName, date, location, photographer, status, stage, income, expenses, paymentStatus, description, imageUrl, user_email) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            id, newProject.clientName, newProject.date, newProject.location, newProject.photographer, newProject.status,
            newProject.stage, newProject.income, newProject.expenses, newProject.paymentStatus, newProject.description,
            newProject.imageUrl || null, email
        ]
    );
    return newProject;
  },
  updateProjectForUser: async (email: string, project: Project): Promise<Project | undefined> => {
    await getPool().execute(
        `UPDATE projects SET 
            clientName = ?, date = ?, location = ?, photographer = ?, status = ?, stage = ?, income = ?, expenses = ?, paymentStatus = ?, description = ?, imageUrl = ?
         WHERE id = ? AND user_email = ?`,
        [
            project.clientName, project.date, project.location, project.photographer, project.status, project.stage,
            project.income, project.expenses, project.paymentStatus, project.description, project.imageUrl || null,
            project.id, email
        ]
    );
    return project;
  },
  deleteProjectForUser: async (email: string, projectId: string): Promise<boolean> => {
    // Cascading delete should handle gallery_images
    const [result] = await getPool().execute<mysql.ResultSetHeader>('DELETE FROM projects WHERE id = ? AND user_email = ?', [projectId, email]);
    return result.affectedRows > 0;
  },
  addGalleryImageToProject: async (email: string, projectId: string, imageUrl: string): Promise<Project | undefined> => {
    // Check if project belongs to user first
    const [projectRows] = await getPool().execute<mysql.RowDataPacket[]>('SELECT id FROM projects WHERE id = ? AND user_email = ?', [projectId, email]);
    if (projectRows.length === 0) return undefined;

    await getPool().execute('INSERT INTO gallery_images (project_id, imageUrl) VALUES (?, ?)', [projectId, imageUrl]);
    
    const projects = await db.getProjectsForUser(email);
    const updatedProject = projects.find(p => p.id === projectId);
    return updatedProject;
  },
  importProjectsForUser: async (email: string, newProjects: Project[]) => {
    const conn = await getPool().getConnection();
    try {
        await conn.beginTransaction();
        await conn.execute('DELETE FROM projects WHERE user_email = ?', [email]);
        for (const project of newProjects) {
            await conn.execute(
                `INSERT INTO projects (id, clientName, date, location, photographer, status, stage, income, expenses, paymentStatus, description, imageUrl, user_email) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    project.id, project.clientName, new Date(project.date), project.location, project.photographer,
                    project.status, project.stage, project.income, project.expenses, project.paymentStatus,
                    project.description, project.imageUrl || null, email
                ]
            );
            if (project.galleryImages) {
                for (const imageUrl of project.galleryImages) {
                    await conn.execute('INSERT INTO gallery_images (project_id, imageUrl) VALUES (?, ?)', [project.id, imageUrl]);
                }
            }
        }
        await conn.commit();
    } catch(error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
  },

  // Admin / Backup
  getFullBackup: async (): Promise<FullBackupData> => {
    const [users] = await getPool().query<mysql.RowDataPacket[]>('SELECT * FROM users');
    const [projects] = await getPool().query<mysql.RowDataPacket[]>('SELECT * FROM projects');
    const [galleryImages] = await getPool().query<mysql.RowDataPacket[]>('SELECT * FROM gallery_images');

    const projectsByEmail: Record<string, Project[]> = {};
    for (const project of projects as Project[]) {
      if (!projectsByEmail[project.user_email]) {
        projectsByEmail[project.user_email] = [];
      }
      project.galleryImages = (galleryImages as any[])
        .filter(img => img.project_id === project.id)
        .map(img => img.imageUrl);
      projectsByEmail[project.user_email].push(project);
    }
    
    return {
      users: users as User[],
      projects: projectsByEmail
    };
  },
};
