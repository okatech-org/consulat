'use server';

import { revalidatePath } from 'next/cache';
import { ROUTES } from '@/schemas/routes';
import type {
  CreateOrganizationInput,
  OrganizationCountryInfos,
  OrganizationMetadataSettings,
  OrganizationSettingsFormData,
  UpdateOrganizationInput,
} from '@/schemas/organization';
import {
  OrganizationStatus,
  ServiceCategory,
  UserRole,
  Prisma,
  type User,
} from '@prisma/client';

import type { AgentFormData } from '@/schemas/user';
import { env } from '@/env';
import { sendAdminWelcomeEmail } from '@/lib/services/notifications/providers/emails';
import { notify } from '@/lib/services/notifications';
import { NotificationChannel } from '@/types/notifications';
import { getTranslations } from 'next-intl/server';
import { checkAuth } from '@/lib/auth/action';
import { db } from '@/server/db';
import {
  type OrganizationListingItem,
  type FullOrganization,
  FullOrganizationInclude,
  type OrganizationWithIncludes,
  createOrganizationInclude,
  type BaseAgent,
  BaseAgentInclude,
  FullAgentInclude,
  type AgentWithIncludes,
  createAgentInclude,
} from '@/types/organization';

export async function getOrganizations(
  organizationId?: string,
): Promise<OrganizationListingItem[]> {
  await checkAuth([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER]);
  const where: Prisma.OrganizationWhereInput = {
    ...(organizationId && { id: organizationId }),
  };

  return db.organization.findMany({
    where,
    include: {
      countries: true,
      _count: {
        select: {
          services: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function createOrganization(data: CreateOrganizationInput) {
  try {
    await checkAuth([UserRole.SUPER_ADMIN]);

    // Créer l'organisation
    const organization = await db.organization.create({
      data: {
        name: data.name,
        type: data.type,
        status: data.status,
        countries: {
          connect: data.countryIds.map((id) => ({ code: id })),
        },
      },
    });

    // Créer l'utilisateur admin si email fourni
    if (data.adminEmail && data.countryIds[0]) {
      await db.user.create({
        data: {
          email: data.adminEmail,
          roles: [UserRole.ADMIN],
          role: UserRole.ADMIN,
          managedOrganization: {
            connect: { id: organization.id },
          },
        },
      });

      await sendAdminWelcomeEmail({
        adminEmail: data.adminEmail,
        adminName: `@${data.adminEmail.split('@')[0]}`,
        organizationName: data.name,
        dashboardUrl: `${env.NEXT_PUBLIC_URL}/${ROUTES.dashboard.base}`,
        organizationLogo: `${env.NEXT_PUBLIC_ORG_LOGO}`,
      });
    }

    revalidatePath(ROUTES.sa.organizations);
    return { data: organization };
  } catch (error) {
    console.error('Failed to create organization:', error);
    return { error: 'Failed to create organization' };
  }
}

export async function updateOrganization(id: string, data: UpdateOrganizationInput) {
  try {
    await checkAuth([UserRole.SUPER_ADMIN, UserRole.ADMIN]);

    const organization = await db.organization.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type,
        status: data.status,
        countries: {
          set: data.countryIds?.map((id) => ({ id })) ?? [],
        },
      },
    });

    revalidatePath(ROUTES.sa.organizations);
    return { data: organization };
  } catch (error) {
    console.error('Failed to update organization:', error);
    return { error: 'Failed to update organization' };
  }
}

export async function updateOrganizationStatus(id: string, status: OrganizationStatus) {
  try {
    await checkAuth([UserRole.SUPER_ADMIN, UserRole.ADMIN]);

    const organization = await db.organization.update({
      where: { id },
      data: { status },
    });

    revalidatePath(ROUTES.sa.organizations);
    return { data: organization };
  } catch (error) {
    console.error('Failed to update organization status:', error);
    return { error: 'Failed to update organization status' };
  }
}

export async function deleteOrganization(id: string) {
  await checkAuth([UserRole.SUPER_ADMIN]);

  try {
    // Vérifier si l'organisme a des utilisateurs ou services
    const organization = await db.organization.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            services: true,
          },
        },
      },
    });

    if (!organization) {
      return { error: 'messages.error.not_found' };
    }

    // Empêcher la suppression si l'organisme a des dépendances
    if (organization._count.services > 0) {
      return { error: 'messages.error.has_dependencies' };
    }

    // Supprimer l'organisme
    await db.organization.delete({
      where: { id },
    });

    revalidatePath(ROUTES.sa.organizations);
    return { success: true };
  } catch (error) {
    console.error('Error deleting organization:', error);
    return { error: 'messages.error.delete' };
  }
}

export async function getOrganizationById(id: string): Promise<{
  data?: FullOrganization | null;
  error?: string;
}> {
  await checkAuth();

  try {
    const organization = await db.organization.findUnique({
      where: { id },
      ...FullOrganizationInclude,
    });

    if (!organization) {
      return { error: 'messages.error.not_found' };
    }

    return {
      data: {
        ...organization,
        metadata: JSON.parse(
          typeof organization.metadata === 'string' ? organization.metadata : '{}',
        ),
      },
    };
  } catch (error) {
    console.error('Error fetching organization:', error);
    return { error: 'messages.error.fetch' };
  }
}

export async function getOrganizationWithSpecificIncludes<
  T extends keyof typeof FullOrganizationInclude.include,
>(id: string, includes: T[]): Promise<OrganizationWithIncludes<T> | null> {
  await checkAuth();
  const organization = await db.organization.findUnique({
    where: { id },
    ...createOrganizationInclude(includes),
  });

  if (!organization) {
    return null;
  }

  return {
    ...organization,
    metadata: JSON.parse(
      typeof organization.metadata === 'string' ? organization.metadata : '{}',
    ),
  };
}

export async function getAvailableServiceCategories(
  id: string,
): Promise<ServiceCategory[]> {
  await checkAuth([
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.AGENT,
    UserRole.MANAGER,
  ]);

  const categories = await db.consularService.groupBy({
    by: ['category'],
    where: {
      organizationId: id,
      isActive: true,
    },
    orderBy: {
      category: 'asc',
    },
    having: {
      category: {
        _count: {
          gt: 0,
        },
      },
    },
  });

  return categories.map(({ category }) => category);
}

export async function createNewAgent(data: AgentFormData): Promise<BaseAgent> {
  const baseUrl = env.NEXT_PUBLIC_URL;
  const t = await getTranslations('agent.notifications');

  const { user: currentUser } = await checkAuth([UserRole.SUPER_ADMIN, UserRole.ADMIN]);

  const {
    countryIds,
    serviceIds,
    firstName,
    lastName,
    role,
    managedByUserId,
    managedAgentIds,
    ...rest
  } = data;

  const agent = await db.user.create({
    data: {
      ...rest,
      name: `${firstName} ${lastName}`,
      roles: [role || UserRole.AGENT],
      role: role || UserRole.AGENT,
      ...(managedByUserId && { managedByUserId }),
      linkedCountries: {
        connect: countryIds.map((id) => ({ id })),
      },
      ...(serviceIds[0] && {
        assignedServices: {
          connect: serviceIds.map((id) => ({ id })),
        },
      }),
    },
    ...FullAgentInclude,
  });

  // If creating a manager, assign the agents to them
  if (role === UserRole.MANAGER && managedAgentIds && managedAgentIds.length > 0) {
    await db.user.updateMany({
      where: {
        id: { in: managedAgentIds },
      },
      data: {
        managedByUserId: agent.id,
      },
    });
  }

  await notify({
    userId: agent.id,
    type: 'FEEDBACK', // Utiliser un type existant approprié
    title: t('welcome.title'),
    message: t('welcome.message', {
      organization: agent.assignedOrganization?.name ?? 'N/A',
    }),
    channels: [NotificationChannel.APP, NotificationChannel.EMAIL],
    email: agent.email || undefined,
    priority: 'high',
    actions: [
      {
        label: t('welcome.action'),
        url: `${baseUrl}${ROUTES.dashboard.base}`,
        primary: true,
      },
    ],
    metadata: {
      createdBy: currentUser?.id,
      createdByName: `${currentUser?.name || ''}`.trim(),
      assignedServices: serviceIds,
      organization: agent.assignedOrganization?.name ?? 'N/A',
    },
  });

  return agent;
}

export async function updateAgent(id: string, data: Partial<AgentFormData>) {
  try {
    await checkAuth([UserRole.SUPER_ADMIN, UserRole.ADMIN]);

    const { countryIds, ...rest } = data;

    const agent = await db.user.update({
      where: { id },
      data: {
        ...rest,
        ...(countryIds && {
          linkedCountries: {
            set: countryIds.map((id) => ({ id })),
          },
        }),
      },
    });

    revalidatePath(ROUTES.sa.organizations);
    return { data: agent };
  } catch (error) {
    console.error('Failed to update agent:', error);
    return { error: 'Failed to update agent' };
  }
}

export async function getOrganizationAgents(
  id: string,
  managerId?: string,
): Promise<{
  data?: BaseAgent[];
  error?: string;
}> {
  try {
    const agents = await db.user.findMany({
      where: {
        assignedOrganizationId: id,
        roles: {
          has: UserRole.AGENT,
        },
        ...(managerId && { managedByUserId: managerId }),
      },
      ...BaseAgentInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { data: agents };
  } catch (error) {
    console.error('Error fetching agents:', error);
    return { error: 'messages.error.fetch' };
  }
}

export async function getOrganizationManagers(id?: string): Promise<{
  data?: User[];
  error?: string;
}> {
  await checkAuth([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER]);

  if (!id) {
    return { data: [] };
  }

  try {
    const managers = await db.user.findMany({
      where: {
        assignedOrganizationId: id,
        roles: {
          has: UserRole.MANAGER,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { data: managers };
  } catch (error) {
    console.error('Error fetching managers:', error);
    return { error: 'messages.error.fetch' };
  }
}

export async function getAgentsByManager(managerId: string): Promise<{
  data?: BaseAgent[];
  error?: string;
}> {
  const { user } = await checkAuth([
    UserRole.MANAGER,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  ]);

  // Verify the manager can only see their own agents
  if (user.roles.includes(UserRole.MANAGER) && user.id !== managerId) {
    return { error: 'messages.error.unauthorized' };
  }

  try {
    const agents = await db.user.findMany({
      where: {
        managedByUserId: managerId,
        roles: {
          has: UserRole.AGENT,
        },
      },
      ...BaseAgentInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { data: agents };
  } catch (error) {
    console.error('Error fetching agents by manager:', error);
    return { error: 'messages.error.fetch' };
  }
}

export async function getAvailableAgentsForManager(organizationId: string): Promise<{
  data?: { id: string; name: string | null }[];
  error?: string;
}> {
  try {
    const agents = await db.user.findMany({
      where: {
        assignedOrganizationId: organizationId,
        roles: {
          has: UserRole.AGENT,
        },
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return { data: agents };
  } catch (error) {
    console.error('Error fetching available agents:', error);
    return { error: 'messages.error.fetch' };
  }
}

export async function getOrganizationAgentsWithIncludes<
  T extends keyof typeof FullAgentInclude.include,
>(
  id: string,
  includes: T[],
): Promise<{
  data?: AgentWithIncludes<T>[];
  error?: string;
}> {
  await checkAuth([UserRole.SUPER_ADMIN, UserRole.ADMIN]);

  try {
    const agents = await db.user.findMany({
      where: {
        organizationId: id,
        roles: {
          has: UserRole.AGENT,
        },
      },
      ...createAgentInclude(includes),
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { data: agents };
  } catch (error) {
    console.error('Error fetching agents:', error);
    return { error: 'messages.error.fetch' };
  }
}

export async function getOrganizationByCountry(countryCode: string) {
  return db.organization.findFirst({
    where: {
      countries: {
        some: {
          code: countryCode,
        },
      },
    },
  });
}

export async function updateOrganizationSettings(
  organizationId: string,
  data: OrganizationSettingsFormData,
) {
  await checkAuth([UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN]);

  try {
    const { countryIds, metadata, ...rest } = data;

    const organization = await db.organization.update({
      where: { id: organizationId },
      data: {
        ...rest,
        ...(metadata && { metadata: JSON.stringify(metadata) }),
        ...(countryIds && {
          countries: {
            set: countryIds.map((id) => ({ code: id })),
          },
        }),
      },
    });

    revalidatePath(ROUTES.dashboard.settings);
    return { data: organization };
  } catch (error) {
    console.error('Error updating organization settings:', error);
    return { error: 'Failed to update organization settings' };
  }
}

export async function getOrganisationCountryInfos(
  organizationId: string,
  countryCode: string,
): Promise<OrganizationCountryInfos> {
  const data = await db.organization.findUnique({
    where: { id: organizationId },
  });

  const { metadata, ...rest } = data || {};

  const formattedMetadata = JSON.parse(
    typeof metadata === 'string' ? metadata : '{}',
  ) as Record<string, OrganizationMetadataSettings>;

  // @ts-expect-error - TODO: fix this (JsonValue is not typed)
  return {
    ...rest,
    ...formattedMetadata[countryCode],
  };
}
