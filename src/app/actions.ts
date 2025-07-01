'use server';

import { extractProjectDetails, ProjectDetailsInput } from '@/ai/flows/project-details-extraction';

export async function getProjectDetailsFromAI(description: string) {
  try {
    const input: ProjectDetailsInput = { description };
    const details = await extractProjectDetails(input);
    return { success: true, data: details };
  } catch (error) {
    console.error("AI extraction failed:", error);
    return { success: false, error: "Failed to extract project details." };
  }
}
