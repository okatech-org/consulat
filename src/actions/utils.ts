'use server';

import { AuthRedirectManager } from '@/lib/auth/redirect-utils';
import { tryCatch } from '@/lib/utils';
import { auth } from '@/server/auth';
import { UTApi } from 'uploadthing/server';
import { headers } from 'next/headers';

const utapi = new UTApi({
  token: process.env.UPLOADTHING_TOKEN,
});

export async function processFileData(
  formData: FormData | undefined,
  existingKey?: string,
) {
  if (!formData) return null;

  try {
    const files = formData.getAll('files');
    if (!files || files.length === 0) return null;

    if (existingKey) {
      const result = await tryCatch(utapi.deleteFiles(existingKey));

      if (result.error) {
        console.error('Error deleting existing file:', result.error);
      }
    }

    // Upload du nouveau fichier
    const file = files[0] as File;
    const response = await utapi.uploadFiles(file);

    if (!response?.data) {
      throw new Error('Upload failed');
    }

    return {
      key: response.data.key,
      url: response.data.ufsUrl,
    };
  } catch (error) {
    console.error('File processing error:', error);
    throw new Error(error instanceof Error ? error.message : 'Error uploading file');
  }
}

// Fonction pour uploader plusieurs fichiers
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

// Fonction pour supprimer des fichiers
export async function deleteFiles(keys: string[]) {
  try {
    await Promise.all(keys.map((key) => utapi.deleteFiles(key)));
  } catch (error) {
    console.error('Error deleting files:', error);
    throw new Error('Error deleting files');
  }
}

export async function deleteFile(fileUrl: string) {
  const fileKey = fileUrl.split('/').pop();
  if (fileKey) {
    await utapi.deleteFiles(fileKey);
  }
}
