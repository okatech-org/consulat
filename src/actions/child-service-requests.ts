import {
  PrismaClient,
  ServiceCategory,
  ServicePriority,
  NotificationType,
} from '@prisma/client';
import { canAccessChildProfile } from './child-profiles';

// Instance de Prisma
const prisma = new PrismaClient();

interface CreateChildServiceRequestParams {
  serviceId: string;
  submittedById: string; // ID de l'utilisateur parent qui fait la demande
  childProfileId: string; // ID du profil enfant pour lequel la demande est faite
  serviceCategory: ServiceCategory;
  priority: ServicePriority;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formData: any; // Données du formulaire (compatible avec Prisma JSON)
  organizationId?: string;
}

/**
 * Crée une demande de service pour un enfant et la partage avec les autres parents
 */
export async function createChildServiceRequest(data: CreateChildServiceRequestParams) {
  // 1. Vérifier que l'utilisateur parent a l'autorité sur l'enfant
  const hasAuthority = await canAccessChildProfile(
    data.submittedById,
    data.childProfileId,
  );

  if (!hasAuthority) {
    throw new Error("Vous n'avez pas l'autorité parentale sur cet enfant");
  }

  // 2. Récupérer le profil de l'enfant pour vérifier qu'il existe
  const childProfile = await prisma.profile.findUnique({
    where: { id: data.childProfileId },
  });

  if (!childProfile) {
    throw new Error('Profil enfant introuvable');
  }

  // 3. Créer la demande de service
  const serviceRequest = await prisma.serviceRequest.create({
    data: {
      serviceId: data.serviceId,
      submittedById: data.submittedById,
      requestedForId: data.childProfileId,
      serviceCategory: data.serviceCategory,
      priority: data.priority,
      formData: data.formData,
      organizationId: data.organizationId,
    },
    include: {
      service: true,
      submittedBy: true,
      requestedFor: true,
    },
  });

  // 4. Récupérer tous les autres parents de l'enfant pour partager la demande
  const parentalAuthorities = await prisma.parentalAuthority.findMany({
    where: {
      profileId: data.childProfileId,
      isActive: true,
    },
    include: {
      parentUsers: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // 5. Partager la demande avec les autres parents et envoyer des notifications
  for (const authority of parentalAuthorities) {
    for (const parentUser of authority.parentUsers) {
      // Ne pas partager avec l'utilisateur qui fait la demande
      if (parentUser.id === data.submittedById) {
        continue;
      }

      // Partager la demande
      await prisma.parentalAuthority.update({
        where: { id: authority.id },
        data: {
          sharedRequests: {
            connect: { id: serviceRequest.id },
          },
        },
      });

      // Envoyer une notification
      // Récupérer le nom du parent qui a fait la demande
      const submittingParent = await prisma.user.findUnique({
        where: { id: data.submittedById },
        select: { name: true },
      });

      // Récupérer le nom du service
      const serviceName = serviceRequest.service?.name || 'service consulaire';

      // Créer la notification
      await prisma.notification.create({
        data: {
          type: NotificationType.REQUEST_SUBMITTED,
          title: 'Nouvelle demande pour votre enfant',
          message: `${submittingParent?.name || 'Un parent'} a soumis une demande de ${serviceName} pour votre enfant ${childProfile.firstName} ${childProfile.lastName}.`,
          userId: parentUser.id,
          profileId: data.childProfileId,
        },
      });
    }
  }

  return serviceRequest;
}

/**
 * Récupère toutes les demandes de service pour les enfants d'un parent
 */
export async function getChildServiceRequestsByParent(parentUserId: string) {
  // 1. Récupérer tous les profils enfants du parent
  const parentalAuthorities = await prisma.parentalAuthority.findMany({
    where: {
      parentUsers: {
        some: {
          id: parentUserId,
        },
      },
      isActive: true,
    },
    select: {
      profileId: true,
    },
  });

  const childProfileIds = parentalAuthorities.map((authority) => authority.profileId);

  // 2. Récupérer toutes les demandes pour ces enfants
  if (childProfileIds.length === 0) {
    return [];
  }

  const serviceRequests = await prisma.serviceRequest.findMany({
    where: {
      requestedForId: {
        in: childProfileIds,
      },
    },
    include: {
      service: true,
      submittedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      requestedFor: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return serviceRequests;
}

/**
 * Récupère toutes les demandes de service pour un enfant spécifique
 */
export async function getServiceRequestsForChild(
  parentUserId: string,
  childProfileId: string,
) {
  // Vérifier l'autorité parentale
  const hasAuthority = await canAccessChildProfile(parentUserId, childProfileId);

  if (!hasAuthority) {
    throw new Error("Vous n'avez pas l'autorité parentale sur cet enfant");
  }

  // Récupérer les demandes
  const serviceRequests = await prisma.serviceRequest.findMany({
    where: {
      requestedForId: childProfileId,
    },
    include: {
      service: true,
      submittedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      requestedFor: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return serviceRequests;
}

/**
 * Envoie des notifications à tous les parents lorsqu'une demande de service pour un enfant est mise à jour
 */
export async function notifyParentsOnRequestUpdate(
  requestId: string,
  updateType: NotificationType,
  message: string,
) {
  // Récupérer la demande avec le profil de l'enfant
  const request = await prisma.serviceRequest.findUnique({
    where: { id: requestId },
    include: {
      requestedFor: true,
    },
  });

  if (!request || !request.requestedFor) {
    throw new Error('Demande introuvable ou non associée à un profil enfant');
  }

  // Récupérer tous les parents de l'enfant
  const parentalAuthorities = await prisma.parentalAuthority.findMany({
    where: {
      profileId: request.requestedFor.id,
      isActive: true,
    },
    include: {
      parentUsers: {
        select: {
          id: true,
        },
      },
    },
  });

  // Envoyer des notifications à tous les parents
  for (const authority of parentalAuthorities) {
    for (const parentUser of authority.parentUsers) {
      await prisma.notification.create({
        data: {
          type: updateType,
          title: "Mise à jour d'une demande pour votre enfant",
          message,
          userId: parentUser.id,
          profileId: request.requestedFor.id,
        },
      });
    }
  }

  return true;
}
