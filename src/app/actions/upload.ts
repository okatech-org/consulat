'use server';

import { S3Service } from '@/lib/services/s3';
import { revalidatePath } from 'next/cache';

/**
 * Upload a file using a FormData object
 */
export async function uploadFile(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    if (!file) {
      throw new Error('No file provided');
    }

    // Generate a unique file name
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to S3
    const result = await S3Service.uploadFile(buffer, fileName);

    revalidatePath('/'); // Adjust the path as needed

    return { success: true, file: result };
  } catch (error) {
    console.error('Error in uploadFile:', error);
    return { success: false, error: 'Failed to upload file' };
  }
}

/**
 * Delete a file using its key
 */
export async function deleteFile(key: string) {
  try {
    await S3Service.deleteFile(key);
    revalidatePath('/'); // Adjust the path as needed
    return { success: true };
  } catch (error) {
    console.error('Error in deleteFile:', error);
    return { success: false, error: 'Failed to delete file' };
  }
}

/**
 * Generate a presigned URL for client-side upload
 */
export async function getUploadUrl(fileName: string) {
  try {
    const ext = fileName.split('.').pop();
    const key = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
    const url = await S3Service.generatePresignedUploadUrl(key);
    return { success: true, url, key };
  } catch (error) {
    console.error('Error in getUploadUrl:', error);
    return { success: false, error: 'Failed to generate upload URL' };
  }
}

/**
 * List files in a directory
 */
export async function listFiles(prefix?: string) {
  try {
    const files = await S3Service.listFiles(prefix);
    return { success: true, files };
  } catch (error) {
    console.error('Error in listFiles:', error);
    return { success: false, error: 'Failed to list files' };
  }
}
