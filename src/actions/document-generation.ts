'use server';

import { db } from '@/server/db';
import { checkAuth } from '@/lib/auth/action';
import { type DocumentTemplate } from '@prisma/client';

export async function getDocumentTemplates(organizationId: string | null) {
  // Check for admin, super_admin, or manager role
  await checkAuth(['ADMIN', 'SUPER_ADMIN', 'MANAGER']);

  return db.documentTemplate.findMany({
    where: {
      ...(organizationId && { organizationId }),
    },
  });
}

export async function getDocumentTemplateById(
  id: string,
): Promise<DocumentTemplate | null> {
  try {
    return db.documentTemplate.findUnique({
      where: {
        id,
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

export async function updateDocumentTemplate(
  id: string,
  data: Partial<DocumentTemplate>,
) {
  await checkAuth(['ADMIN', 'SUPER_ADMIN', 'MANAGER']);

  return db.documentTemplate.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.description && { description: data.description }),
      ...(data.type && { type: data.type }),
      ...(data.content && { content: JSON.stringify(data.content) }),
      ...(data.metadata && { metadata: JSON.stringify(data.metadata) }),
    },
  });
}
