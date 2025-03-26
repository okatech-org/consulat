'use server';

import { checkAuth } from '@/lib/auth/action';
import { UTApi } from 'uploadthing/server';

const utapi = new UTApi({
  token: process.env.UPLOADTHING_SECRET,
  apiUrl: 'api/uploadthing',
});

export async function uploadFiles(fd: FormData) {
  try {
    const files = fd.getAll('files') as File[];
    if (!files || files.length === 0) {
      throw new Error('messages.errors.doc_required');
    }

    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const response = await utapi.uploadFiles(file);
        return response?.data;
      }),
    );

    return uploadedFiles.filter(Boolean);
  } catch (error) {
    console.error('Upload error:', error);
    throw error instanceof Error ? error : new Error('Failed to upload files');
  }
}

export const uploadFileFromServer = async (fd: FormData) => {
  const user = await checkAuth();

  if (!user) {
    throw new Error('messages.errors.unauthorized');
  }

  const files = fd.getAll('files') as File[];
  if (!files || files.length === 0) {
    throw new Error('messages.errors.doc_required');
  }

  const uploadedFiles = await Promise.all(
    files.map(async (file) => {
      const response = await utapi.uploadFiles(file);
      return response?.data;
    }),
  );

  return {
    ...uploadedFiles.filter(Boolean)[0],
    userId: user.user.id,
  };
};

export async function deleteFiles(keys: string[]) {
  console.log('deleteFiles', keys);
  try {
    await utapi.deleteFiles(keys);
  } catch (error) {
    console.error('Delete error:', error);
    return {
      success: false,
      error: 'messages.errors.delete_file_failed',
    };
  }
}
