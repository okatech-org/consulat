import { Prisma } from '@prisma/client';

// Base includes pour un rendez-vous
export const BaseAppointmentInclude = {
  include: {
    attendee: {
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
      },
    },
    organization: true,
  },
} as const;

// Includes complet pour un rendez-vous
export const FullAppointmentInclude = {
  include: {
    ...BaseAppointmentInclude.include,
    agent: {
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        serviceCategories: true,
        linkedCountries: {
          select: {
            code: true,
            name: true,
          },
        },
      },
    },
    request: {
      include: {
        service: true,
        documents: true,
      },
    },
    notifications: {
      orderBy: {
        createdAt: 'desc' as const,
      },
    },
  },
} as const;

// Type pour un rendez-vous de base
export type BaseAppointment = Prisma.AppointmentGetPayload<typeof BaseAppointmentInclude>;

// Type pour un rendez-vous complet
export type FullAppointment = Prisma.AppointmentGetPayload<typeof FullAppointmentInclude>;

// Fonction helper pour créer un include personnalisé
export function createAppointmentInclude<
  T extends keyof typeof FullAppointmentInclude.include,
>(fields: T[]) {
  return {
    include: Object.fromEntries(
      fields.map((field) => [field, FullAppointmentInclude.include[field]]),
    ),
  } as const;
}

// Type helper pour un rendez-vous avec des includes spécifiques
export type AppointmentWithIncludes<
  T extends keyof typeof FullAppointmentInclude.include,
> = Prisma.AppointmentGetPayload<ReturnType<typeof createAppointmentInclude<T>>>;

// Exemple d'utilisation:
// const agentInclude = createAppointmentInclude(['agent', 'request']);
// type AppointmentWithAgent = AppointmentWithIncludes<'agent' | 'request'>;
