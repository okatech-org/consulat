'use server';

import { AssistantFactory } from '@/lib/ai/assistant-factory';
import { ContextBuilder } from '@/lib/ai/context-builder';
import { FullProfile } from '@/types';
import { User } from '@prisma/client';
import { PROFILE_ANALYSIS_PROMPT } from '@/lib/ai/prompts';

export async function analyzeProfile(profile: FullProfile, user: User) {
  try {
    const context = await ContextBuilder.buildContext(user, profile);
    const assistant = AssistantFactory.createAssistant(context);

    const profileData = JSON.stringify(profile, null, 2);
    const response = await assistant.handleMessage(
      `${PROFILE_ANALYSIS_PROMPT}\n\nProfil à analyser:\n${profileData}`,
    );

    if (response.error) {
      throw new Error(response.error);
    }

    // Extraire le JSON de la réponse
    const jsonMatch =
      response.message.match(/```json\n([\s\S]*)\n```/) ||
      response.message.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('Format de réponse invalide');
    }

    return JSON.parse(jsonMatch[1] || jsonMatch[0]);
  } catch (error) {
    console.error('Error analyzing components:', error);
    return {
      suggestions: [],
    };
  }
}
