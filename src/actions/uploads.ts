'use server';

import { UTApi } from 'uploadthing/server';

const utapi = new UTApi();

export async function uploadFiles(fd: FormData) {
  try {
    const files = fd.getAll('files') as File[];
    if (!files || files.length === 0) {
      throw new Error('No files provided');
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

export async function deleteFiles(keys: string[]) {
  try {
    await Promise.all(keys.map((key) => utapi.deleteFiles(key)));
  } catch (error) {
    console.error('Delete error:', error);
    throw new Error('Error deleting files');
  }
}
