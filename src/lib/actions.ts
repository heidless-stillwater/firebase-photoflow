'use server';

import { generateInitialCaption } from '@/ai/flows/generate-initial-caption';

export async function getAiCaption(
  photoDataUri: string
): Promise<{ caption: string } | { error: string }> {
  if (!photoDataUri) {
    return { error: 'Photo data is missing.' };
  }

  try {
    const { caption } = await generateInitialCaption({ photoDataUri });
    return { caption };
  } catch (error) {
    console.error('Error generating caption:', error);
    return { error: 'Failed to generate caption. Please try again.' };
  }
}
