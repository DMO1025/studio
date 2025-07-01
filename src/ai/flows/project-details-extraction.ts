'use server';

/**
 * @fileOverview A flow to extract project details from a free-form description.
 *
 * - extractProjectDetails - A function that handles the project detail extraction process.
 * - ProjectDetailsInput - The input type for the extractProjectDetails function.
 * - ProjectDetailsOutput - The return type for the extractProjectDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProjectDetailsInputSchema = z.object({
  description: z.string().describe('A free-form description of the photo project.'),
});
export type ProjectDetailsInput = z.infer<typeof ProjectDetailsInputSchema>;

const ProjectDetailsOutputSchema = z.object({
  clientName: z.string().describe('The name of the client for the photo project.'),
  date: z.string().describe('The date of the photo shoot.'),
  location: z.string().describe('The location of the photo shoot.'),
  photographer: z.string().describe('The name of the assigned photographer.'),
});
export type ProjectDetailsOutput = z.infer<typeof ProjectDetailsOutputSchema>;

export async function extractProjectDetails(input: ProjectDetailsInput): Promise<ProjectDetailsOutput> {
  return extractProjectDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractProjectDetailsPrompt',
  input: {schema: ProjectDetailsInputSchema},
  output: {schema: ProjectDetailsOutputSchema},
  prompt: `You are an expert project manager specializing in photography projects. Your job is to extract
key details from a project description.

Given the following project description, extract the client name, date, location, and photographer.

Description: {{{description}}}

Ensure that the output is formatted as a JSON object.`, 
});

const extractProjectDetailsFlow = ai.defineFlow(
  {
    name: 'extractProjectDetailsFlow',
    inputSchema: ProjectDetailsInputSchema,
    outputSchema: ProjectDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
