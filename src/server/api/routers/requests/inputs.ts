import { z } from 'zod';
import { RequestStatus, ServicePriority, ServiceCategory } from '@prisma/client';

// Schema pour les filtres de demandes
export const requestFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.array(z.nativeEnum(RequestStatus)).optional(),
  priority: z.array(z.nativeEnum(ServicePriority)).optional(),
  serviceCategory: z.array(z.nativeEnum(ServiceCategory)).optional(),
  assignedToId: z.array(z.string()).optional(),
  organizationId: z.array(z.string()).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  userId: z.string().optional(),
});

// Schema pour la mise à jour de statut
export const statusUpdateSchema = z.object({
  requestId: z.string(),
  status: z.nativeEnum(RequestStatus),
  notes: z.string().optional(),
});

// Schema pour l'assignation
export const assignmentSchema = z.object({
  requestId: z.string(),
  agentId: z.string(),
});

// Schema pour la validation consulaire
export const consularValidationSchema = z.object({
  requestId: z.string(),
  profileId: z.string(),
  residenceCountryCode: z.string(),
  status: z.nativeEnum(RequestStatus),
  validityYears: z.number().min(1).max(10).default(3),
  notes: z.string().optional(),
  organizationId: z.string().optional(),
});
