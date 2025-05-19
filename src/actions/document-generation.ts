'use server';

import { db } from '@/lib/prisma';
import { checkAuth } from '@/lib/auth/action';
import { DocumentTemplate } from '@prisma/client';
import { InputJsonValue } from '@prisma/client/runtime/library';

export async function getDocumentTemplates(organizationId: string) {
  // Check for admin, super_admin, or manager role
  await checkAuth(['ADMIN', 'SUPER_ADMIN', 'MANAGER']);

  return db.documentTemplate.findMany({
    where: {
      organizationId,
    },
  });
}

export async function getDocumentTemplateById(
  id: string,
  organizationId: string,
): Promise<DocumentTemplate | null> {
  try {
    return db.documentTemplate.findUnique({
      where: {
        id,
        organizationId,
      },
    });
  } catch (error) {
    console.error('Error fetching document template:', error);
    return null;
  }
}

export async function createDocumentTemplate(data: DocumentTemplate) {
  await checkAuth(['ADMIN', 'SUPER_ADMIN', 'MANAGER']);

  return db.documentTemplate.create({
    data: {
      ...data,
      content: JSON.stringify(data.content),
      metadata: JSON.stringify(data.metadata),
    },
  });
}

export async function deleteDocumentTemplate(id: string) {
  await checkAuth(['ADMIN', 'SUPER_ADMIN', 'MANAGER']);

  return db.documentTemplate.delete({
    where: { id },
  });
}
