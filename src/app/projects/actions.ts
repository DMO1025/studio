
'use server';

import { db } from '@/lib/data';
import { getSession } from '@/lib/session';
import type { Project, User } from '@/types';
import { revalidatePath } from 'next/cache';

async function getAuthenticatedUserEmail(): Promise<string> {
    const user = await getSession();
    if (!user?.email) {
        throw new Error("User not authenticated");
    }
    return user.email;
}

export async function getProjects(): Promise<Project[]> {
    const email = await getAuthenticatedUserEmail();
    return db.getProjectsForUser(email);
}

export async function addProject(projectData: Omit<Project, 'id' | 'user_email' | 'galleryImages'>): Promise<Project> {
    const email = await getAuthenticatedUserEmail();
    const newProject = await db.addProjectForUser(email, projectData);
    revalidatePath('/');
    revalidatePath('/workflow');
    revalidatePath('/calendar');
    revalidatePath('/revenue');
    return newProject;
}

export async function updateProject(project: Project): Promise<Project | undefined> {
    const email = await getAuthenticatedUserEmail();
    const updatedProject = await db.updateProjectForUser(email, project);
    revalidatePath('/');
    revalidatePath('/workflow');
    revalidatePath('/calendar');
    revalidatePath('/revenue');
    return updatedProject;
}

export async function deleteProject(projectId: string): Promise<boolean> {
    const email = await getAuthenticatedUserEmail();
    const result = await db.deleteProjectForUser(email, projectId);
    revalidatePath('/');
    revalidatePath('/workflow');
    revalidatePath('/calendar');
    revalidatePath('/revenue');
    return result;
}

export async function addGalleryImage(projectId: string, imageUrl: string): Promise<Project | undefined> {
    const email = await getAuthenticatedUserEmail();
    const project = await db.addGalleryImageToProject(email, projectId, imageUrl);
    revalidatePath(`/gallery/${projectId}`);
    return project;
}

export async function importProjects(newProjects: Project[]): Promise<void> {
    const email = await getAuthenticatedUserEmail();
    await db.importProjectsForUser(email, newProjects);
    revalidatePath('/');
}

// --- Public Actions ---

export async function getPublicPortfolio(slug: string): Promise<{ user: User, projects: Project[] } | null> {
    const user = await db.findUserBySlug(slug);
    if (!user?.email) {
        return null;
    }

    const allProjects = await db.getProjectsForUser(user.email);
    const completedProjects = allProjects.filter(p => p.status === 'Concluído');

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...publicUser } = user;
    
    return { user: publicUser, projects: completedProjects };
}
