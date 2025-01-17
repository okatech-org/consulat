"use server"

import { db } from '@/lib/prisma'
import { checkAuth } from '@/lib/auth/action'
import { UserRole } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { ROUTES } from '@/schemas/routes'
import { CreateServiceSchema } from '@/schemas/consular-service'
import type { CreateServiceInput, UpdateServiceInput } from '@/types/consular-service'

/**
 * Récupérer tous les services
 */
export async function getServices() {
  const authResult = await checkAuth([UserRole.SUPER_ADMIN])
  if (authResult.error) return { error: authResult.error }

  try {
    const services = await db.consularService.findMany({
      include: {
        steps: {
          orderBy: {
            order: 'asc'
          }
        },
        organization: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            requests: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return { data: services }
  } catch (error) {
    console.error('Error fetching services:', error)
    return { error: 'Failed to fetch services' }
  }
}

/**
 * Créer un nouveau service
 */

export async function createService(data: CreateServiceInput) {
  const authResult = await checkAuth([UserRole.SUPER_ADMIN])
  if (authResult.error) return { error: authResult.error }

  try {
    const validatedData = await CreateServiceSchema.parseAsync(data)

    const { steps, organizationId, ...serviceData } = validatedData
    // Créer le service avec ses étapes
    const service = await db.consularService.create({
      data: {
        ...serviceData,
        organization: organizationId ? {
          connect: { id: organizationId }
        } : undefined,
        steps: {
          create: steps.map((step, index) => ({
            order: index,
            title: step.title,
            description: step.description,
            type: step.type,
            isRequired: step.isRequired,
            fields: step.fields ? JSON.stringify(step.fields) : '',
            validations: step.validations ? JSON.stringify(step.validations) : '',
          }))
        }
      },
      include: {
        steps: true,
        organization: true
      }
    })

    revalidatePath(ROUTES.superadmin.services)
    return { data: service }
  } catch (error) {
    console.error('Error creating service:', error)
    return { error: 'Failed to create service' }
  }
}

/**
 * Mettre à jour un service
 */
export async function updateService(serviceId, data: UpdateServiceInput) {
  const authResult = await checkAuth([UserRole.SUPER_ADMIN])
  if (authResult.error) return { error: authResult.error }

  try {
    // Mise à jour du service et de ses étapes
    const service = await db.$transaction(async (tx) => {
      // Supprimer les étapes existantes si de nouvelles sont fournies
      if (data.steps) {
        await tx.serviceStep.deleteMany({
          where: { serviceId: serviceId }
        })
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { steps, organisationId, organization, ...serviceData } = data

      // Mettre à jour le service
      return tx.consularService.update({
        where: { id: serviceId },
        data: {
          ...serviceData,
          steps: steps ? {
            create: steps.map((step, index) => ({
              ...step,
              order: index,
              fields: step.fields ? JSON.stringify(step.fields) : '',
              validations: step.validations ? JSON.stringify(step.validations) : '',
            }))
          } : undefined
        },
        include: {
          steps: {
            orderBy: {
              order: 'asc'
            }
          }
        }
      })
    })

    revalidatePath(ROUTES.superadmin.services)
    return { data: service }
  } catch (error) {
    console.error('Error updating service:', error)
    return { error: 'Failed to update service' }
  }
}

export async function updateServiceStatus(id: string, isActive: boolean) {
  const authResult = await checkAuth([UserRole.SUPER_ADMIN])
  if (authResult.error) return { error: authResult.error }

  try {
    const service = await db.consularService.update({
      where: { id },
      data: {
        isActive
      }
    })

    revalidatePath(ROUTES.superadmin.services)
    return { data: service }
  } catch (error) {
    console.error('Error updating service status:', error)
    return { error: 'Failed to update service status' }
  }
}

/**
 * Supprimer un service
 */
export async function deleteService(id: string) {
  const authResult = await checkAuth([UserRole.SUPER_ADMIN])
  if (authResult.error) return { error: authResult.error }

  try {
    // Vérifier si le service a des demandes en cours
    const service = await db.consularService.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            requests: true
          }
        }
      }
    })

    if (!service) {
      return { error: 'Service not found' }
    }

    if (service._count.requests > 0) {
      return { error: 'Cannot delete service with existing requests' }
    }

    await db.consularService.delete({
      where: { id }
    })

    revalidatePath(ROUTES.superadmin.services)
    return { success: true }
  } catch (error) {
    console.error('Error deleting service:', error)
    return { error: 'Failed to delete service' }
  }
}

/**
 * Assigner un service à une organisation
 */
export async function assignServiceToOrganization(serviceId: string, organizationId: string) {
  const authResult = await checkAuth([UserRole.SUPER_ADMIN])
  if (authResult.error) return { error: authResult.error }

  try {
    await db.organization.update({
      where: { id: organizationId },
      data: {
        services: {
          connect: { id: serviceId }
        }
      }
    })

    revalidatePath(ROUTES.superadmin.services)
    return { success: true }
  } catch (error) {
    console.error('Error assigning service:', error)
    return { error: 'Failed to assign service' }
  }
}

/**
 * Désassigner un service d'une organisation
 */
export async function unassignServiceFromOrganization(serviceId: string, organizationId: string) {
  const authResult = await checkAuth([UserRole.SUPER_ADMIN])
  if (authResult.error) return { error: authResult.error }

  try {
    await db.organization.update({
      where: { id: organizationId },
      data: {
        services: {
          disconnect: { id: serviceId }
        }
      }
    })

    revalidatePath(ROUTES.superadmin.services)
    return { success: true }
  } catch (error) {
    console.error('Error unassigning service:', error)
    return { error: 'Failed to unassign service' }
  }
}

/**
 * Récupérer un service par son ID
 */
export async function getService(id: string) {
  const authResult = await checkAuth([UserRole.SUPER_ADMIN])
  if (authResult.error) return { error: authResult.error }

  try {
    const service = await db.consularService.findUnique({
      where: { id },
      include: {
        steps: {
          orderBy: {
            order: 'asc'
          }
        },
        organization: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!service) {
      return { error: 'Service not found' }
    }

    return { data: service }
  } catch (error) {
    console.error('Error fetching service:', error)
    return { error: 'Failed to fetch service' }
  }
}