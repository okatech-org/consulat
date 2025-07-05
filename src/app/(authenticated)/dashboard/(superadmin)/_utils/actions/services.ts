'use server';

import { checkAuth } from '@/lib/auth/action';
import { db } from '@/server/db';
import { NewServiceSchemaInput } from '@/schemas/consular-service';
import { ROUTES } from '@/schemas/routes';
import type {
  ConsularServiceItem,
  ConsularServiceListingItem,
} from '@/types/consular-service';
import { UserRole, Prisma, ServiceCategory } from '@prisma/client';
import { revalidatePath } from 'next/cache';

// Options pour la récupération des services
export interface ServicesListRequestOptions {
  search?: string;
  category?: string[];
  organizationId?: string[];
  isActive?: boolean[];
  page: number;
  limit: number;
  sortBy?: {
    direction: 'asc' | 'desc';
    field: 'name' | 'category' | 'isActive' | 'createdAt';
  };
}

const ServiceListItemSelect: Prisma.ConsularServiceSelect = {
  id: true,
  name: true,
  description: true,
  category: true,
  isActive: true,
  organizationId: true,
  countryCode: true,
};

export type ServiceListItem = Prisma.ConsularServiceGetPayload<{
  select: typeof ServiceListItemSelect;
}>;

export interface ServicesListResult {
  items: ServiceListItem[];
  total: number;
}

/**
 * Récupérer les services avec filtres et pagination
 */
export async function getServicesList(
  options?: ServicesListRequestOptions,
): Promise<ServicesListResult> {
  await checkAuth(['ADMIN', 'SUPER_ADMIN', 'MANAGER']);

  const {
    search,
    category,
    organizationId,
    isActive,
    page = 1,
    limit = 10,
    sortBy,
  } = options || {};

  const where: Prisma.ConsularServiceWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (category && category.length > 0) {
    where.category = { in: category as ServiceCategory[] };
  }

  if (organizationId && organizationId.length > 0) {
    where.organizationId = { in: organizationId };
  }

  if (isActive && isActive.length > 0) {
    if (isActive.length === 1) {
      where.isActive = isActive[0];
    }
    // If both true and false are selected, don't filter (show all)
  }

  try {
    const [items, total] = await Promise.all([
      db.consularService.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        select: ServiceListItemSelect,
        ...(sortBy && {
          orderBy: {
            [sortBy.field]: sortBy.direction,
          },
        }),
      }),
      db.consularService.count({ where }),
    ]);

    return {
      items,
      total,
    };
  } catch (error) {
    console.error('Error fetching services:', error);
    throw new Error('Failed to fetch services');
  }
}

/**
 * Récupérer tous les services (legacy function for backward compatibility)
 */
export async function getServices(
  organizationId?: string,
): Promise<ConsularServiceListingItem[]> {
  const where: Prisma.ConsularServiceWhereInput = {
    ...(organizationId && { organizationId }),
  };

  return db.consularService.findMany({
    where,
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      name: true,
      description: true,
      category: true,
      isActive: true,
      organizationId: true,
      countryCode: true,
    },
  });
}

/**
 * Créer un nouveau service
 */

export async function createService(data: NewServiceSchemaInput) {
  await checkAuth([UserRole.SUPER_ADMIN, UserRole.ADMIN]);

  const service = await db.consularService.create({
    data: {
      name: data.name,
      description: data.description,
      category: data.category,
      countryCode: data.countryCode,
      organizationId: data.organizationId,
    },
  });

  return service;
}

/**
 * Mettre à jour un service
 */
export async function updateService(data: Partial<ConsularServiceItem>) {
  await checkAuth([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER]);

  if (!data.id) {
    return { error: 'Service ID is required' };
  }

  try {
    // Mise à jour du service et de ses étapes
    const service = await db.$transaction(async (tx) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { steps, organizationId, generateDocumentSettings, ...serviceData } = data;

      // Supprimer les étapes existantes si de nouvelles sont fournies
      if (steps) {
        await tx.serviceStep.deleteMany({
          where: { serviceId: data.id },
        });
      }

      if (generateDocumentSettings) {
        // 1. Récupérer les settings existants (non utilisé, donc retiré)
        // const existingSettings = await tx.generateDocumentSettings.findMany({
        //   where: { serviceId: data.id },
        // });
        const incoming: typeof generateDocumentSettings = generateDocumentSettings;
        const incomingIds: string[] = incoming
          .filter((s) => s.id)
          .map((s) => s.id as string);

        // 2. Supprimer ceux qui ne sont plus présents
        await tx.generateDocumentSettings.deleteMany({
          where: {
            serviceId: data.id,
            id: { notIn: incomingIds },
          },
        });

        // 3. Update ou create
        for (const setting of incoming) {
          if (setting.id) {
            await tx.generateDocumentSettings.update({
              where: { id: setting.id },
              data: {
                templateId: setting.templateId,
                generateOnStatus: setting.generateOnStatus,
                settings: setting.settings ?? undefined,
              },
            });
          } else {
            await tx.generateDocumentSettings.create({
              data: {
                serviceId: data.id,
                templateId: setting.templateId,
                generateOnStatus: setting.generateOnStatus,
                ...(setting.settings && { settings: JSON.stringify(setting.settings) }),
              },
            });
          }
        }
      }

      // Mettre à jour le service
      return tx.consularService.update({
        where: { id: data.id },
        data: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...(serviceData as any),
          ...(data.organizationId && {
            organization: {
              connect: { id: data.organizationId },
            },
          }),
          ...(steps && {
            steps: {
              createMany: {
                data: steps.map((step) => ({
                  ...step,
                  fields: JSON.stringify(step.fields),
                  validations: JSON.stringify(step.validations),
                })),
              },
            },
          }),
        },
        include: {
          steps: {
            orderBy: {
              order: 'asc',
            },
          },
        },
      });
    });

    console.log({ service, data });

    revalidatePath(ROUTES.dashboard.services);
    return { data: service };
  } catch (error) {
    console.error('Error updating service:', error);
    return { error: 'Failed to update service' };
  }
}

export async function updateServiceStatus(id: string, isActive: boolean) {
  await checkAuth([UserRole.SUPER_ADMIN, UserRole.ADMIN]);

  try {
    const service = await db.consularService.update({
      where: { id },
      data: {
        isActive,
      },
    });

    revalidatePath(ROUTES.dashboard.services);
    return { data: service };
  } catch (error) {
    console.error('Error updating service status:', error);
    return { error: 'Failed to update service status' };
  }
}

/**
 * Supprimer un service
 */
export async function deleteService(id: string) {
  await checkAuth([UserRole.SUPER_ADMIN, UserRole.ADMIN]);

  try {
    // Vérifier si le service a des demandes en cours
    const service = await db.consularService.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            requests: true,
          },
        },
      },
    });

    if (!service) {
      return { error: 'Service not found' };
    }

    if (service._count.requests > 0) {
      return { error: 'Cannot delete service with existing requests' };
    }

    await db.consularService.delete({
      where: { id },
    });

    revalidatePath(ROUTES.dashboard.services);
    return { success: true };
  } catch (error) {
    console.error('Error deleting service:', error);
    return { error: 'Failed to delete service' };
  }
}

/**
 * Assigner un service à une organisation
 */
export async function assignServiceToOrganization(
  serviceId: string,
  organizationId: string,
) {
  await checkAuth([UserRole.SUPER_ADMIN, UserRole.ADMIN]);

  try {
    await db.organization.update({
      where: { id: organizationId },
      data: {
        services: {
          connect: { id: serviceId },
        },
      },
    });

    revalidatePath(ROUTES.dashboard.services);
    return { success: true };
  } catch (error) {
    console.error('Error assigning service:', error);
    return { error: 'Failed to assign service' };
  }
}

/**
 * Désassigner un service d'une organisation
 */
export async function unassignServiceFromOrganization(
  serviceId: string,
  organizationId: string,
) {
  await checkAuth([UserRole.SUPER_ADMIN, UserRole.ADMIN]);

  try {
    await db.organization.update({
      where: { id: organizationId },
      data: {
        services: {
          disconnect: { id: serviceId },
        },
      },
    });

    revalidatePath(ROUTES.dashboard.services);
    return { success: true };
  } catch (error) {
    console.error('Error unassigning service:', error);
    return { error: 'Failed to unassign service' };
  }
}

/**
 * Récupérer un service par son ID
 */
export async function getFullService(id: string): Promise<ConsularServiceItem | null> {
  await checkAuth();

  const service = await db.consularService.findUnique({
    where: { id },
    include: {
      steps: true,
      organization: true,
      generateDocumentSettings: true,
    },
  });

  if (!service) {
    return null;
  }

  const transformedService = {
    ...service,
    steps: service.steps.map((step) => ({
      ...step,
      fields: step.fields ? JSON.parse(`${step.fields}`) : [],
      validations: step.validations ? JSON.parse(`${step.validations}`) : {},
    })),
  };

  return transformedService;
}

export async function duplicateService(
  serviceId: string,
): Promise<{ data?: string; error?: string }> {
  await checkAuth([UserRole.SUPER_ADMIN, UserRole.ADMIN]);

  try {
    const existingService = await db.consularService.findUnique({
      where: { id: serviceId },
      include: { steps: true },
    });

    if (!existingService) {
      return { error: 'Service non trouvé' };
    }

    Object.entries(existingService).forEach(([key, value]) => {
      if (value === null) {
        delete (existingService as Record<string, unknown>)[key];
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { organizationId, name, id, steps, isActive, ...serviceData } = existingService;

    // Créer le nouveau service
    const duplicatedService = await db.consularService.create({
      data: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(serviceData as unknown as any),
        name: `${name} (Copie)`,
        isActive: false,
        ...(steps && {
          steps: {
            createMany: {
              data: steps.map((step) => ({
                order: step.order,
                title: step.title,
                description: step.description || '',
                ...(step.fields && { fields: step.fields }),
                ...(step.validations && { validations: step.validations }),
              })),
            },
          },
        }),
      },
      include: { steps: true, organization: true },
    });

    revalidatePath(ROUTES.dashboard.services);
    return { data: duplicatedService.id };
  } catch (error) {
    console.error('Error duplicating service:', error);
    return { error: 'Failed to duplicate service' };
  }
}
