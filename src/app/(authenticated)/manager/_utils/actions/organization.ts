"use server";

import { db } from '@/lib/prisma'

export async function getOrganizationFromUser(userId: string) {
  const organization = await db.organization.findFirst({
    where: {
      userId
    },
    include: {
      User: true,
      countries: true
    }
  })

  return organization
}