'use server'

import { db } from '@/lib/prisma'
import { ActionResult, checkAuth } from '@/lib/auth/action'
import { UserRole } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { ROUTES } from '@/schemas/routes'
import { Country, CountryMetadata, CreateCountryInput } from '@/types/country'
import { CountrySchemaInput } from '@/schemas/country'

export async function getCountries() {
  const authResult = await checkAuth([UserRole.SUPER_ADMIN])
  if (authResult.error) return { error: authResult.error }

  try {
    const countries = await db.country.findMany({
      include: {
        _count: {
          select: {
            organizations: true,
            users: true
          }
        }
      }
    })

    console.log('countries:', countries)

    return { data: countries.map(item => ({
      ...item,
        metadata: item.metadata ? JSON.parse(item.metadata as string) : {} as CountryMetadata
      })) }
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

export async function updateCountry(data: CountrySchemaInput) {
  const { id, metadata, ...rest } = data

  if (!id) return { error: 'Country ID is required' }

  const authResult = await checkAuth([UserRole.SUPER_ADMIN])
  if (authResult.error) return { error: authResult.error }



  try {
    const country = await db.country.update({
      where: { id },
      data: {
        ...rest,
        ...(metadata && { metadata: JSON.stringify(metadata) })
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

export async function getCountryById(id: string): Promise<ActionResult<Country>> {
  const authResult = await checkAuth([UserRole.SUPER_ADMIN]);
  if (authResult.error) return { error: authResult.error };

  try {
    const country = await db.country.findUnique({
      where: { id },
      include: { _count: { select: { organizations: true, users: true } } },
    });

    if (!country) {
      return { error: 'Country not found' };
    }

    return { data: { ...country, metadata: country.metadata ? JSON.parse(country.metadata as string) : {} } };
  } catch (error) {
    console.error('Error fetching country:', error);
    return { error: 'Failed to fetch country' };
  }
}
