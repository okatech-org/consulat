# Complete Gemini Chatbot Implementation Plan

## Overview

This plan replaces the current OpenAI chatbot with a comprehensive Gemini-powered assistant that has full knowledge of the platform, user data, and dynamically loaded services based on the user's country.

## 1. Install Gemini Dependencies - skip

## 2. Update Environment Variables - skip

## 3. Create Gemini Chat Service

### New File: `src/lib/ai/gemini-chat.ts`

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class GeminiChatService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
    // Use gemini-1.5-pro for best performance with large context
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 4096,
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
      ],
    });
  }

  async getChatCompletion(
    userMessage: string,
    context: string,
    history: ChatMessage[],
  ): Promise<string | null> {
    try {
      // Build the conversation history for Gemini
      const formattedHistory = history.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

      // Start with system context
      const chat = this.model.startChat({
        history: [
          {
            role: 'user',
            parts: [{ text: context }],
          },
          {
            role: 'model',
            parts: [
              {
                text: 'Je comprends. Je suis Ray, votre assistant consulaire. Je vais utiliser toutes ces informations pour vous aider au mieux.',
              },
            ],
          },
          ...formattedHistory,
        ],
      });

      // Send the new message
      const result = await chat.sendMessage(userMessage);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating Gemini chat completion:', error);
      return null;
    }
  }
}
```

## 4. Update AI Actions with Dynamic Service Fetching

### File: `src/lib/ai/actions.ts`

```typescript
'use server';

// Remove OpenAI import
// import OpenAI from 'openai';
import { GeminiChatService, ChatMessage } from '@/lib/ai/gemini-chat';
import { ContextData } from '@/lib/ai/types';
import { db } from '@/lib/prisma';
import { UserRole, ServiceCategory } from '@prisma/client';
import { getKnowledgeBaseContext } from '@/lib/ai/knowledge-base';
// ... rest of imports ...

// Initialize Gemini service
const geminiChat = new GeminiChatService();

/**
 * Server Action to generate chat completion with context and chat history.
 */
export async function getChatCompletion(
  userMessage: string,
  context: string,
  history: ChatMessage[],
): Promise<string | null> {
  return await geminiChat.getChatCompletion(userMessage, context, history);
}

// Update getUserContextDataReg to include available services
async function getUserContextDataReg(
  userId: string | undefined,
  locale: string,
): Promise<ContextData> {
  const baseData: ContextData = {
    user: 'No connected user',
    assistantPrompt: RAY_AGENT_PROMPT,
    knowledgeBase: getKnowledgeBaseContext(),
    language: locale,
  };

  if (!userId) {
    return baseData;
  }

  try {
    const [user, profile, appointments, notifications, country, serviceRequests] =
      await Promise.all([
        db.user.findUnique({
          where: { id: userId },
          ...FullUserInclude,
        }),
        db.profile.findUnique({
          where: { userId },
          ...FullProfileInclude,
        }),
        db.appointment.findMany({
          where: {
            attendees: {
              some: { id: userId },
            },
            status: 'CONFIRMED',
            dateTime: {
              gte: new Date(),
            },
          },
          orderBy: {
            dateTime: 'asc',
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
          where: { code: authResult.user.countryCode },
        }),
        db.serviceRequest.findMany({
          where: { submittedById: userId },
          ...FullServiceRequestInclude,
        }),
      ]);

    // Fetch available services for the user's country
    const availableServices = await db.consularService.findMany({
      where: {
        isActive: true,
        countryCode: user?.countryCode || undefined,
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
    });

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
    if (user) {
      baseData.user = JSON.stringify({
        id: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        name: user.name,
        role: user.roles,
        countryCode: user.countryCode,
      });
    }

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

// Update other role functions similarly
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
    // ... existing agent data fetching ...

    // Also fetch available services for agents to know what services they manage
    const managedServices = await db.consularService.findMany({
      where: {
        isActive: true,
        assignedTo: {
          some: { id: userId },
        },
      },
      include: {
        organization: true,
        _count: {
          select: { requests: true },
        },
      },
    });

    baseData.availableServicesData = JSON.stringify({
      managedServices,
      totalManagedServices: managedServices.length,
    });

    return baseData;
  } catch (error) {
    console.error('Error fetching Agent context data:', error);
    return baseData;
  }
}

// Similar updates for Admin and SuperAdmin functions to include service data...
```

## 5. Update Knowledge Base with Dynamic Services

### File: `src/lib/ai/knowledge-base.ts`

```typescript
// Add explanation about service availability
const serviceAvailabilityExplanation = {
  generalInfo: `
Les services consulaires disponibles varient selon votre pays de résidence. 
Chaque pays dispose d'une liste spécifique de services adaptés aux besoins locaux.

IMPORTANT: L'inscription consulaire est un service spécial qui est toujours disponible 
et obligatoire pour tous les ressortissants gabonais à l'étranger, quel que soit leur pays de résidence.
`,

  howToAccess: `
Pour accéder aux services:
1. L'inscription consulaire doit être complétée en premier
2. Une fois inscrit, vous aurez accès aux autres services disponibles dans votre pays
3. Les services varient selon les accords consulaires de votre pays de résidence
4. Consultez [Services disponibles](/my-space/services/available) pour voir la liste complète
`,

  commonServices: `
Services généralement disponibles (selon le pays):
- Renouvellement de passeport
- Demande d'actes d'état civil
- Légalisation de documents
- Certificats divers
- Services notariaux
- Assistance d'urgence
`,
};

// Update the enhanced knowledge base
export const enhancedKnowledgeBase = {
  ...knowledgeBase,
  appFeatures,
  serviceDocumentation,
  serviceAvailability: serviceAvailabilityExplanation,
  platformInfo: {
    name: 'Consulat.ga',
    purpose: 'Plateforme numérique du Consulat du Gabon en France',
    mainFeatures: [
      'Gestion du profil consulaire',
      'Demandes de services en ligne',
      'Prise de rendez-vous',
      'Suivi des démarches',
      'Documents numériques',
      'Notifications en temps réel',
    ],
    importantNotes: [
      "L'inscription consulaire est obligatoire avant toute autre démarche",
      'Les services disponibles dépendent de votre pays de résidence',
      'Tous les services nécessitent un profil consulaire validé',
    ],
    support: {
      email: 'support@consulatdugabon.fr',
      phone: '+33189719298',
      hours: 'Lundi-Jeudi: 9h-16h30, Vendredi: 9h-16h',
    },
  },
};

// Enhanced knowledge base context builder
export function getKnowledgeBaseContext(): string {
  const baseContext = `
Base de connaissances consulaire :

${knowledgeBase.categories
  .map(
    (category) => `
# ${category.name}

${category.instructions
  .map(
    (instruction) => `
Q: ${instruction.question}
R: ${instruction.response}
${instruction.documentsJoints ? `Documents requis: ${instruction.documentsJoints.join(', ')}` : ''}
`,
  )
  .join('\n')}
`,
  )
  .join('\n')}

# Ressources officielles
${knowledgeBase.ressources_officielles
  .map(
    (resource) => `
- ${resource.name}
  URL: ${resource.url}
  ${resource.phone ? `Téléphone: ${resource.phone}` : ''}
  ${resource.email ? `Email: ${resource.email}` : ''}
  ${resource.address ? `Adresse: ${resource.address}` : ''}
  ${resource.schedule ? `Horaires: ${resource.schedule}` : ''}
`,
  )
  .join('\n')}

# Disponibilité des Services Consulaires
${serviceAvailabilityExplanation.generalInfo}

Comment accéder aux services:
${serviceAvailabilityExplanation.howToAccess}

Services courants:
${serviceAvailabilityExplanation.commonServices}

# Fonctionnalités de l'application

${appFeatures
  .map(
    (feature) => `
## ${feature.feature}
Description: ${feature.description}

Comment faire:
${feature.howTo.map((step, index) => `${index + 1}. ${step}`).join('\n')}

${
  feature.commonIssues
    ? `
Problèmes courants:
${feature.commonIssues.map((issue) => `- ${issue}`).join('\n')}
`
    : ''
}
`,
  )
  .join('\n')}

# Documentation des services

NOTE IMPORTANTE: Les services ci-dessous sont des exemples. Les services réellement disponibles 
pour un utilisateur sont déterminés par son pays de résidence et sont fournis dynamiquement 
dans le contexte de la conversation.

${Object.entries(serviceDocumentation)
  .map(
    ([key, service]) => `
## ${service.description}

Pièces requises:
${service.requirements.map((req) => `- ${req}`).join('\n')}

Processus:
${service.process.map((step, index) => `${index + 1}. ${step}`).join('\n')}

Frais: ${service.fees}
`,
  )
  .join('\n')}

# Informations sur la plateforme
- Nom: ${enhancedKnowledgeBase.platformInfo.name}
- Objectif: ${enhancedKnowledgeBase.platformInfo.purpose}
- Support: ${enhancedKnowledgeBase.platformInfo.support.email} | ${enhancedKnowledgeBase.platformInfo.support.phone}
- Horaires support: ${enhancedKnowledgeBase.platformInfo.support.hours}

Notes importantes:
${enhancedKnowledgeBase.platformInfo.importantNotes.map((note) => `- ${note}`).join('\n')}
`;

  return baseContext;
}
```

## 6. Update Chat Component for Gemini

### File: `src/components/chat/chat-toggle.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAnimation } from 'framer-motion';
import IAstedButton from '../ui/mr-ray-button-fixed';
import { useChat } from '@/contexts/chat-context';
import { ModernChatWindow } from './modern-chat-window';
import { getChatCompletion, getUserContextData } from '@/lib/ai/actions';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useLocale } from 'next-intl';
import { ContextBuilder } from '@/lib/ai/context-builder';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { ChatMessage } from '@/lib/ai/gemini-chat';

export function ChatToggle() {
  const isMobile = useIsMobile();
  const { isOpen, toggleChat } = useChat();
  const controls = useAnimation();
  const currentUser = useCurrentUser();
  const locale = useLocale();
  const [userContext, setUserContext] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  // Reset context and history when chat is closed
  useEffect(() => {
    if (!isOpen) {
      setUserContext(null);
      setChatHistory([]);
    }
  }, [isOpen]);

  // Animation de pulsation
  useEffect(() => {
    if (!isOpen) {
      controls.start({
        scale: 1,
        transition: { duration: 0.3 },
      });
    }
  }, [controls, isOpen]);

  // Cette fonction gère l'envoi de messages au chatbot
  const handleSendMessage = async (message: string): Promise<string> => {
    try {
      // Get or initialize context
      if (!userContext) {
        // Only fetch context data the first time
        const contextData = await getUserContextData(
          locale,
          currentUser?.id,
          currentUser?.roles ? currentUser.roles[0] : undefined,
        );
        const context = ContextBuilder.buildContext(contextData);
        setUserContext(context);

        // First message with fresh context
        const aiResponse = await getChatCompletion(message, context, []);

        // Update history
        setChatHistory([
          { role: 'user', content: message },
          {
            role: 'assistant',
            content: aiResponse || 'Désolé, une erreur est survenue.',
          },
        ]);

        return aiResponse || 'Désolé, une erreur est survenue. Veuillez réessayer.';
      } else {
        // Add user message to history
        const newHistory = [...chatHistory, { role: 'user', content: message }];

        // Get AI response with full history
        const aiResponse = await getChatCompletion(message, userContext, chatHistory);

        // Update history with AI response
        setChatHistory([
          ...newHistory,
          {
            role: 'assistant',
            content: aiResponse || 'Désolé, une erreur est survenue.',
          },
        ]);

        return aiResponse || 'Désolé, une erreur est survenue. Veuillez réessayer.';
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      return 'Désolé, une erreur est survenue. Veuillez réessayer.';
    }
  };

  // ... rest of the component remains the same ...
}
```

## 7. Add Comprehensive App Documentation

### New File: `src/lib/ai/app-documentation.ts`

```typescript
// Comprehensive documentation about the entire application

export const APP_DOCUMENTATION = {
  userJourney: {
    registration: {
      steps: [
        'Créer un compte avec email/téléphone',
        'Vérifier le compte via OTP',
        'Compléter le profil consulaire',
        'Télécharger les documents requis',
        'Attendre la validation par un agent',
      ],
      tips: [
        'Utilisez une photo récente sur fond blanc',
        'Scannez les documents en haute qualité',
        'Vérifiez que toutes les informations correspondent à vos documents officiels',
      ],
    },
    serviceRequest: {
      steps: [
        'Choisir un service dans la liste',
        'Vérifier les prérequis',
        'Remplir le formulaire de demande',
        'Joindre les documents',
        'Payer les frais (si applicable)',
        'Soumettre la demande',
        "Suivre l'avancement",
      ],
      statuses: {
        DRAFT: 'Brouillon - demande non soumise',
        SUBMITTED: 'Soumise - en attente de traitement',
        IN_REVIEW: "En cours d'examen par un agent",
        PENDING_DOCUMENTS: 'Documents manquants - action requise',
        PROCESSING: 'En traitement au consulat',
        COMPLETED: 'Terminée - documents prêts',
        REJECTED: 'Rejetée - voir les commentaires',
      },
    },
    appointments: {
      types: {
        DOCUMENT_SUBMISSION: 'Dépôt de documents',
        DOCUMENT_COLLECTION: 'Retrait de documents',
        BIOMETRIC_CAPTURE: "Prise d'empreintes",
        INTERVIEW: 'Entretien consulaire',
        GENERAL_CONSULTATION: 'Consultation générale',
      },
      rules: [
        "Arrivez 15 minutes avant l'heure",
        'Apportez tous les documents originaux',
        'Un seul accompagnateur autorisé',
        "Annulation possible jusqu'à 24h avant",
      ],
    },
  },

  troubleshooting: {
    commonIssues: [
      {
        issue: 'Je ne peux pas me connecter',
        solutions: [
          'Vérifiez votre email/téléphone',
          'Utilisez "Mot de passe oublié"',
          'Vérifiez que votre compte est activé',
          'Contactez le support si le problème persiste',
        ],
      },
      {
        issue: 'Ma demande est bloquée',
        solutions: [
          "Vérifiez les commentaires de l'agent",
          'Complétez les documents manquants',
          "Répondez aux demandes d'information",
          'Prenez rendez-vous si nécessaire',
        ],
      },
      {
        issue: 'Je ne trouve pas un service',
        solutions: [
          'Utilisez la barre de recherche',
          'Filtrez par catégorie',
          'Vérifiez votre éligibilité',
          'Le service peut ne pas être disponible dans votre pays',
        ],
      },
    ],
  },

  adminFeatures: {
    dashboard: {
      widgets: [
        'Statistiques en temps réel',
        'Demandes en attente',
        'Rendez-vous du jour',
        'Alertes et notifications',
        'Performance des agents',
      ],
      actions: [
        'Traiter les demandes',
        'Gérer les rendez-vous',
        'Valider les profils',
        'Générer des rapports',
      ],
    },
    requestManagement: {
      features: [
        'Filtrage avancé',
        'Attribution automatique',
        'Commentaires internes',
        'Historique des actions',
        'Export des données',
      ],
      workflow: [
        'Recevoir la demande',
        'Vérifier les documents',
        'Demander des compléments si nécessaire',
        'Valider ou rejeter',
        "Notifier l'utilisateur",
      ],
    },
  },

  integrations: {
    email: {
      provider: 'Resend',
      features: ['Notifications', 'Confirmations', 'Rappels'],
    },
    sms: {
      providers: ['Twilio', 'Vonage'],
      features: ['OTP', 'Alertes urgentes', 'Rappels de RDV'],
    },
    storage: {
      provider: 'UploadThing',
      limits: ['10MB par fichier', 'Formats: PDF, JPG, PNG'],
    },
    payment: {
      status: 'À venir',
      planned: ['Stripe', 'PayPal', 'Virements'],
    },
  },
};
```

## 8. Update Context Types and Builder

### File: `src/lib/ai/types.ts`

```typescript
export interface ContextData {
  user: string;
  assistantPrompt: string;
  knowledgeBase: string;
  language: string;
  countryData?: string;
  profileData?: string;
  serviceRequestsData?: string;
  appointmentData?: string;
  notificationsData?: string;
  agentData?: string;
  adminManagerData?: string;
  superAdminData?: string;
  availableServicesData?: string; // Add this new field
}
```

### File: `src/lib/ai/context-builder.ts`

```typescript
import { ContextData } from '@/lib/ai/types';
import { APP_DOCUMENTATION } from '@/lib/ai/app-documentation';

export class ContextBuilder {
  static buildContext(contextData: ContextData): string {
    let context = '';

    // Add assistant prompt
    context += `Role setting: ${contextData.assistantPrompt}\n`;

    // Add language
    context += `Respond to the user in the following language by default unless he talk in another one : ${contextData.language}\n`;

    // CRITICAL: Instruction to only use provided data
    context += `\nCRITICAL INSTRUCTION: You MUST only provide information that is explicitly present in this context. If information is not available in the context, politely inform the user that you don't have that specific information. Never make up or assume information.\n`;

    context += `Current user datas: ${contextData.user}\n`;

    // Parse country data if available
    if (contextData.countryData) {
      context += `---\nUser related country datas: ${contextData.countryData}\n`;
    }

    // Parse profile data if available
    if (contextData.profileData) {
      context += `---\nUser consular profile datas: ${contextData.profileData}\n`;
    }

    // Parse available services data if available
    if (contextData.availableServicesData) {
      context += `---\nAvailable Consular Services for User:\n${contextData.availableServicesData}\n`;
    }

    // Parse service requests data if available
    if (contextData.serviceRequestsData) {
      context += `---\nUser request service requests: ${contextData.serviceRequestsData}\n`;
    }

    // Parse appointment data if available
    if (contextData.appointmentData) {
      context += `---\nUser appointments: ${contextData.appointmentData}\n`;
    }

    // Parse notifications data if available
    if (contextData.notificationsData) {
      context += `---\nUser Notifications: ${contextData.notificationsData}\n`;
    }

    // Parse agent data if available
    if (contextData.agentData) {
      context += `---\nAgent Data: ${contextData.agentData}\n`;
    }

    // Parse admin manager data if available
    if (contextData.adminManagerData) {
      context += `---\nAdmin Manager Data: ${contextData.adminManagerData}\n`;
    }

    // Parse super admin data if available
    if (contextData.superAdminData) {
      context += `---\nSuper Admin Data: ${contextData.superAdminData}\n`;
    }

    // Add comprehensive app documentation
    context += `---\nApplication Documentation:\n${JSON.stringify(APP_DOCUMENTATION, null, 2)}\n`;

    // Add knowledge base context
    context += `---\nKnowledge Base:\n${contextData.knowledgeBase}`;

    return context;
  }
}
```

## 9. Update AI Prompts for Dynamic Services

### File: `src/lib/ai/prompts.ts`

Add to the existing prompts:

```typescript
// Update RAY_AGENT_PROMPT to include dynamic services awareness
export const RAY_AGENT_PROMPT = `You are Ray, a consulate agent for the Consulat.ga platform. Your role is to help users navigate consular procedures with empathy and precision. Follow these essential guidelines:

1. **Personalization**: Use the provided contextData to personalize every interaction when relevant. Reference specific details from:
   - profileData (profile information, documents, status)
   - countryData (user's residence country, available services)
   - availableServicesData (CRITICAL: services available in user's country)
   - serviceRequestsData (pending/completed requests, deadlines)
   - appointmentData (upcoming appointments, locations, times)
   - notificationsData (pending notifications, important alerts)

2. **Service Awareness - CRITICAL**:
   - The available services are DYNAMICALLY loaded based on the user's country
   - Always check availableServicesData for the actual list of services
   - Consular Registration (Inscription Consulaire) is ALWAYS available and MANDATORY
   - Other services vary by country - NEVER assume a service is available without checking
   - If user asks about a service not in availableServicesData, inform them it's not available in their country
   - Always guide users to complete Consular Registration first if not done

3. **User-Centric Approach**:
   - Address the user formally by their lastName with appropriate title (M./Mme./Dr.)
   - Adapt your responses to their specific situation (services available in their country of residence)
   - Reference their profile status, pending requests, and appointment schedule when relevant
   - Don't share too much things at once, be concise and to the point

4. **Clear Process Guidance**:
   - For Consular Registration: Emphasize it's mandatory and free
   - For other services: Check availableServicesData for requirements and details
   - Provide step-by-step instructions with precise requirements
   - Reference deadlines and processing times based on their residence country

5. **Multi-lingual Support**:
   - Always respond in the user's preferred language (provided in language field)
   - Format dates and numbers according to local conventions

6. **Professional Format**:
   - Use Markdown for structured responses (headlines, lists, bold for important points)
   - Organize complex procedures in numbered steps
   - Use tables for comparing options or requirements

7. **Security & Compliance**:
   - SHARE information only when requested or required
   - Never share information not present in the provided context
   - Follow GDPR compliant protocols for personal data

8. **Navigation & App Links**:
   - Provide clickable links to relevant application pages using Markdown syntax
   - Guide users to the appropriate sections of the platform for each action
   - Reference the following site map when guiding the user:
     ${USER_SITEMAP_GUIDE}
   - You can share external links when relevant to the user's question

For example, use links like "[consulter vos rendez-vous](/my-space/appointments)" or "[voir les services disponibles](/my-space/services/available)" when suggesting actions.

Base all your responses on accurate data from the provided context fields, especially availableServicesData for services, profileData, countryData, serviceRequestsData, and appointmentData. DO NOT, under any circumstances, share information that is not present in the provided context.

When discussing services:
- ALWAYS check availableServicesData first
- Explain that Consular Registration is mandatory for all Gabonese abroad
- Only mention services that appear in the user's availableServicesData
- If a requested service isn't available, politely explain it's not offered in their country`;

// Similar updates for other role prompts...
```

## 10. Testing and Migration

### Create Test File: `src/lib/ai/__tests__/gemini-chat.test.ts`

```typescript
import { GeminiChatService } from '../gemini-chat';
import { getUserContextData } from '../actions';

describe('GeminiChatService', () => {
  let chatService: GeminiChatService;

  beforeAll(() => {
    chatService = new GeminiChatService();
  });

  test('responds to user queries with context', async () => {
    const context = 'You are Ray, a helpful consular assistant.';
    const message = 'Comment puis-je renouveler mon passeport?';

    const response = await chatService.getChatCompletion(message, context, []);

    expect(response).toBeDefined();
    expect(response).toContain('passeport');
  });

  test('includes dynamic services in context', async () => {
    // Mock user with specific country
    const mockUserId = 'test-user-id';
    const locale = 'fr';

    const contextData = await getUserContextData(locale, mockUserId, 'USER');

    expect(contextData.availableServicesData).toBeDefined();
    const servicesData = JSON.parse(contextData.availableServicesData!);

    // Should always include consular registration
    expect(servicesData.consularRegistration).toBeDefined();
    expect(servicesData.consularRegistration.name).toBe('Inscription Consulaire');

    // Should include country-specific services
    expect(servicesData.availableServices).toBeDefined();
    expect(Array.isArray(servicesData.availableServices)).toBe(true);
  });

  test('maintains conversation history', async () => {
    const context = 'You are Ray, a helpful consular assistant.';
    const history = [
      { role: 'user' as const, content: 'Bonjour' },
      { role: 'assistant' as const, content: 'Bonjour! Comment puis-je vous aider?' },
    ];

    const response = await chatService.getChatCompletion(
      'Quels services sont disponibles dans mon pays?',
      context,
      history,
    );

    expect(response).toBeDefined();
    expect(response).toContain('services');
  });
});
```

## 11. Migration Checklist

- [ ] **Get Gemini API Key**

  - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
  - Generate an API key
  - Add to `.env.local`: `GOOGLE_GEMINI_API_KEY=your_key_here`

- [ ] **Install Dependencies**

  ```bash
  npm install @google/generative-ai
  ```

- [ ] **Update Environment Configuration**

  - Update `src/lib/env/index.ts` to use Gemini instead of OpenAI
  - Remove OpenAI API key references

- [ ] **Deploy Code Changes**

  - Create `src/lib/ai/gemini-chat.ts`
  - Update `src/lib/ai/actions.ts` with service fetching
  - Update `src/lib/ai/types.ts` with new field
  - Update `src/lib/ai/context-builder.ts`
  - Update `src/lib/ai/knowledge-base.ts`
  - Update `src/components/chat/chat-toggle.tsx`
  - Update prompts in `src/lib/ai/prompts.ts`

- [ ] **Test Implementation**

  - Test with users from different countries
  - Verify services are correctly filtered by country
  - Confirm consular registration is always available
  - Test conversation memory
  - Verify responses are based only on provided data

- [ ] **Monitor Performance**
  - Check response times
  - Monitor token usage
  - Review conversation quality
  - Gather user feedback

## Key Improvements with Dynamic Services

### 1. **Country-Specific Service Loading**

- Services are fetched from the database based on user's country
- No hardcoded service lists
- Automatic adaptation to service availability changes

### 2. **Consular Registration Handling**

- Always available regardless of country
- Marked as mandatory and free
- Special handling in the context

### 3. **Real-Time Service Information**

- Service details include:
  - Organization offering the service
  - Required and optional documents
  - Processing modes and delivery options
  - Pricing information
  - Appointment requirements

### 4. **Smart Service Recommendations**

- AI only suggests services actually available in user's country
- Explains when services aren't available
- Guides users through the correct service flow

### 5. **Enhanced Context Awareness**

- Full service details in context
- Organization information
- Processing requirements
- Dynamic updates as services change

## Example Conversations

### User: "Quels services sont disponibles pour moi?"

**AI Response**: Based on the available services data, will list only services available in the user's country, always starting with consular registration if not completed.

### User: "Je veux faire une demande de visa"

**AI Response**: Will check if visa service exists in availableServicesData. If not, will explain it's not available in their country and suggest alternative services.

### User: "Comment faire l'inscription consulaire?"

**AI Response**: Will provide detailed steps for consular registration, emphasizing it's mandatory and free, with links to start the process.

## Benefits of This Approach

1. **Accuracy**: Services are always current from the database
2. **Flexibility**: Easy to add/remove services per country
3. **Compliance**: Respects country-specific regulations
4. **User Experience**: Clear guidance on what's actually available
5. **Maintenance**: No code changes needed when services change

This completes the implementation of dynamic service loading in the AI context.
