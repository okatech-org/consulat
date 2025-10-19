'use server';

import OpenAI from 'openai';
import type { ContextData } from '@/lib/ai/types';
import { db } from '@/server/db';
import { UserRole, ServiceCategory } from '@prisma/client';
import { getKnowledgeBaseContext } from '@/lib/ai/knowledge-base';
import {
  ADMIN_CONSULAIRE_PROMPT,
  MANAGER_PROMPT,
  RAY_AGENT_PROMPT,
  SUPER_ADMIN_PROMPT,
} from '@/lib/ai/prompts';
import { CompleteProfileInclude, FullUserInclude } from '@/types';
import { FullServiceRequestInclude } from '@/types/service-request';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '@/env';
import type { ChatMessage } from './types';
import { calculateProfileCompletion } from '@/lib/utils';

let openAIClient: OpenAI | null = null;
function getOpenAIClient(): OpenAI {
  if (!openAIClient) {
    openAIClient = new OpenAI();
  }
  return openAIClient;
}

let geminiClient: GoogleGenerativeAI | null = null;
let geminiModelSingleton: ReturnType<GoogleGenerativeAI['getGenerativeModel']> | null =
  null;
function getGeminiModel() {
  if (!geminiClient) {
    // Instanciation paresseuse pour éviter l'exigence de clé au build
    if (!env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is required at runtime');
    }
    geminiClient = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  }
  if (!geminiModelSingleton) {
    geminiModelSingleton = geminiClient.getGenerativeModel({
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 4096,
      },
    });
  }
  return geminiModelSingleton;
}

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
      await getOpenAIClient().chat.completions.create(params);
    const responseContent = completion.choices[0]?.message?.content;

    return responseContent || null;
  } catch (error) {
    console.error('Error generating chat completion with context:', error);
    return null;
  }
}

export async function getUserContextData(
  userId: string | undefined,
  locale: string,
): Promise<ContextData> {
  const defaultContext: ContextData = {
    user: 'No connected user',
    assistantPrompt: RAY_AGENT_PROMPT,
    knowledgeBase: getKnowledgeBaseContext(),
    language: locale,
  };

  if (!userId) {
    return defaultContext;
  }

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        roles: true,
      },
    });

    if (!user) {
      return defaultContext;
    }

    let contextData: ContextData;

    // Get the highest role
    const highestRole = user.roles.reduce((highest, role) => {
      const roleOrder = {
        SUPER_ADMIN: 4,
        ADMIN: 3,
        MANAGER: 2,
        AGENT: 1,
        USER: 0,
      };
      return roleOrder[role] > roleOrder[highest] ? role : highest;
    }, user.roles[0]);

    // Get context based on role
    switch (highestRole) {
      case 'SUPER_ADMIN':
        contextData = await getUserContextDataSuperAdmin(userId, locale);
        break;
      case 'ADMIN':
        contextData = await getUserContextDataAdmin(userId, locale);
        break;
      case 'MANAGER':
        contextData = await getUserContextDataManager(userId, locale);
        break;
      case 'AGENT':
        contextData = await getUserContextDataAgent(userId, locale);
        break;
      default:
        contextData = await getUserContextDataForUser(userId, locale);
    }

    return contextData;
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

  try {
    // First fetch the user to get the country code
    const user = await db.user.findUnique({
      where: { id: userId },
      ...FullUserInclude,
    });

    if (!user) {
      return baseData;
    }

    // Then fetch all other data in parallel
    const [
      profile,
      appointments,
      notifications,
      country,
      serviceRequests,
      availableServices,
    ] = await Promise.all([
      db.profile.findUnique({
        where: { userId },
        ...CompleteProfileInclude,
      }),
      db.appointment.findMany({
        where: {
          attendee: {
            id: userId,
          },
          status: 'CONFIRMED',
          startTime: {
            gte: new Date(),
          },
        },
        orderBy: {
          startTime: 'asc',
        },
        take: 5,
      }),
      db.notification.findMany({
        where: {
          userId,
          read: false,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      }),
      db.country.findUnique({
        where: { code: user.countryCode || '' },
      }),
      db.serviceRequest.findMany({
        where: { submittedById: userId },
        ...FullServiceRequestInclude,
      }),
      db.consularService.findMany({
        where: {
          isActive: true,
          organization: {
            countries: {
              some: {
                code: user.countryCode || '',
              },
            },
          },
        },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              type: true,
              appointmentSettings: true,
            },
          },
        },
        orderBy: {
          category: 'asc',
        },
      }),
    ]);

    // Special handling for consular registration service
    const consularRegistrationService = {
      id: 'consular-registration-special',
      name: 'Inscription Consulaire',
      description:
        "Service obligatoire pour tous les ressortissants gabonais résidant à l'étranger. Ce service est gratuit et doit être effectué avant toute autre démarche consulaire.",
      category: ServiceCategory.REGISTRATION,
      isActive: true,
      isFree: true,
      requiredDocuments: ['PASSPORT', 'PROOF_OF_ADDRESS', 'IDENTITY_PHOTO'],
      processingTime: '24-48 heures',
      special: true,
    };

    // Format services for context
    const servicesData = {
      consularRegistration: consularRegistrationService,
      availableServices: availableServices.map((service) => ({
        id: service.id,
        name: service.name,
        description: service.description,
        category: service.category,
        organization: service.organization?.name,
        organizationType: service.organization?.type,
        isFree: service.isFree,
        price: service.price,
        currency: service.currency,
        requiresAppointment: service.requiresAppointment,
        appointmentDuration: service.appointmentDuration,
        requiredDocuments: service.requiredDocuments,
        optionalDocuments: service.optionalDocuments,
        processingMode: service.processingMode,
        deliveryMode: service.deliveryMode,
      })),
      totalServices: availableServices.length + 1, // +1 for consular registration
    };

    // Update base data with all information
    baseData.user = JSON.stringify({
      id: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      name: user.name,
      role: user.roles,
      countryCode: user.countryCode,
    });

    if (country) {
      baseData.countryData = JSON.stringify({
        name: country.name,
        code: country.code,
        flag: country.flag,
        organizations: await db.organization.count({
          where: { countries: { some: { code: country.code } } },
        }),
      });
    }

    if (profile) {
      baseData.profileData = JSON.stringify({
        ...profile,
        completionPercentage: calculateProfileCompletion(profile),
      });
    }

    baseData.serviceRequestsData = JSON.stringify(serviceRequests);
    baseData.appointmentData = JSON.stringify(appointments);
    baseData.notificationsData = JSON.stringify(notifications);

    // Add services data to context
    baseData.availableServicesData = JSON.stringify(servicesData);

    return baseData;
  } catch (error) {
    console.error('Error fetching user context data:', error);
    return baseData;
  }
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
    // First fetch the user to get the country code
    const user = await db.user.findUnique({
      where: { id: userId },
      ...FullUserInclude,
    });

    if (!user) {
      return baseData;
    }

    // Then fetch all other data in parallel
    const [
      organizations,
      notifications,
      appointments,
      allServices,
      totalRequests,
      pendingRequests,
      totalUsers,
    ] = await Promise.all([
      db.organization.findMany({
        include: {
          adminUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          agents: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          services: {
            where: {
              isActive: true,
            },
            include: {
              _count: {
                select: { requests: true },
              },
            },
          },
        },
      }),
      db.notification.findMany({
        where: { userId },
      }),
      db.appointment.findMany({
        where: {
          startTime: {
            gte: new Date(),
          },
        },
        orderBy: {
          startTime: 'asc',
        },
        include: {
          service: true,
          attendee: true,
          agent: true,
          organization: true,
        },
      }),
      db.consularService.findMany({
        where: {
          isActive: true,
        },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              type: true,
              appointmentSettings: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: { requests: true },
          },
        },
      }),
      db.serviceRequest.count(),
      db.serviceRequest.count({
        where: {
          status: {
            in: ['PENDING', 'PENDING_COMPLETION'],
          },
        },
      }),
      db.user.count(),
    ]);

    // Update base data with all information
    baseData.user = JSON.stringify({
      id: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      name: user.name,
      role: user.roles,
      countryCode: user.countryCode,
    });

    baseData.superAdminData = JSON.stringify({
      organizations: organizations.map((org) => ({
        id: org.id,
        name: org.name,
        type: org.type,
        admin: org.adminUser,
        totalAgents: org.agents.length,
        totalServices: org.services.length,
        totalRequests: org.services.reduce((acc, svc) => acc + svc._count.requests, 0),
      })),
      notifications,
      appointments: appointments.map((apt) => ({
        id: apt.id,
        date: apt.startTime,
        service: apt.service?.name,
        attendee: apt.attendee.name,
        agent: apt.agent?.name,
        organization: apt.organization.name,
      })),
      services: allServices.map((service) => ({
        id: service.id,
        name: service.name,
        description: service.description,
        category: service.category,
        organization: service.organization?.name,
        organizationType: service.organization?.type,
        assignedAgents: service.assignedTo.length,
        activeRequests: service._count.requests,
        isFree: service.isFree,
        price: service.price,
        currency: service.currency,
        requiresAppointment: service.requiresAppointment,
        appointmentDuration: service.appointmentDuration,
        requiredDocuments: service.requiredDocuments,
        optionalDocuments: service.optionalDocuments,
        processingMode: service.processingMode,
        deliveryMode: service.deliveryMode,
      })),
      totalServices: allServices.length,
      totalOrganizations: organizations.length,
      totalRequests,
      pendingRequests,
      totalUsers,
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
    // First fetch the user to get the country code
    const user = await db.user.findUnique({
      where: { id: userId },
      ...FullUserInclude,
    });

    if (!user) {
      return baseData;
    }

    // Then fetch all other data in parallel
    const [consularProfiles, notifications, appointments, managedServices] =
      await Promise.all([
        db.profile.findMany({
          where: { userId },
          ...CompleteProfileInclude,
        }),
        db.notification.findMany({
          where: { userId },
        }),
        db.appointment.findMany({
          where: {
            agent: {
              id: userId,
            },
            startTime: {
              gte: new Date(),
            },
          },
          orderBy: {
            startTime: 'asc',
          },
          include: {
            service: true,
            attendee: true,
          },
        }),
        db.consularService.findMany({
          where: {
            assignedTo: {
              some: { id: userId },
            },
            isActive: true,
          },
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                type: true,
                appointmentSettings: true,
              },
            },
            _count: {
              select: { requests: true },
            },
          },
        }),
      ]);

    // Update base data with all information
    baseData.user = JSON.stringify({
      id: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      name: user.name,
      role: user.roles,
      countryCode: user.countryCode,
    });

    baseData.agentData = JSON.stringify({
      profiles: consularProfiles,
      notifications,
      appointments,
      managedServices: managedServices.map((service) => ({
        id: service.id,
        name: service.name,
        description: service.description,
        category: service.category,
        organization: service.organization?.name,
        organizationType: service.organization?.type,
        activeRequests: service._count.requests,
        isFree: service.isFree,
        price: service.price,
        currency: service.currency,
        requiresAppointment: service.requiresAppointment,
        appointmentDuration: service.appointmentDuration,
        requiredDocuments: service.requiredDocuments,
        optionalDocuments: service.optionalDocuments,
        processingMode: service.processingMode,
        deliveryMode: service.deliveryMode,
      })),
      totalManagedServices: managedServices.length,
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

async function getUserContextDataManager(
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
    // First fetch the user to get the country code
    const user = await db.user.findUnique({
      where: { id: userId },
      ...FullUserInclude,
    });

    if (!user) {
      return baseData;
    }

    // Then fetch all other data in parallel
    const [managedAgents, notifications, appointments, organizationServices] =
      await Promise.all([
        db.user.findMany({
          where: {
            managedByUserId: userId,
            roles: {
              has: 'AGENT',
            },
          },
          include: {
            assignedServices: true,
            assignedRequests: {
              where: {
                status: {
                  in: ['PENDING', 'PENDING_COMPLETION'],
                },
              },
            },
          },
        }),
        db.notification.findMany({
          where: { userId },
        }),
        db.appointment.findMany({
          where: {
            agent: {
              managedByUserId: userId,
            },
            startTime: {
              gte: new Date(),
            },
          },
          orderBy: {
            startTime: 'asc',
          },
          include: {
            service: true,
            attendee: true,
            agent: true,
          },
        }),
        db.consularService.findMany({
          where: {
            organization: {
              adminUser: {
                id: userId,
              },
            },
            isActive: true,
          },
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                type: true,
                appointmentSettings: true,
              },
            },
            assignedTo: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            _count: {
              select: { requests: true },
            },
          },
        }),
      ]);

    // Update base data with all information
    baseData.user = JSON.stringify({
      id: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      name: user.name,
      role: user.roles,
      countryCode: user.countryCode,
    });

    baseData.adminManagerData = JSON.stringify({
      agents: managedAgents.map((agent) => ({
        id: agent.id,
        name: agent.name,
        email: agent.email,
        assignedServices: agent.assignedServices.length,
        pendingRequests: agent.assignedRequests.length,
      })),
      notifications,
      appointments: appointments.map((apt) => ({
        id: apt.id,
        date: apt.startTime,
        service: apt.service?.name,
        attendee: apt.attendee.name,
        agent: apt.agent?.name,
      })),
      services: organizationServices.map((service) => ({
        id: service.id,
        name: service.name,
        description: service.description,
        category: service.category,
        organization: service.organization?.name,
        organizationType: service.organization?.type,
        assignedAgents: service.assignedTo.length,
        activeRequests: service._count.requests,
        isFree: service.isFree,
        price: service.price,
        currency: service.currency,
        requiresAppointment: service.requiresAppointment,
        appointmentDuration: service.appointmentDuration,
        requiredDocuments: service.requiredDocuments,
        optionalDocuments: service.optionalDocuments,
        processingMode: service.processingMode,
        deliveryMode: service.deliveryMode,
      })),
      totalServices: organizationServices.length,
      totalAgents: managedAgents.length,
    });

    return baseData;
  } catch (error) {
    console.error('Error fetching Manager context data:', error);
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

/**
 * Server Action to generate chat completion with Gemini
 */
export async function getGeminiChatCompletion(
  messages: ChatMessage[],
  contextData: ContextData,
) {
  try {
    // Format messages for Gemini
    const formattedMessages = messages.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{ text: msg.content }],
    }));

    // Create a chat session
    const chat = getGeminiModel().startChat({
      history: formattedMessages.slice(0, -1), // All messages except the last one
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 4096,
      },
    });

    // Send the last message with context
    const lastMessage = messages[messages.length - 1];
    const response = await chat.sendMessage(
      `${lastMessage?.content}\n\nContext:\n${JSON.stringify(contextData)}`,
    );

    // Get the response text
    const responseText = response.response.text();

    return {
      role: 'assistant' as const,
      content: responseText,
    };
  } catch (error) {
    console.error('Error in Gemini chat completion:', error);
    throw error;
  }
}
