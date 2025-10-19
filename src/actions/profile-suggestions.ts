'use server';

import { ContextBuilder } from '@/lib/ai/context-builder';
import type { CompleteProfile } from '@/convex/lib/types';
import type { User } from '@prisma/client';
import { PROFILE_ANALYSIS_PROMPT } from '@/lib/ai/prompts';
import { getChatCompletion } from '@/lib/ai/actions';

export async function analyzeProfile(
  profile: CompleteProfile,
  user: User,
  locale: string,
) {
  try {
    const context = ContextBuilder.buildContext({
      user: JSON.stringify(user, null, 2),
      profileData: JSON.stringify(profile, null, 2),
      language: locale,
      assistantPrompt: PROFILE_ANALYSIS_PROMPT,
      knowledgeBase: '',
    });

    const aiResponse = await getChatCompletion('', context, []);

    if (!aiResponse) {
      throw new Error("Réponse de l'IA vide");
    }

    // Extraire le JSON de la réponse
    const jsonMatch = aiResponse;

    if (!jsonMatch) {
      throw new Error('Format de réponse invalide');
    }

    return JSON.parse(jsonMatch[1] || jsonMatch[0] || '');
  } catch (error) {
    console.error('Error analyzing components:', error);
    return {
      suggestions: [],
    };
  }
}
