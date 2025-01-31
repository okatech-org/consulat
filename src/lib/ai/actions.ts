'use server';

'use server';

import OpenAI from 'openai';
import { ContextData } from '@/lib/ai/types';
import { db } from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import { getKnowledgeBaseContext } from '@/lib/ai/knowledge-base';
import {
  ADMIN_CONSULAIRE_PROMPT,
  MANAGER_PROMPT,
  RAY_AGENT_PROMPT,
  SUPER_ADMIN_PROMPT,
} from '@/lib/ai/prompts';

const openai = new OpenAI();

/**
 * Server Action to generate chat completion with context and chat history.
 *
 * @param {string} userMessage - The user's input message.
 * @param {string} context - Contextual information to guide the AI's response.
 * @param {OpenAI.Chat.ChatCompletionMessageParam[]} history - Array of previous chat messages.
 * @returns {Promise<string | null>} - AI-generated text response or null on error.
 */
export async function getChatCompletion(
  userMessage: string,
  context: string,
  history: OpenAI.Chat.ChatCompletionMessageParam[],
): Promise<string | null> {
  try {
    const params: OpenAI.Chat.ChatCompletionCreateParams = {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'developer',
          content: context,
        },
        ...history,
        {
          role: 'user',
          content: userMessage,
        },
      ],
    };

    const completion: OpenAI.Chat.ChatCompletion =
      await openai.chat.completions.create(params);
    const responseContent = completion.choices[0]?.message?.content;

    return responseContent || null;
  } catch (error) {
    console.error('Error generating chat completion with context:', error);
    return null;
  }
}

export async function getUserContextData(
  locale: string,
  userId?: string,
  userRole?: UserRole,
): Promise<ContextData> {
  const defaultContext: ContextData = {
    user: 'No connected user',
    assistantPrompt: RAY_AGENT_PROMPT,
    knowledgeBase: getKnowledgeBaseContext(),
    language: locale,
  };

  if (!userId || !userRole) {
    return defaultContext;
  }

  try {
    switch (userRole) {
      case 'USER':
        return getUserContextDataForUser(userId, locale);
      case 'SUPER_ADMIN':
        return getUserContextDataSuperAdmin(userId, locale);
      case 'AGENT':
        return getUserContextDataAgent(userId, locale);
      case 'ADMIN':
        return getUserContextDataAdmin(userId, locale);
      default:
        return defaultContext;
    }
  } catch (error) {
    console.error('Error fetching user context data:', error);
    return defaultContext;
  }
}

async function getUserContextDataForUser(
  userId: string,
  locale: string,
): Promise<ContextData> {
  const baseData: ContextData = {
    user: 'No connected user',
    assistantPrompt: RAY_AGENT_PROMPT,
    knowledgeBase: getKnowledgeBaseContext(),
    language: locale,
  };

  const [user, country, profile, serviceRequests, appointment, notifications] =
    await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        include: {
          phone: true,
        },
      }),
      db.country.findUnique({
        where: { id: userId },
        include: {
          organizations: {
            include: {
              services: true,
            },
          },
        },
      }),
      db.profile.findUnique({
        where: { id: userId },
        include: {
          identityPicture: true,
          passport: true,
          birthCertificate: true,
          residencePermit: true,
          addressProof: true,
          address: true,
          phone: true,
          emergencyContact: true,
          addressInGabon: true,
          notes: true,
          notifications: true,
        },
      }),
      db.serviceRequest.findMany({
        where: { userId },
      }),
      db.appointment.findMany({
        where: { userId },
      }),
      db.notification.findMany({
        where: { userId },
      }),
    ]);

  if (user) {
    baseData.user = JSON.stringify({
      id: user.id,
      email: user.email,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    });
  }

  if (country) {
    baseData.countryData = JSON.stringify(country);
  }

  if (profile) {
    baseData.profileData = JSON.stringify(profile);
  }

  if (serviceRequests) {
    baseData.serviceRequestsData = JSON.stringify(serviceRequests);
  }

  if (appointment) {
    baseData.appointmentData = JSON.stringify(appointment);
  }

  if (notifications) {
    baseData.notificationsData = JSON.stringify(notifications);
  }

  return baseData;
}

async function getUserContextDataSuperAdmin(
  userId: string,
  locale: string,
): Promise<ContextData> {
  const baseData: ContextData = {
    user: 'No connected user',
    assistantPrompt: SUPER_ADMIN_PROMPT,
    knowledgeBase: getKnowledgeBaseContext(),
    language: locale,
  };

  try {
    const [user, statistics, activities] = await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        include: {
          phone: true,
        },
      }),
      db.serviceRequest.groupBy({
        by: ['status'],
        _count: {
          status: true,
        },
      }),
      db.user.findMany({
        where: { role: { not: 'SUPER_ADMIN' } },
        include: {
          profile: true,
          serviceRequests: true,
        },
      }),
    ]);

    if (user) {
      baseData.user = JSON.stringify({
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      });
    }

    baseData.superAdminData = JSON.stringify({
      statistics,
      activities,
    });

    return baseData;
  } catch (error) {
    console.error('Error fetching Super Admin context data:', error);
    return baseData;
  }
}

async function getUserContextDataAgent(
  userId: string,
  locale: string,
): Promise<ContextData> {
  const baseData: ContextData = {
    user: 'No connected user',
    assistantPrompt: MANAGER_PROMPT,
    knowledgeBase: getKnowledgeBaseContext(),
    language: locale,
  };

  try {
    const [user, consularProfiles, notifications, appointments] = await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        include: {
          phone: true,
        },
      }),
      db.profile.findMany({
        where: { userId },
        include: {
          identityPicture: true,
          passport: true,
          birthCertificate: true,
          residencePermit: true,
          addressProof: true,
          address: true,
          phone: true,
          emergencyContact: true,
          addressInGabon: true,
          notes: true,
          notifications: true,
        },
      }),
      db.notification.findMany({
        where: { userId },
      }),
      db.appointment.findMany({
        where: { userId },
      }),
    ]);

    if (user) {
      baseData.user = JSON.stringify({
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      });
    }

    baseData.agentData = JSON.stringify({
      profiles: consularProfiles,
      notifications,
      appointments,
    });

    return baseData;
  } catch (error) {
    console.error('Error fetching Agent context data:', error);
    return baseData;
  }
}

async function getUserContextDataAdmin(
  userId: string,
  locale: string,
): Promise<ContextData> {
  const baseData: ContextData = {
    user: 'No connected user',
    assistantPrompt: ADMIN_CONSULAIRE_PROMPT,
    knowledgeBase: getKnowledgeBaseContext(),
    language: locale,
  };

  try {
    const [user, serviceRequests, consularStatistics] = await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        include: {
          phone: true,
        },
      }),
      db.serviceRequest.findMany({
        where: { userId },
      }),
      db.serviceRequest.groupBy({
        by: ['status'],
        _count: {
          status: true,
        },
      }),
    ]);

    if (user) {
      baseData.user = JSON.stringify({
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      });
    }

    baseData.adminManagerData = JSON.stringify({
      serviceRequests,
      statistics: consularStatistics,
    });

    return baseData;
  } catch (error) {
    console.error('Error fetching Admin context data:', error);
    return baseData;
  }
}

export async function storeQuestion(question: string) {
  try {
    await db.aIQuestion.create({
      data: { question, userRole: UserRole.USER, category: 'general' },
    });
  } catch (error) {
    console.error('Error storing question:', error);
  }
}
