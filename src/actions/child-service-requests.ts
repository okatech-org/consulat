import { PrismaClient, ServiceCategory, ServicePriority } from '@prisma/client';
import { getParentalAuthoritiesByChild } from './parental-authority';
import { hasPermission } from '@/lib/permissions/utils';

// Instance de Prisma
const prisma = new PrismaClient();

interface CreateChildServiceRequestParams {
  // Informations sur la demande
  serviceId: string;
  submittedById: string; // ID de l'utilisateur (parent) qui fait la demande
  childProfileId: string; // ID du profil de l'enfant concerné
  serviceCategory: ServiceCategory;
  priority?: ServicePriority;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formData?: any; // Nécessaire pour la compatibilité avec le type Json de Prisma

  // Informations sur l'organisation
  organizationId?: string;
}

/**
 * Crée une demande de service pour un enfant et la partage avec les autres parents
 */
export async function createChildServiceRequest(data: CreateChildServiceRequestParams) {
  // 1. Récupérer le profil du parent qui fait la demande
  const parentUser = await prisma.user.findUnique({
    where: { id: data.submittedById },
    include: { profile: true },
  });

  if (!parentUser || !parentUser.profile) {
    throw new Error('Utilisateur ou profil introuvable');
  }

  // 2. Vérifier que le parent a l'autorité parentale sur l'enfant
  // Utiliser le système de permissions
  const childProfile = await prisma.profile.findUnique({
    where: { id: data.childProfileId },
    include: {
      parentAuthorities: {
        where: {
          isActive: true,
        },
        include: {
          parentProfile: true,
        },
      },
    },
  });

  if (!childProfile) {
    throw new Error('Profil enfant introuvable');
  }

  // Vérifier l'autorisation avec le système de permissions
  const hasAuthority = hasPermission(parentUser, 'profiles', 'viewChild', childProfile);

  if (!hasAuthority) {
    throw new Error("Vous n'avez pas l'autorité parentale sur cet enfant");
  }

  // 4. Créer la demande de service
  const serviceRequest = await prisma.serviceRequest.create({
    data: {
      serviceId: data.serviceId,
      submittedById: data.submittedById,
      requestedForId: data.childProfileId,
      serviceCategory: data.serviceCategory,
      priority: data.priority || 'STANDARD',
      formData: data.formData || {},
      organizationId: data.organizationId,
      submittedAt: new Date(),
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
  });

  // 5. Récupérer tous les autres parents de l'enfant pour partager la demande
  const parentalAuthorities = await getParentalAuthoritiesByChild(data.childProfileId);

  // 6. Partager la demande avec tous les parents (sauf celui qui a fait la demande)
  const otherParentAuthorities = parentalAuthorities.filter(
    (authority) => authority.parentProfileId !== parentUser.profile?.id,
  );

  if (otherParentAuthorities.length > 0) {
    // Créer les relations de partage entre la demande et les autres parents
    await Promise.all(
      otherParentAuthorities.map((authority) =>
        prisma.serviceRequest.update({
          where: { id: serviceRequest.id },
          data: {
            sharedWith: {
              connect: { id: authority.id },
            },
          },
        }),
      ),
    );

    // 7. Créer des notifications pour les autres parents
    await Promise.all(
      otherParentAuthorities.map(async (authority) => {
        const parentUser = await prisma.profile.findUnique({
          where: { id: authority.parentProfileId },
          include: { user: true },
        });

        if (parentUser?.user) {
          const service = await prisma.consularService.findUnique({
            where: { id: serviceRequest.serviceId },
            select: { name: true },
          });

          return prisma.notification.create({
            data: {
              type: 'REQUEST_SUBMITTED',
              title: 'Nouvelle demande pour votre enfant',
              message: `Une demande de ${service?.name || 'service consulaire'} a été soumise pour ${childProfile.firstName} ${childProfile.lastName}`,
              userId: parentUser.user.id,
              profileId: authority.parentProfileId,
            },
          });
        }
      }),
    );
  }

  return serviceRequest;
}

/**
 * Récupère toutes les demandes de service pour les enfants d'un parent
 */
export async function getChildServiceRequestsByParent(parentProfileId: string) {
  // 1. Récupérer tous les enfants du parent
  const childProfiles = await prisma.parentalAuthority.findMany({
    where: {
      parentProfileId,
      isActive: true,
    },
    select: {
      childProfileId: true,
    },
  });

  const childProfileIds = childProfiles.map((cp) => cp.childProfileId);

  // 2. Récupérer toutes les demandes pour ces enfants
  return prisma.serviceRequest.findMany({
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
      requestedFor: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Récupère toutes les demandes pour un enfant spécifique
 */
export async function getServiceRequestsForChild(
  parentProfileId: string,
  childProfileId: string,
  userId: string,
) {
  // 1. Récupérer l'utilisateur
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  if (!user || !user.profile) {
    throw new Error('Utilisateur ou profil introuvable');
  }

  // 2. Récupérer le profil de l'enfant
  const childProfile = await prisma.profile.findUnique({
    where: { id: childProfileId },
    include: {
      parentAuthorities: {
        where: {
          isActive: true,
        },
        include: {
          parentProfile: true,
        },
      },
    },
  });

  if (!childProfile) {
    throw new Error('Profil enfant introuvable');
  }

  // 3. Vérifier l'autorisation avec le système de permissions
  const hasAuthority = hasPermission(user, 'profiles', 'viewChild', childProfile);

  if (!hasAuthority) {
    throw new Error("Vous n'avez pas l'autorité parentale sur cet enfant");
  }

  // 4. Récupérer les demandes pour cet enfant
  return prisma.serviceRequest.findMany({
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
      requestedFor: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      sharedWith: {
        include: {
          parentProfile: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Notifie tous les parents lors d'une mise à jour d'une demande
 */
export async function notifyParentsOnRequestUpdate(
  requestId: string,
  title: string,
  message: string,
  notificationType: string,
) {
  // 1. Récupérer la demande avec l'enfant concerné
  const request = await prisma.serviceRequest.findUnique({
    where: { id: requestId },
    include: {
      requestedFor: true,
      sharedWith: {
        include: {
          parentProfile: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });

  if (!request || !request.requestedFor) {
    throw new Error('Demande ou profil enfant introuvable');
  }

  // 2. Récupérer tous les parents de l'enfant
  const parentalAuthorities = await getParentalAuthoritiesByChild(
    request.requestedFor.id,
  );

  // 3. Créer des notifications pour tous les parents
  const notifications = await Promise.all(
    parentalAuthorities.map(async (authority) => {
      const parentUser = await prisma.profile.findUnique({
        where: { id: authority.parentProfileId },
        include: { user: true },
      });

      if (parentUser?.user) {
        return prisma.notification.create({
          data: {
            // @ts-expect-error: Les types de notification sont plus nombreux que ceux définis dans l'enum
            type: notificationType,
            title,
            message,
            userId: parentUser.user.id,
            profileId: authority.parentProfileId,
          },
        });
      }
    }),
  );

  return notifications.filter(Boolean);
}
