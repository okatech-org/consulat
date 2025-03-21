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
import { FullProfileInclude, FullUserInclude } from '@/types';
import { FullServiceRequestInclude } from '@/types/service-request';

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
      model: 'o1-mini',
      messages: [
        {
          role: 'user',
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

// Cache for user context data - keys are locale:userId:userRole
const contextCache: Record<string, { data: ContextData; timestamp: number }> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

export async function getUserContextData(
  locale: string,
  userId?: string,
  userRole?: UserRole,
): Promise<ContextData> {
  // Create a cache key using the input parameters
  const cacheKey = `${locale}:${userId || 'anonymous'}:${userRole || 'none'}`;

  // Check if we have a valid cached response
  const cachedData = contextCache[cacheKey];
  const now = Date.now();

  if (cachedData && now - cachedData.timestamp < CACHE_TTL) {
    // Use cached data if still valid
    return cachedData.data;
  }

  const defaultContext: ContextData = {
    user: 'No connected user',
    assistantPrompt: RAY_AGENT_PROMPT,
    knowledgeBase: getKnowledgeBaseContext(),
    language: locale,
  };

  if (!userId || !userRole) {
    // Cache and return the default context
    contextCache[cacheKey] = { data: defaultContext, timestamp: now };
    return defaultContext;
  }

  try {
    let contextData: ContextData;

    switch (userRole) {
      case 'USER':
        contextData = await getUserContextDataForUser(userId, locale);
        break;
      case 'SUPER_ADMIN':
        contextData = await getUserContextDataSuperAdmin(userId, locale);
        break;
      case 'AGENT':
        contextData = await getUserContextDataAgent(userId, locale);
        break;
      case 'ADMIN':
        contextData = await getUserContextDataAdmin(userId, locale);
        break;
      default:
        contextData = defaultContext;
    }

    // Store the result in cache
    contextCache[cacheKey] = { data: contextData, timestamp: now };
    return contextData;
  } catch (error) {
    console.error('Error fetching user context data:', error);
    // Cache the error response as well to prevent repeated failed requests
    contextCache[cacheKey] = { data: defaultContext, timestamp: now };
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
        ...FullUserInclude,
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
        ...FullProfileInclude,
      }),
      db.serviceRequest.findMany({
        where: { assignedToId: userId },
      }),
      db.appointment.findMany({
        where: { attendeeId: userId },
      }),
      db.notification.findMany({
        where: { userId },
      }),
    ]);

  if (user) {
    baseData.user = JSON.stringify({
      id: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      name: user.name,
      role: user.roles,
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
      }),
      db.serviceRequest.groupBy({
        by: ['status'],
        _count: {
          status: true,
        },
      }),
      db.user.findMany({
        where: { roles: { has: UserRole.USER } },
        include: {
          profile: true,
        },
      }),
    ]);

    if (user) {
      baseData.user = JSON.stringify({
        id: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        name: user.name,
        role: user.roles,
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
        ...FullUserInclude,
      }),
      db.profile.findMany({
        where: { userId },
        ...FullProfileInclude,
      }),
      db.notification.findMany({
        where: { userId },
      }),
      db.appointment.findMany({
        where: {
          attendeeId: userId,
        },
      }),
    ]);

    if (user) {
      baseData.user = JSON.stringify({
        id: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        name: user.name,
        role: user.roles,
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
        ...FullUserInclude,
      }),
      db.serviceRequest.findMany({
        where: { assignedToId: userId },
        ...FullServiceRequestInclude,
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
        phoneNumber: user.phoneNumber,
        name: user.name,
        role: user.roles,
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
