'use server'

import { db } from '@/lib/prisma'
import { checkAuth } from '@/lib/auth/action'
import { UserRole } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { ROUTES } from '@/schemas/routes'
import { CreateCountryInput, UpdateCountryInput } from '@/types/country'

export async function getCountries() {
  const authResult = await checkAuth([UserRole.SUPER_ADMIN])
  if (authResult.error) return { error: authResult.error }

  try {
    const countries = await db.country.findMany({
      include: {
        _count: {
          select: {
            consulates: true,
            users: true
          }
        }
      }
    })

    return { data: countries }
  } catch (error) {
    console.error('Error fetching countries:', error)
    return { error: 'Failed to fetch countries' }
  }
}

export async function createCountry(data: CreateCountryInput) {
  const authResult = await checkAuth([UserRole.SUPER_ADMIN])
  if (authResult.error) return { error: authResult.error }

  try {
    const country = await db.country.create({
      data: {
        name: data.name,
        code: data.code.toUpperCase(),
        status: data.status || 'ACTIVE'
      }
    })

    revalidatePath(ROUTES.superadmin.countries)
    return { data: country }
  } catch (error) {
    console.error('Error creating country:', error)
    return { error: 'Failed to create country' }
  }
}

export async function updateCountry(data: UpdateCountryInput) {
  const authResult = await checkAuth([UserRole.SUPER_ADMIN])
  if (authResult.error) return { error: authResult.error }

  try {
    const country = await db.country.update({
      where: { id: data.id },
      data: {
        name: data.name,
        code: data.code?.toUpperCase(),
        status: data.status
      }
    })

    revalidatePath(ROUTES.superadmin.countries)
    return { data: country }
  } catch (error) {
    console.error('Error updating country:', error)
    return { error: 'Failed to update country' }
  }
}

export async function deleteCountry(id: string) {
  const authResult = await checkAuth([UserRole.SUPER_ADMIN])
  if (authResult.error) return { error: authResult.error }

  try {
    await db.country.delete({
      where: { id }
    })

    revalidatePath(ROUTES.superadmin.countries)
    return { success: true }
  } catch (error) {
    console.error('Error deleting country:', error)
    return { error: 'Failed to delete country' }
  }
}