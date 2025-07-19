import { Prisma, UserRole } from '@prisma/client';
import { z } from 'zod';

export const AgentListItemSelect: Prisma.UserSelect = {
  id: true,
  name: true,
  email: true,
  phoneNumber: true,
  roles: true,
  assignedServices: {
    select: {
      id: true,
      name: true,
    },
  },
  linkedCountries: {
    select: {
      id: true,
      name: true,
      code: true,
    },
  },
  assignedOrganizationId: true,
  managedByUserId: true,
  completedRequests: true,
  averageProcessingTime: true,
  _count: {
    select: {
      assignedRequests: {
        where: {
          status: {
            notIn: ['COMPLETED', 'REJECTED'],
          },
        },
      },
    },
  },
};

export const AgentDetailsSelect: Prisma.UserSelect = {
  ...AgentListItemSelect,
  assignedRequests: {
    select: {
      id: true,
      status: true,
      priority: true,
      serviceCategory: true,
      createdAt: true,
      assignedAt: true,
      service: {
        select: {
          id: true,
          name: true,
        },
      },
      requestedFor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      submittedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  },
  specializations: true,
  availability: true,
  managedAgents: {
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      linkedCountries: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      assignedServices: {
        select: {
          id: true,
          name: true,
        },
      },
      completedRequests: true,
      averageProcessingTime: true,
      assignedRequests: {
        where: {
          status: {
            notIn: ['COMPLETED', 'REJECTED'],
          },
        },
        select: {
          id: true,
          status: true,
        },
      },
    },
  },
  managedBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
};

// Schémas de validation
export const agentFiltersSchema = z.object({
  search: z.string().optional(),
  linkedCountries: z.array(z.string()).optional(),
  assignedServices: z.array(z.string()).optional(),
  assignedOrganizationId: z.array(z.string()).optional(),
  managedByUserId: z.array(z.string()).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sortBy: z
    .object({
      field: z.enum(['name', 'email', 'createdAt', 'completedRequests']),
      direction: z.enum(['asc', 'desc']),
    })
    .optional(),
});

export const createAgentSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phoneNumber: z.string().optional(),
  countryIds: z.array(z.string()),
  serviceIds: z.array(z.string()),
  assignedOrganizationId: z.string(),
  role: z.enum([UserRole.AGENT, UserRole.MANAGER]).default(UserRole.AGENT),
  managedByUserId: z.string().optional(),
  managedAgentIds: z.array(z.string()).optional(),
});

export const updateAgentSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().optional(),
  countryIds: z.array(z.string()).optional(),
  serviceIds: z.array(z.string()).optional(),
  managedByUserId: z.string().nullable().optional(),
  role: z.enum([UserRole.AGENT, UserRole.MANAGER]).optional(),
  managedAgentIds: z.array(z.string()).optional(),
});

export const assignRequestSchema = z.object({
  requestId: z.string(),
  agentId: z.string(),
});
