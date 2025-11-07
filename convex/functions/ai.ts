import { v } from 'convex/values';
import { action, internalQuery } from '../_generated/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ContextBuilder } from '../lib/ai/contextBuilder';
import { getKnowledgeBaseContext } from '../lib/ai/knowledgeBase';
import {
  RAY_AGENT_PROMPT,
  SUPER_ADMIN_PROMPT,
  ADMIN_CONSULAIRE_PROMPT,
  MANAGER_PROMPT,
  PROFILE_ANALYSIS_PROMPT,
} from '../lib/ai/prompts';
import type { ContextData, StructuredOutput } from '../lib/ai/types';
import { GeminiVisionAnalyzer } from '../lib/ai/geminiAnalyzer';
import { internal } from '../_generated/api';
import { UserRole } from '../lib/constants';

let geminiClient: GoogleGenerativeAI | null = null;
let geminiModelSingleton: ReturnType<GoogleGenerativeAI['getGenerativeModel']> | null =
  null;
const GEMINI_MODEL = 'gemini-2.0-flash-exp';
const API_KEY = process.env.GEMINI_API_KEY;

function getGeminiModel() {
  if (!API_KEY) {
    throw new Error('GEMINI_API_KEY is not set');
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenerativeAI(API_KEY);
  }
  if (!geminiModelSingleton) {
    geminiModelSingleton = geminiClient.getGenerativeModel({
      model: GEMINI_MODEL,
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

export const getChatCompletion = action({
  args: {
    userId: v.optional(v.id('users')),
    locale: v.string(),
    messages: v.array(
      v.object({
        role: v.union(v.literal('user'), v.literal('assistant'), v.literal('system')),
        content: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    try {
      const context = ContextBuilder.buildContext(
        await ctx.runQuery(internal.functions.ai.getUserContextData, {
          userId: args.userId,
          locale: args.locale,
        }),
      );

      const formattedHistory = args.messages.map((msg) => ({
        role: msg.role === 'assistant' ? ('model' as const) : ('user' as const),
        parts: [{ text: msg.content }],
      }));

      const chat = getGeminiModel().startChat({
        history: formattedHistory.slice(0, -1),
      });

      const lastMessage = args.messages[args.messages.length - 1];
      const result = await chat.sendMessage(
        `${context}\n\nUser message: ${lastMessage?.content}`,
      );
      const response = await result.response;

      if (!response.candidates || response.candidates.length === 0) {
        console.error('No response candidates from Gemini');
        return null;
      }

      const text = response.text();
      if (!text) {
        console.error('Empty response from Gemini');
        return null;
      }

      return {
        role: 'assistant' as const,
        content: text,
      };
    } catch (error) {
      console.error('Error generating chat completion with Gemini:', error);
      throw error;
    }
  },
});

export const getUserContextData = internalQuery({
  args: {
    userId: v.optional(v.id('users')),
    locale: v.string(),
  },
  handler: async (ctx, args): Promise<ContextData> => {
    const defaultContext: ContextData = {
      user: 'No connected user',
      assistantPrompt: RAY_AGENT_PROMPT,
      knowledgeBase: getKnowledgeBaseContext(),
      language: args.locale,
    };

    if (!args.userId) {
      return defaultContext;
    }

    try {
      const user = await ctx.db.get(args.userId);

      if (!user) {
        return defaultContext;
      }

      const highestRole = user.roles.reduce((highest, role) => {
        const roleOrder: Record<UserRole, number> = {
          [UserRole.SuperAdmin]: 4,
          [UserRole.Admin]: 3,
          [UserRole.IntelAgent]: 3,
          [UserRole.EducationAgent]: 3,
          [UserRole.Manager]: 2,
          [UserRole.Agent]: 1,
          [UserRole.User]: 0,
        };
        return roleOrder[role] > roleOrder[highest] ? role : highest;
      }, user.roles[0]);

      switch (highestRole) {
        case UserRole.SuperAdmin:
          return await ctx.runQuery(internal.functions.ai.getUserContextDataSuperAdmin, {
            userId: args.userId,
            locale: args.locale,
          });
        case UserRole.Admin:
          return await ctx.runQuery(internal.functions.ai.getUserContextDataAdmin, {
            userId: args.userId,
            locale: args.locale,
          });
        case UserRole.Manager:
          return await ctx.runQuery(internal.functions.ai.getUserContextDataManager, {
            userId: args.userId,
            locale: args.locale,
          });
        case UserRole.Agent:
          return await ctx.runQuery(internal.functions.ai.getUserContextDataAgent, {
            userId: args.userId,
            locale: args.locale,
          });
        default:
          return await ctx.runQuery(internal.functions.ai.getUserContextDataForUser, {
            userId: args.userId,
            locale: args.locale,
          });
      }
    } catch (error) {
      console.error('Error fetching user context data:', error);
      return defaultContext;
    }
  },
});

export const getUserContextDataForUser = internalQuery({
  args: {
    userId: v.id('users'),
    locale: v.string(),
  },
  handler: async (ctx, args) => {
    const baseData: ContextData = {
      user: 'No connected user',
      assistantPrompt: RAY_AGENT_PROMPT,
      knowledgeBase: getKnowledgeBaseContext(),
      language: args.locale,
    };

    try {
      const user = await ctx.db.get(args.userId);

      if (!user) {
        return baseData;
      }

      baseData.user = JSON.stringify({
        id: user._id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        name: user.firstName + ' ' + user.lastName,
        roles: user.roles,
        countryCode: user.countryCode,
      });

      return baseData;
    } catch (error) {
      console.error('Error fetching user context data:', error);
      return baseData;
    }
  },
});

export const getUserContextDataSuperAdmin = internalQuery({
  args: {
    userId: v.id('users'),
    locale: v.string(),
  },
  handler: async (ctx, args) => {
    const baseData: ContextData = {
      user: 'No connected user',
      assistantPrompt: SUPER_ADMIN_PROMPT,
      knowledgeBase: getKnowledgeBaseContext(),
      language: args.locale,
    };

    try {
      const user = await ctx.db.get(args.userId);

      if (!user) {
        return baseData;
      }

      baseData.user = JSON.stringify({
        id: user._id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        name: user.firstName + ' ' + user.lastName,
        roles: user.roles,
        countryCode: user.countryCode,
      });

      return baseData;
    } catch (error) {
      console.error('Error fetching Super Admin context data:', error);
      return baseData;
    }
  },
});

export const getUserContextDataAgent = internalQuery({
  args: {
    userId: v.id('users'),
    locale: v.string(),
  },
  handler: async (ctx, args) => {
    const baseData: ContextData = {
      user: 'No connected user',
      assistantPrompt: MANAGER_PROMPT,
      knowledgeBase: getKnowledgeBaseContext(),
      language: args.locale,
    };

    try {
      const user = await ctx.db.get(args.userId);

      if (!user) {
        return baseData;
      }

      baseData.user = JSON.stringify({
        id: user._id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        name: user.firstName + ' ' + user.lastName,
        roles: user.roles,
        countryCode: user.countryCode,
      });

      return baseData;
    } catch (error) {
      console.error('Error fetching Agent context data:', error);
      return baseData;
    }
  },
});

export const getUserContextDataAdmin = internalQuery({
  args: {
    userId: v.id('users'),
    locale: v.string(),
  },
  handler: async (ctx, args) => {
    const baseData: ContextData = {
      user: 'No connected user',
      assistantPrompt: ADMIN_CONSULAIRE_PROMPT,
      knowledgeBase: getKnowledgeBaseContext(),
      language: args.locale,
    };

    try {
      const user = await ctx.db.get(args.userId);

      if (!user) {
        return baseData;
      }

      baseData.user = JSON.stringify({
        id: user._id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        name: user.firstName + ' ' + user.lastName,
        roles: user.roles,
        countryCode: user.countryCode,
      });

      return baseData;
    } catch (error) {
      console.error('Error fetching Admin context data:', error);
      return baseData;
    }
  },
});

export const getUserContextDataManager = internalQuery({
  args: {
    userId: v.id('users'),
    locale: v.string(),
  },
  handler: async (ctx, args) => {
    const baseData: ContextData = {
      user: 'No connected user',
      assistantPrompt: MANAGER_PROMPT,
      knowledgeBase: getKnowledgeBaseContext(),
      language: args.locale,
    };

    try {
      const user = await ctx.db.get(args.userId);

      if (!user) {
        return baseData;
      }

      baseData.user = JSON.stringify({
        id: user._id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        name: user.firstName + ' ' + user.lastName,
        roles: user.roles,
        countryCode: user.countryCode,
      });

      return baseData;
    } catch (error) {
      console.error('Error fetching Manager context data:', error);
      return baseData;
    }
  },
});

export const analyzeDocumentWithVision = action({
  args: {
    fileBuffer: v.bytes(),
    mimeType: v.string(),
    prompt: v.string(),
    schema: v.any(),
    geminiApiKey: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const analyzer = new GeminiVisionAnalyzer(args.geminiApiKey);

      const buffer = Buffer.from(args.fileBuffer);

      const result = await analyzer.analyzeFile(
        buffer,
        args.mimeType,
        args.prompt,
        args.schema,
      );

      return result;
    } catch (error) {
      console.error('Error analyzing document with vision:', error);
      throw error;
    }
  },
});

export const analyzeMultipleDocuments = action({
  args: {
    documents: v.array(
      v.object({
        storageId: v.id('_storage'),
        documentType: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    try {
      if (!API_KEY) {
        throw new Error('GEMINI_API_KEY is not set');
      }

      const analyzer = new GeminiVisionAnalyzer(API_KEY);
      const results: Record<string, StructuredOutput | { error: string }> = {};

      const documentPrompts: Record<string, { prompt: string; schema: object }> = {
        passport: {
          prompt: `Analysez ce passeport et extrayez les informations suivantes en JSON.
Pour les dates, utilisez le format ISO 8601 (YYYY-MM-DD) qui sera converti en timestamp.
Pour le genre, utilisez uniquement: "male" ou "female".
Pour les codes pays, utilisez le code ISO à 2 lettres (ex: FR, GA, US).`,
          schema: {
            data: {
              personal: {
                type: 'object',
                properties: {
                  firstName: { type: 'string', description: 'Prénom' },
                  lastName: { type: 'string', description: 'Nom de famille' },
                  birthDate: {
                    type: 'string',
                    description: 'Date de naissance (YYYY-MM-DD)',
                  },
                  birthPlace: { type: 'string', description: 'Lieu de naissance' },
                  birthCountry: {
                    type: 'string',
                    description: 'Code pays de naissance (ISO 2)',
                  },
                  gender: { type: 'string', enum: ['male', 'female'] },
                  nationality: {
                    type: 'string',
                    description: 'Code pays nationalité (ISO 2)',
                  },
                  passportInfos: {
                    type: 'object',
                    properties: {
                      number: { type: 'string' },
                      issueDate: {
                        type: 'string',
                        description: 'Date émission (YYYY-MM-DD)',
                      },
                      expiryDate: {
                        type: 'string',
                        description: "Date d'expiration (YYYY-MM-DD)",
                      },
                      issueAuthority: {
                        type: 'string',
                        description: 'Autorité de délivrance',
                      },
                    },
                  },
                },
              },
            },
            explanation: { type: 'string' },
            documentConfidence: { type: 'number', description: 'Confiance 0-100' },
          },
        },
        birth_certificate: {
          prompt: `Analysez cet acte de naissance et extrayez les informations suivantes en JSON.
Pour les dates, utilisez le format ISO 8601 (YYYY-MM-DD).
Pour le genre, utilisez: "male" ou "female".
Pour les codes pays, utilisez le code ISO à 2 lettres.`,
          schema: {
            data: {
              personal: {
                type: 'object',
                properties: {
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  birthDate: {
                    type: 'string',
                    description: 'Date de naissance (YYYY-MM-DD)',
                  },
                  birthPlace: { type: 'string' },
                  birthCountry: { type: 'string', description: 'Code pays (ISO 2)' },
                  gender: { type: 'string', enum: ['male', 'female'] },
                },
              },
              family: {
                type: 'object',
                properties: {
                  father: {
                    type: 'object',
                    properties: {
                      firstName: { type: 'string' },
                      lastName: { type: 'string' },
                    },
                  },
                  mother: {
                    type: 'object',
                    properties: {
                      firstName: {
                        type: 'string',
                        description: 'Prénom (nom de jeune fille)',
                      },
                      lastName: { type: 'string', description: 'Nom de jeune fille' },
                    },
                  },
                },
              },
            },
            explanation: { type: 'string' },
            documentConfidence: { type: 'number' },
          },
        },
        residence_permit: {
          prompt: `Analysez ce titre de séjour et extrayez les informations suivantes en JSON.
Pour les dates, utilisez le format ISO 8601 (YYYY-MM-DD).
Pour l'adresse, séparez bien street, city, postalCode, country.`,
          schema: {
            data: {
              personal: {
                type: 'object',
                properties: {
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  birthDate: {
                    type: 'string',
                    description: 'Date de naissance (YYYY-MM-DD)',
                  },
                },
              },
              contacts: {
                type: 'object',
                properties: {
                  address: {
                    type: 'object',
                    properties: {
                      street: { type: 'string', description: 'Rue et numéro' },
                      city: { type: 'string' },
                      postalCode: { type: 'string' },
                      country: { type: 'string', description: 'Code pays (ISO 2)' },
                      state: { type: 'string', description: 'État/Région (optionnel)' },
                      complement: {
                        type: 'string',
                        description: 'Complément (optionnel)',
                      },
                    },
                  },
                },
              },
            },
            explanation: { type: 'string' },
            documentConfidence: { type: 'number' },
          },
        },
        proof_of_address: {
          prompt: `Analysez ce justificatif de domicile et extrayez l'adresse complète en JSON.
Séparez bien street (rue + numéro), city, postalCode, country (code ISO 2).`,
          schema: {
            data: {
              contacts: {
                type: 'object',
                properties: {
                  address: {
                    type: 'object',
                    properties: {
                      street: { type: 'string' },
                      city: { type: 'string' },
                      postalCode: { type: 'string' },
                      country: { type: 'string', description: 'Code pays (ISO 2)' },
                      state: { type: 'string' },
                      complement: { type: 'string' },
                    },
                  },
                },
              },
            },
            explanation: { type: 'string' },
            documentConfidence: { type: 'number' },
          },
        },
      };

      for (const doc of args.documents) {
        try {
          const blob = await ctx.storage.get(doc.storageId);

          if (!blob) {
            console.error(`File not found for storageId: ${doc.storageId}`);
            continue;
          }

          const buffer = Buffer.from(await blob.arrayBuffer());

          const promptConfig = documentPrompts[doc.documentType] || {
            prompt: 'Extract all information from this document',
            schema: {
              data: {},
              explanation: { type: 'string' },
            },
          };

          const result = await analyzer.analyzeFile(
            buffer,
            blob.type,
            promptConfig.prompt,
            promptConfig.schema,
          );

          results[doc.documentType] = result;
        } catch (error) {
          console.error(`Error analyzing document ${doc.documentType}:`, error);
          results[doc.documentType] = {
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      }

      const mergedData: Record<string, Record<string, unknown>> = {
        personal: {},
        contacts: {},
        family: {},
        professionSituation: {},
      };

      Object.values(results).forEach((result) => {
        if ('data' in result && result.data) {
          Object.entries(result.data).forEach(([key, value]) => {
            if (value && typeof value === 'object') {
              mergedData[key] = {
                ...mergedData[key],
                ...(value as Record<string, unknown>),
              };
            }
          });
        }
      });

      const convertDateToTimestamp = (dateStr: unknown): number | undefined => {
        if (!dateStr || typeof dateStr !== 'string') return undefined;
        try {
          const date = new Date(dateStr);
          return isNaN(date.getTime()) ? undefined : date.getTime();
        } catch {
          return undefined;
        }
      };

      const transformedData: Record<string, Record<string, unknown>> = {
        personal: {},
        contacts: {},
        family: {},
        professionSituation: {},
      };

      if (mergedData.personal && typeof mergedData.personal === 'object') {
        const personal = mergedData.personal as Record<string, unknown>;
        transformedData.personal = {
          ...personal,
          birthDate: convertDateToTimestamp(personal.birthDate),
        };

        if (personal.passportInfos && typeof personal.passportInfos === 'object') {
          const passportInfos = personal.passportInfos as Record<string, unknown>;
          transformedData.personal.passportInfos = {
            number: passportInfos.number,
            issueDate: convertDateToTimestamp(passportInfos.issueDate),
            expiryDate: convertDateToTimestamp(passportInfos.expiryDate),
            issueAuthority: passportInfos.issueAuthority,
          };
        }
      }

      if (mergedData.contacts) {
        transformedData.contacts = mergedData.contacts;
      }

      if (mergedData.family) {
        transformedData.family = mergedData.family;
      }

      if (mergedData.professionSituation) {
        transformedData.professionSituation = mergedData.professionSituation;
      }

      return {
        success: true,
        results,
        mergedData: transformedData,
      };
    } catch (error) {
      console.error('Error analyzing multiple documents:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        results: {},
        mergedData: {},
      };
    }
  },
});

export const analyzeProfileForSuggestions = action({
  args: {
    userId: v.id('users'),
    locale: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const contextData = await ctx.runQuery(internal.functions.ai.getUserContextData, {
        userId: args.userId,
        locale: args.locale,
      });

      const model = getGeminiModel();

      const context = ContextBuilder.buildContext(contextData);
      const prompt = `${PROFILE_ANALYSIS_PROMPT}\n\nContext:\n${context}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const cleanedText = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      try {
        return JSON.parse(cleanedText);
      } catch (parseError) {
        console.error('Error parsing profile analysis response:', parseError);
        return {
          suggestions: [],
          error: 'Failed to parse suggestions',
        };
      }
    } catch (error) {
      console.error('Error analyzing profile:', error);
      throw error;
    }
  },
});
