"use server";

import { db } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { OrganizationSettingsFormData } from '@/schemas/organization'
import { checkAuth } from '@/lib/auth/action'
import { UserRole } from '@prisma/client'
import { processFileData } from '@/actions/utils'
import { ROUTES } from '@/schemas/routes'

export async function getOrganizationFromUser(userId: string) {
  return db.organization.findFirst({
    where: {
      userId
    },
    include: {
      User: true,
      countries: true
    }
  })
}

export async function updateOrganizationSettings(
  organizationId: string,
  data: OrganizationSettingsFormData,
  logoFile?: FormData
) {
  const authResult = await checkAuth([UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN])
  if (authResult.error) return { error: authResult.error }

  try {
    let logoUrl = data.logo
    if (logoFile) {
      const uploadResult = await processFileData(logoFile)
      if (uploadResult?.url) {
        logoUrl = uploadResult.url
      }
    }

    // Mettre à jour l'organisation
    const organization = await db.organization.update({
      where: { id: organizationId },
      data: {
        name: data.name,
        logo: logoUrl,
        metadata: data.metadata,
        updatedAt: new Date()
      }
    })

    revalidatePath(ROUTES.manager.settings)
    return { data: organization }
  } catch (error) {
    console.error('Error updating organization settings:', error)
    return { error: 'Failed to update organization settings' }
  }
}