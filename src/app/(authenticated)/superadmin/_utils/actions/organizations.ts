'use server';

import { db } from '@/lib/prisma';
import { checkAuth } from '@/lib/auth/action';
import { revalidatePath } from 'next/cache';
import { ROUTES } from '@/schemas/routes';
import { CreateOrganizationInput, UpdateOrganizationInput } from '@/schemas/organization';
import { OrganizationStatus, UserRole } from '@prisma/client';

export async function getOrganizations() {
  const authResult = await checkAuth([UserRole.SUPER_ADMIN]);
  if (authResult.error) return { error: authResult.error };

  try {
    const organizations = await db.organization.findMany({
      include: {
        countries: true,
        _count: {
          select: {
            services: true,
          },
        },
        User: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { data: organizations };
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return { error: 'messages.error.fetch' };
  }
}

export async function createOrganization(data: CreateOrganizationInput) {
  try {
    const authResult = await checkAuth([UserRole.SUPER_ADMIN]);
    if (authResult.error) {
      return { error: authResult.error };
    }

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
          role: UserRole.ADMIN,
          managedOrganizations: {
            connect: { id: organization.id },
          },
        },
      });
    }

    revalidatePath(ROUTES.superadmin.organizations);
    return { data: organization };
  } catch (error) {
    console.error('Failed to create organization:', error);
    return { error: 'Failed to create organization' };
  }
}

export async function updateOrganization(id: string, data: UpdateOrganizationInput) {
  try {
    const authResult = await checkAuth([UserRole.SUPER_ADMIN]);
    if (authResult.error) {
      return { error: authResult.error };
    }

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

    revalidatePath(ROUTES.superadmin.organizations);
    return { data: organization };
  } catch (error) {
    console.error('Failed to update organization:', error);
    return { error: 'Failed to update organization' };
  }
}

export async function updateOrganizationStatus(id: string, status: OrganizationStatus) {
  try {
    const authResult = await checkAuth([UserRole.SUPER_ADMIN]);
    if (authResult.error) {
      return { error: authResult.error };
    }

    const organization = await db.organization.update({
      where: { id },
      data: { status },
    });

    revalidatePath(ROUTES.superadmin.organizations);
    return { data: organization };
  } catch (error) {
    console.error('Failed to update organization status:', error);
    return { error: 'Failed to update organization status' };
  }
}

export async function deleteOrganization(id: string) {
  const authResult = await checkAuth([UserRole.SUPER_ADMIN]);
  if (authResult.error) return { error: authResult.error };

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

    revalidatePath(ROUTES.superadmin.organizations);
    return { success: true };
  } catch (error) {
    console.error('Error deleting organization:', error);
    return { error: 'messages.error.delete' };
  }
}
