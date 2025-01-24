'use server';

import { getCurrentUser } from '@/actions/user';
import { ContextBuilder } from '@/lib/ai/context-builder';
import { AssistantFactory } from '@/lib/ai/assistant-factory';
import { getUserFullProfile } from '@/lib/user/getters';
import { FullProfile } from '@/types';

export async function chatWithAssistant(message: string) {
  try {
    const user = await getCurrentUser();
    const profile = user?.id
      ? ((await getUserFullProfile(user.id)) ?? (user as unknown as FullProfile))
      : (user as unknown as FullProfile);

    const context = await ContextBuilder.buildContext(user, profile);
    const assistant = AssistantFactory.createAssistant(context);

    return await assistant.handleMessage(message);
  } catch (error) {
    console.error('Error in chat action:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to get response: ${error.message}`);
    }
    throw new Error('An unknown error occurred');
  }
}
