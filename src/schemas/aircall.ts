import { z } from 'zod';

// Configuration Aircall pour une organisation
export const AircallConfigSchema = z.object({
  enabled: z.boolean().default(false),
  apiKey: z.string().optional(),
  apiId: z.string().optional(),
  integrationName: z.string().optional(),
  workspaceSize: z.enum(['small', 'medium', 'big']).default('medium'),
  // Configuration des événements à écouter
  events: z.object({
    onLogin: z.boolean().default(true),
    onLogout: z.boolean().default(true),
    onCallStart: z.boolean().default(true),
    onCallEnd: z.boolean().default(true),
    onCallAnswer: z.boolean().default(true),
  }).default({
    onLogin: true,
    onLogout: true,
    onCallStart: true,
    onCallEnd: true,
    onCallAnswer: true,
  }),
  // Configuration des permissions
  permissions: z.object({
    canMakeOutboundCalls: z.boolean().default(true),
    canReceiveInboundCalls: z.boolean().default(true),
    canTransferCalls: z.boolean().default(true),
    canRecordCalls: z.boolean().default(false),
  }).default({
    canMakeOutboundCalls: true,
    canReceiveInboundCalls: true,
    canTransferCalls: true,
    canRecordCalls: false,
  }),
});

export type AircallConfig = z.infer<typeof AircallConfigSchema>;

// Schéma pour les actions d'appel
export const AircallCallActionSchema = z.object({
  requestId: z.string(),
  phoneNumber: z.string(),
  userDisplayName: z.string().optional(),
  notes: z.string().optional(),
});

export type AircallCallAction = z.infer<typeof AircallCallActionSchema>;

// Schéma pour les événements Aircall
export const AircallEventSchema = z.object({
  type: z.enum(['login', 'logout', 'call_start', 'call_end', 'call_answer']),
  userId: z.string(),
  data: z.record(z.any()).optional(),
  timestamp: z.string().datetime(),
});

export type AircallEvent = z.infer<typeof AircallEventSchema>;

export default {
  AircallConfigSchema,
  AircallCallActionSchema,
  AircallEventSchema,
}; 