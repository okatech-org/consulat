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
  type PrismaClient,
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
  type FullAgent,
  type AgentWithIncludes,
  createAgentInclude,
} from '@/types/organization';
import { createClerkClient } from '@clerk/nextjs/server';

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

// Helper function to validate environment variables
function validateClerkEnvironment(): string {
  const clerkSecretKey = process.env.CLERK_SECRET_KEY;
  if (!clerkSecretKey) {
    throw new Error('CLERK_SECRET_KEY environment variable is required');
  }
  return clerkSecretKey;
}

// Helper function to create Clerk user
async function createClerkUser(
  firstName: string,
  lastName: string,
  email?: string,
  phoneNumber?: string,
  roles?: UserRole[],
  agentId?: string,
  assignedOrganizationId?: string,
  managedByUserId?: string,
  managedAgentIds?: string[],
) {
  const clerkSecretKey = validateClerkEnvironment();
  const clerkClient = createClerkClient({ secretKey: clerkSecretKey });

  const clerkUser = await clerkClient.users.createUser({
    firstName,
    lastName,
    emailAddress: email ? [email] : undefined,
    phoneNumber: phoneNumber ? [phoneNumber] : undefined,
  });

  await clerkClient.users.updateUserMetadata(clerkUser.id, {
    publicMetadata: {
      userId: agentId,
      roles,
      assignedOrganizationId,
      managedByUserId,
      managedAgentIds,
    },
  });

  return clerkUser;
}

// Helper function to send welcome notification
async function sendAgentWelcomeNotification(
  agent: FullAgent,
  currentUser: User,
  serviceIds: string[],
) {
  const baseUrl = env.NEXT_PUBLIC_URL;
  const t = await getTranslations('agent.notifications');

  const organizationName = agent.assignedOrganization?.name ?? 'N/A';

  await notify({
    userId: agent.id,
    type: 'FEEDBACK',
    title: t('welcome.title'),
    message: t('welcome.message', {
      organization: organizationName,
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
      createdBy: currentUser.id,
      createdByName: currentUser.name?.trim() || '',
      assignedServices: serviceIds,
      organization: organizationName,
    },
  });
}

// Helper function to assign agents to manager
async function assignAgentsToManager(
  tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>,
  managerId: string,
  agentIds: string[]
) {
  if (agentIds.length === 0) return;

  await tx.user.updateMany({
    where: {
      id: { in: agentIds },
    },
    data: {
      managedByUserId: managerId,
    },
  });
}

// Helper function to cleanup Clerk user if needed
async function cleanupClerkUser(clerkUserId: string) {
  try {
    const clerkSecretKey = validateClerkEnvironment();
    const clerkClient = createClerkClient({ secretKey: clerkSecretKey });
    await clerkClient.users.deleteUser(clerkUserId);
  } catch (error) {
    console.error('Failed to cleanup Clerk user:', error);
  }
}

export async function createNewAgent(data: AgentFormData): Promise<FullAgent> {
  // Validate required data
  if (!data.firstName?.trim() || !data.lastName?.trim()) {
    throw new Error('First name and last name are required');
  }

  if (!data.email?.trim() && !data.phoneNumber?.trim()) {
    throw new Error('Either email or phone number is required');
  }

  const { user: currentUser } = await checkAuth([UserRole.SUPER_ADMIN, UserRole.ADMIN]);

  if (!currentUser?.id) {
    throw new Error('Current user not found');
  }

  const {
    countryIds,
    serviceIds,
    firstName,
    lastName,
    roles,
    managedByUserId,
    managedAgentIds,
    ...rest
  } = data;

  const finalRoles = roles ?? [UserRole.AGENT];
  let agent: FullAgent | undefined;
  let clerkUser: { id: string } | null = null;

  try {
    // Start database transaction
    agent = await db.$transaction(async (tx) => {
      // Create the agent in database
      const newAgent = await tx.user.create({
        data: {
          ...rest,
          name: `${firstName.trim()} ${lastName.trim()}`,
          roles: finalRoles,
          ...(managedByUserId && { managedByUserId }),
          linkedCountries: {
            connect: countryIds.map((id) => ({ id })),
          },
          ...(serviceIds.length > 0 && {
            assignedServices: {
              connect: serviceIds.map((id) => ({ id })),
            },
          }),
        },
        ...FullAgentInclude,
      });

      // If creating a manager, assign the agents to them
      if (
        finalRoles.includes(UserRole.MANAGER) &&
        managedAgentIds &&
        managedAgentIds.length > 0
      ) {
        await assignAgentsToManager(tx, newAgent.id, managedAgentIds);
      }

      return newAgent;
    });

    // Create Clerk user (outside transaction to allow rollback)
    try {
      const createdClerkUser = await createClerkUser(
        firstName,
        lastName,
        data.email,
        data.phoneNumber,
        finalRoles,
        agent.id,
        agent.assignedOrganizationId || undefined,
        managedByUserId,
        managedAgentIds,
      );
      clerkUser = { id: createdClerkUser.id };

      // Update agent with Clerk ID
      await db.user.update({
        where: { id: agent.id },
        data: { clerkId: createdClerkUser.id },
      });

      // Refresh agent data to include clerkId
      const updatedAgent = await db.user.findUnique({
        where: { id: agent.id },
        ...FullAgentInclude,
      });

      if (!updatedAgent) {
        throw new Error('Failed to retrieve updated agent');
      }

      agent = updatedAgent;

    } catch (clerkError) {
      // Rollback database changes if Clerk operations fail
      if (agent?.id) {
        await db.user.delete({ where: { id: agent.id } });
      }
      throw new Error(`Failed to create Clerk user: ${clerkError instanceof Error ? clerkError.message : 'Unknown error'}`);
    }

    // Send welcome notification (non-critical, don't fail if this errors)
    try {
      await sendAgentWelcomeNotification(agent, currentUser as User, serviceIds);
    } catch (notificationError) {
      console.error('Failed to send welcome notification:', notificationError);
      // Continue execution - notification failure shouldn't break agent creation
    }

    if (!agent) {
      throw new Error('Agent creation failed');
    }

    return agent;

  } catch (error) {
    // Cleanup Clerk user if it was created but database operations failed
    if (clerkUser) {
      try {
        await cleanupClerkUser((clerkUser as { id: string }).id);
      } catch (cleanupError) {
        console.error('Failed to cleanup Clerk user:', cleanupError);
      }
    }

    // Cleanup database agent if it was created
    if (agent) {
      try {
        await db.user.delete({ where: { id: agent.id } });
      } catch (deleteError) {
        console.error('Failed to cleanup agent:', deleteError);
      }
    }

    console.error('Failed to create agent:', error);
    throw new Error(`Failed to create agent: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
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
