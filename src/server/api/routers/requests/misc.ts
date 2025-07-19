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
      category: true,
      identityPicture: true,
    },
  },
  submittedBy: {
    select: {
      id: true,
      name: true,
      profileId: true,
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
  formData: true,
  submittedBy: {
    select: {
      id: true,
      name: true,
      profileId: true,
      documents: true,
    },
  },
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
      requiredDocuments: true,
      optionalDocuments: true,
      deliveryMode: true,
      processingMode: true,
      deliveryAppointment: true,
      deliveryAppointmentDuration: true,
      deliveryAppointmentDesc: true,
      appointmentDuration: true,
      appointmentInstructions: true,
      requiresAppointment: true,
    },
  },
  appointments: {
    include: {
      location: true,
    },
  },
  deliveryAddress: true,
  proxyName: true,
  proxyIdentityDoc: true,
  proxyPowerOfAttorney: true,
  trackingNumber: true,
  deliveryStatus: true,
  chosenDeliveryMode: true,
  chosenProcessingMode: true,
};

export type RequestDetails = Prisma.ServiceRequestGetPayload<{
  select: typeof RequestDetailsSelect;
}>;
