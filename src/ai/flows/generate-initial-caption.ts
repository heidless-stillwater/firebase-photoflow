'use server';

/**
 * @fileOverview An AI agent to generate an initial caption for a photo.
 *
 * - generateInitialCaption - A function that handles the caption generation process.
 * - GenerateInitialCaptionInput - The input type for the generateInitialCaption function.
 * - GenerateInitialCaptionOutput - The return type for the generateInitialCaption function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInitialCaptionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateInitialCaptionInput = z.infer<typeof GenerateInitialCaptionInputSchema>;

const GenerateInitialCaptionOutputSchema = z.object({
  caption: z.string().describe('The generated caption for the photo.'),
});
export type GenerateInitialCaptionOutput = z.infer<typeof GenerateInitialCaptionOutputSchema>;

export async function generateInitialCaption(input: GenerateInitialCaptionInput): Promise<GenerateInitialCaptionOutput> {
  return generateInitialCaptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInitialCaptionPrompt',
  input: {schema: GenerateInitialCaptionInputSchema},
  output: {schema: GenerateInitialCaptionOutputSchema},
  prompt: `You are an AI assistant that generates captions for photos.

  Generate a short caption for the photo.

  Photo: {{media url=photoDataUri}}`,
});

const generateInitialCaptionFlow = ai.defineFlow(
  {
    name: 'generateInitialCaptionFlow',
    inputSchema: GenerateInitialCaptionInputSchema,
    outputSchema: GenerateInitialCaptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
