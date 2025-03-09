import { z } from 'zod';
import { NotificationType as PrismaNotificationType } from '@prisma/client';

// Réutilisation de l'enum NotificationType de Prisma
export { NotificationType } from '@prisma/client';

// Enum pour les canaux de notification
export enum NotificationChannel {
  APP = 'app',
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  WEBHOOK = 'webhook',
}

// Interface pour les actions associées aux notifications
export interface NotificationAction {
  label: string;
  url: string;
  primary?: boolean;
}

// Interface pour le destinataire
export interface NotificationRecipient {
  userId: string;
  email?: string;
  phoneNumber?: string;
  deviceTokens?: string[];
  webhookUrl?: string;
}

// Schéma Zod pour la validation des notifications
export const notificationSchema = z.object({
  type: z.nativeEnum(PrismaNotificationType),
  title: z.string().min(1).max(100),
  message: z.string().min(1).max(1000),
  channels: z.array(z.nativeEnum(NotificationChannel)).min(1),
  recipient: z.object({
    userId: z.string(),
    email: z.string().email().optional(),
    phoneNumber: z.string().optional(),
    deviceTokens: z.array(z.string()).optional(),
    webhookUrl: z.string().url().optional(),
  }),
  actions: z
    .array(
      z.object({
        label: z.string().min(1).max(50),
        url: z.string().url(),
        primary: z.boolean().optional(),
      }),
    )
    .optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  expiresAt: z.date().optional(),
  scheduledFor: z.date().optional(),
});

// Type inféré à partir du schéma Zod
export type NotificationRequest = z.infer<typeof notificationSchema>;

// Interface pour les résultats de notification
export interface NotificationResult {
  id: string;
  success: boolean;
  channel: NotificationChannel;
  timestamp: Date;
  error?: string;
}

// Interface pour le résultat global
export interface NotificationResponse {
  requestId: string;
  results: NotificationResult[];
  successful: boolean;
  timestamp: Date;
}
