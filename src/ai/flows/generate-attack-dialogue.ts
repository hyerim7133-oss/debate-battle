'use server';
/**
 * @fileOverview A Genkit flow for generating an attack dialogue or summary of a winning point in a debate battle.
 *
 * - generateAttackDialogue - A function that generates a concise attack dialogue based on debate opinions.
 * - GenerateAttackDialogueInput - The input type for the generateAttackDialogue function.
 * - GenerateAttackDialogueOutput - The return type for the generateAttackDialogue function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateAttackDialogueInputSchema = z.object({
  winningOpinion: z.string().describe('The opinion that was deemed more valid or persuasive.'),
  losingOpinion: z.string().describe('The opinion that was deemed less valid or persuasive.'),
  comparisonResultSummary: z
    .string()
    .describe('A summary of why the winning opinion was stronger than the losing opinion.'),
});
export type GenerateAttackDialogueInput = z.infer<
  typeof GenerateAttackDialogueInputSchema
>;

const GenerateAttackDialogueOutputSchema = z
  .string()
  .describe('A concise, AI-generated attack dialogue or summary of the winning point.');
export type GenerateAttackDialogueOutput = z.infer<
  typeof GenerateAttackDialogueOutputSchema
>;

export async function generateAttackDialogue(
  input: GenerateAttackDialogueInput
): Promise<GenerateAttackDialogueOutput> {
  return generateAttackDialogueFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAttackDialoguePrompt',
  input: { schema: GenerateAttackDialogueInputSchema },
  output: { schema: GenerateAttackDialogueOutputSchema },
  prompt: `You are an AI assistant tasked with generating a concise, impactful attack dialogue for a debate battle game.
Your goal is to explain why one opinion was stronger than another, in a short and engaging way.

Winning Opinion: "{{{winningOpinion}}}"
Losing Opinion: "{{{losingOpinion}}}"
Comparison Summary: "{{{comparisonResultSummary}}}"

Based on the information above, generate a single, short sentence (under 20 words) that represents the core reason the winning opinion dealt damage. Make it sound like a direct attack or a clear statement of superiority.

Example Output: "Your point lacks evidence!"
Example Output: "My logic crushes your weak argument!"
Example Output: "Fact-based reasoning prevails!"

Attack Dialogue:`,
});

const generateAttackDialogueFlow = ai.defineFlow(
  {
    name: 'generateAttackDialogueFlow',
    inputSchema: GenerateAttackDialogueInputSchema,
    outputSchema: GenerateAttackDialogueOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
