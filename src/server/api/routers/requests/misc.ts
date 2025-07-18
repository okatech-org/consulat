import type { Prisma } from '@prisma/client';

export const RequestListItemSelect: Prisma.ServiceRequestSelect = {
  id: true,
  status: true,
  priority: true,
  serviceCategory: true,
  organizationId: true,
  createdAt: true,
  updatedAt: true,
  submittedAt: true,
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
      phoneNumber: true,
    },
  },
  submittedBy: {
    select: {
      id: true,
      name: true,
    },
  },
  assignedTo: {
    select: {
      id: true,
      name: true,
    },
  },
  organization: {
    select: {
      id: true,
      name: true,
      metadata: true,
    },
  },
};

export type RequestListItem = Prisma.ServiceRequestGetPayload<{
  select: typeof RequestListItemSelect;
}>;

export const RequestDetailsSelect: Prisma.ServiceRequestSelect = {
  ...RequestListItemSelect,
  requiredDocuments: {
    include: {
      validatedBy: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  },
  notes: {
    include: {
      author: {
        select: {
          id: true,
          image: true,
          name: true,
        },
      },
    },
  },
  actions: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          roles: true,
        },
      },
    },
  },
  service: {
    select: {
      id: true,
      name: true,
      steps: true,
    },
  },
  appointments: {
    include: {
      location: true,
    },
  },
};

export type RequestDetails = Prisma.ServiceRequestGetPayload<{
  select: typeof RequestDetailsSelect;
}>;
