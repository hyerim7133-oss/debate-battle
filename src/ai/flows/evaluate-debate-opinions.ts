'use server';
/**
 * @fileOverview An AI agent that evaluates two debate opinions for logical validity and persuasiveness,
 * assigning 'damage' values to reflect argument strength and providing an explanation.
 *
 * - evaluateDebateOpinions - A function that handles the opinion evaluation process.
 * - EvaluateDebateOpinionsInput - The input type for the evaluateDebateOpinions function.
 * - EvaluateDebateOpinionsOutput - The return type for the evaluateDebateOpinions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EvaluateDebateOpinionsInputSchema = z.object({
  proOpinion: z
    .string()
    .describe("The opinion presented by the 'pro' side of the debate."),
  conOpinion: z
    .string()
    .describe("The opinion presented by the 'con' side of the debate."),
});
export type EvaluateDebateOpinionsInput = z.infer<
  typeof EvaluateDebateOpinionsInputSchema
>;

const EvaluateDebateOpinionsOutputSchema = z.object({
  proDamage: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe(
      'The damage dealt by the pro side to the con side, reflecting the strength and persuasiveness of the pro argument. A value from 0 to 100.'
    ),
  conDamage: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe(
      'The damage dealt by the con side to the pro side, reflecting the strength and persuasiveness of the con argument. A value from 0 to 100.'
    ),
  explanation: z
    .string()
    .describe(
      'A brief explanation of why the assigned damage values were determined, highlighting the strengths and weaknesses of each argument.'
    ),
});
export type EvaluateDebateOpinionsOutput = z.infer<
  typeof EvaluateDebateOpinionsOutputSchema
>;

export async function evaluateDebateOpinions(
  input: EvaluateDebateOpinionsInput
): Promise<EvaluateDebateOpinionsOutput> {
  return evaluateDebateOpinionsFlow(input);
}

const evaluateDebatePrompt = ai.definePrompt({
  name: 'evaluateDebatePrompt',
  input: {schema: EvaluateDebateOpinionsInputSchema},
  output: {schema: EvaluateDebateOpinionsOutputSchema},
  prompt: `You are an impartial debate judge. Your task is to evaluate two opposing opinions based on their logical validity, persuasiveness, and overall strength.

Assign a 'damage' value to each side (pro and con) from 0 to 100. A higher damage value indicates a stronger, more valid, and more persuasive argument from that side, which would inflict more damage on their opponent.

If one argument is significantly stronger, its damage value should be much higher than the opponent's. If arguments are of similar strength, their damage values should be similar.

Provide a concise explanation for your decision, highlighting the key reasons for the assigned damage values, mentioning the strengths and weaknesses of each opinion.

Pro Opinion: {{{proOpinion}}}

Con Opinion: {{{conOpinion}}}`,
});

const evaluateDebateOpinionsFlow = ai.defineFlow(
  {
    name: 'evaluateDebateOpinionsFlow',
    inputSchema: EvaluateDebateOpinionsInputSchema,
    outputSchema: EvaluateDebateOpinionsOutputSchema,
  },
  async input => {
    const {output} = await evaluateDebatePrompt(input);
    return output!;
  }
);
