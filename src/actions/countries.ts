'use server';

import { db } from '@/lib/prisma';
import { checkAuth } from '@/lib/auth/action';
import { revalidatePath } from 'next/cache';
import { ROUTES } from '@/schemas/routes';
import { CountryMetadata } from '@/types/country';
import {Country, UserRole} from '@prisma/client';
import { CountrySchemaInput } from '@/schemas/country';

export type CountryWithCount = Country & {
  _count: {
    organizations: number;
    users: number;
  };
};

export async function getCountries(): Promise<CountryWithCount[]> {
  await checkAuth([UserRole.SUPER_ADMIN]);

  const countries = await db.country.findMany({
    include: {
      _count: {
        select: {
          organizations: true,
          users: true,
        },
      },
    },
  });

  return countries.map((item) => ({
    ...item,
    metadata: item.metadata
      ? JSON.parse(item.metadata as string)
      : ({} as CountryMetadata),
  }));
}

export async function getActiveCountries(): Promise<PrismaCountry[]> {
  return await db.country.findMany({
    where: { status: 'ACTIVE' },
  });
}

export async function createCountry(data: CountrySchemaInput): Promise<PrismaCountry> {
  await checkAuth([UserRole.SUPER_ADMIN]);

  const country = await db.country.create({
    data: {
      name: data.name,
      code: data.code.toUpperCase(),
      status: data.status || 'ACTIVE',
    },
  });

  revalidatePath(ROUTES.dashboard.countries);
  return country;
}

export async function updateCountry(data: CountrySchemaInput): Promise<PrismaCountry> {
  const { id, metadata, ...rest } = data;

  if (!id) throw new Error('Country ID is required', { cause: 'COUNTRY_ID_REQUIRED' });

  await checkAuth([UserRole.SUPER_ADMIN]);

  const country = await db.country.update({
    where: { id },
    data: {
      ...rest,
      ...(metadata && { metadata: JSON.stringify(metadata) }),
    },
  });

  revalidatePath(ROUTES.dashboard.countries);
  return country;
}

export async function deleteCountry(id: string) {
  await checkAuth([UserRole.SUPER_ADMIN]);

  await db.country.delete({
    where: { id },
  });

  revalidatePath(ROUTES.dashboard.countries);
  return true;
}

export async function getCountryById(id: string): Promise<Country> {
  const country = await db.country.findUnique({
    where: { id },
    include: { _count: { select: { organizations: true, users: true } } },
  });

  if (!country) {
    throw new Error('Country not found', { cause: 'COUNTRY_NOT_FOUND' });
  }

  return {
    ...country,
    metadata: country.metadata ? JSON.parse(country.metadata as string) : {},
  };
}
