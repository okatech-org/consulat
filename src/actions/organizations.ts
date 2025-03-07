'use server';

import { db } from '@/lib/prisma';
import { checkAuth } from '@/lib/auth/action';
import { revalidatePath } from 'next/cache';
import { ROUTES } from '@/schemas/routes';
import {
  CreateOrganizationInput,
  OrganizationCountryInfos,
  OrganizationMetadataSettings,
  OrganizationSettingsFormData,
  UpdateOrganizationInput,
} from '@/schemas/organization';
import { Country, OrganizationStatus, ServiceCategory, UserRole } from '@prisma/client';
import {
  OrganizationListingItem,
  FullOrganizationInclude,
  createOrganizationInclude,
  FullOrganization,
  OrganizationWithIncludes,
  BaseAgentInclude,
  FullAgentInclude,
  BaseAgent,
  AgentWithIncludes,
  createAgentInclude,
} from '@/types/organization';
import { AgentFormData } from '@/schemas/user';
import { processFileData } from './utils';
import { sendAdminWelcomeEmail } from '@/emails/actions/email';
import { env } from '@/lib/env';

export async function getOrganizations(): Promise<OrganizationListingItem[]> {
  await checkAuth([UserRole.SUPER_ADMIN]);

  return db.organization.findMany({
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
          connect: data.countryIds.map((id) => ({ id })),
        },
      },
    });

    // Créer l'utilisateur admin si email fourni
    if (data.adminEmail) {
      await db.user.create({
        data: {
          email: data.adminEmail,
          roles: [UserRole.ADMIN],
          managedOrganization: {
            connect: { id: organization.id },
          },
        },
      });

      await sendAdminWelcomeEmail({
        adminEmail: data.adminEmail,
        adminName: 'Admin',
        organizationName: data.name,
        dashboardUrl: `${env.NEXT_PUBLIC_URL}/dashboard`,
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
  await checkAuth([
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.AGENT,
    UserRole.MANAGER,
  ]);

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
>(id: string, includes: T[]): Promise<OrganizationWithIncludes<T>> {
  await checkAuth();
  const organization = await db.organization.findUnique({
    where: { id },
    ...createOrganizationInclude(includes),
  });

  if (!organization) {
    throw new Error('messages.error.not_found', { cause: 'ORGANIZATION_NOT_FOUND' });
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

export async function createNewAgent(data: AgentFormData) {
  try {
    await checkAuth([UserRole.SUPER_ADMIN, UserRole.ADMIN]);

    const { countryIds, phone, serviceCategories, ...rest } = data;

    // Créer le téléphone d'abord si nécessaire
    let phoneId: string | undefined;

    if (phone) {
      const newPhone = await db.phone.create({
        data: {
          number: phone.number,
          countryCode: phone.countryCode,
        },
      });
      phoneId = newPhone.id;
    }

    const agent = await db.user.create({
      data: {
        ...rest,
        roles: [UserRole.AGENT],
        specializations: serviceCategories,
        linkedCountries: {
          connect: countryIds.map((id) => ({ id })),
        },
        ...(phoneId && { phoneId }),
      },
      include: BaseAgentInclude.include,
    });

    return { data: agent };
  } catch (error) {
    console.error('Failed to create agent:', error);
    return { error: 'Failed to create agent' };
  }
}

export async function updateAgent(id: string, data: Partial<AgentFormData>) {
  try {
    await checkAuth([UserRole.SUPER_ADMIN, UserRole.ADMIN]);

    const { countryIds, phone, ...rest } = data;

    let phoneId: string | undefined;

    if (phone) {
      const newPhone = await db.phone.create({
        data: {
          number: phone.number,
          countryCode: phone.countryCode,
        },
      });
      phoneId = newPhone.id;
    }

    const agent = await db.user.update({
      where: { id },
      data: {
        ...rest,
        ...(countryIds && {
          linkedCountries: {
            set: countryIds.map((id) => ({ id })),
          },
        }),
        ...(phoneId && { phoneId }),
      },
    });

    revalidatePath(ROUTES.sa.organizations);
    return { data: agent };
  } catch (error) {
    console.error('Failed to update agent:', error);
    return { error: 'Failed to update agent' };
  }
}

export async function getOrganizationAgents(id: string): Promise<{
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
  logoFile?: FormData,
) {
  await checkAuth([UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN]);

  try {
    let logoUrl = data.logo;
    if (logoFile) {
      const uploadResult = await processFileData(logoFile);
      if (uploadResult?.url) {
        logoUrl = uploadResult.url;
      }
    }

    const { countryIds, metadata, ...rest } = data;

    const organization = await db.organization.update({
      where: { id: organizationId },
      data: {
        ...rest,
        ...(metadata && { metadata: JSON.stringify(metadata) }),
        ...(logoUrl && { logo: logoUrl }),
        ...(countryIds && {
          countries: {
            connect: countryIds.map((id) => ({ id })),
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
  ) as Record<Country['code'], OrganizationMetadataSettings>;

  // @ts-expect-error - TODO: fix this (JsonValue is not typed)
  return {
    ...rest,
    ...formattedMetadata[countryCode],
  };
}
