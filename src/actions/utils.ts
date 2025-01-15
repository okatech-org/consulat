"use server";

import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export async function processFileData(
  formData: FormData | undefined,
  existingKey?: string
) {
  if (!formData) return null;

  try {
    const files = formData.getAll('files');
    if (!files || files.length === 0) return null;

    // Suppression du fichier existant si nécessaire
    if (existingKey) {
      try {
        await utapi.deleteFiles(existingKey);
      } catch (error) {
        console.error('Error deleting existing file:', error);
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
      url: response.data.url
    };

  } catch (error) {
    console.error('File processing error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Error uploading file'
    );
  }
}

// Fonction pour uploader plusieurs fichiers
export async function uploadFiles(
  fd: FormData,
) {
  try {
    const files = fd.getAll('files') as File[];
    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }

    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const response = await utapi.uploadFiles(file);
        return response?.data;
      })
    );

    return uploadedFiles.filter(Boolean);
  } catch (error) {
    console.error('Upload error:', error);
    throw error instanceof Error ? error : new Error('Failed to upload files');
  }
}

// Fonction pour supprimer des fichiers
export async function deleteFiles(
  keys: string[],
) {
  try {
    await Promise.all(keys.map(key => utapi.deleteFiles(key)));
  } catch (error) {
    throw new Error('Error deleting files');
  }
}