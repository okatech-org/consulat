import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from '@aws-sdk/lib-storage';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { env } from '../env/index';
import { tryCatch } from '../utils';

const BUCKET_NAME = env.S3_BUCKET_NAME;
const PUBLIC_DOMAIN = env.S3_PUBLIC_DOMAIN;

const s3Client = new S3Client({
  region: 'auto',
  endpoint: env.S3_ENDPOINT,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
});

export async function getDownloadUrl(key: string) {
  return getSignedUrl(
    s3Client,
    new GetObjectCommand({ Bucket: env.S3_BUCKET_NAME, Key: key }),
    {
      expiresIn: 3600,
    },
  );
}

export async function uploadFileToBucket(file: File, Key: string) {
  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: BUCKET_NAME,
      Key,
      Body: file.stream(),
      ContentType: file.type,
      ACL: 'public-read',
    },
    queueSize: 4,
    leavePartsOnError: false,
  });

  const result = await tryCatch(upload.done());

  if (result.error) {
    throw new Error('Failed to upload file');
  }

  return {
    url: `${PUBLIC_DOMAIN}/${Key}`,
  };
}
// Initialize S3 client for Cloudflare R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: env.S3_ENDPOINT,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
  // Required for Cloudflare R2
  forcePathStyle: true,
});

export type UploadedFile = {
  url: string;
  key: string;
  size: number;
};

export class S3Service {
  /**
   * Upload a file to S3
   * @param file - The file to upload
   * @param key - The key (path) where the file will be stored
   * @returns Promise<UploadedFile>
   */
  static async uploadFile(file: Buffer | Uint8Array, key: string): Promise<UploadedFile> {
    try {
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: file,
        ContentType: this.getContentType(key),
      });

      await s3Client.send(command);

      return {
        url: `${PUBLIC_DOMAIN}/${key}`,
        key,
        size: file.byteLength,
      };
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new Error('Failed to upload file');
    }
  }

  /**
   * Delete a file from S3
   * @param key - The key (path) of the file to delete
   */
  static async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      await s3Client.send(command);
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      throw new Error('Failed to delete file');
    }
  }

  /**
   * Generate a presigned URL for direct upload
   * @param key - The key (path) where the file will be stored
   * @param expiresIn - URL expiration time in seconds (default: 3600)
   */
  static async generatePresignedUploadUrl(
    key: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: this.getContentType(key),
      });

      return await getSignedUrl(s3Client, command, { expiresIn });
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      throw new Error('Failed to generate upload URL');
    }
  }

  /**
   * Generate a presigned URL for downloading/viewing a file
   * @param key - The key (path) of the file
   * @param expiresIn - URL expiration time in seconds (default: 3600)
   */
  static async generatePresignedDownloadUrl(
    key: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      return await getSignedUrl(s3Client, command, { expiresIn });
    } catch (error) {
      console.error('Error generating download URL:', error);
      throw new Error('Failed to generate download URL');
    }
  }

  /**
   * List files in a directory
   * @param prefix - The directory prefix to list files from
   * @param maxKeys - Maximum number of keys to return
   */
  static async listFiles(prefix: string = '', maxKeys: number = 1000) {
    try {
      const command = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: prefix,
        MaxKeys: maxKeys,
      });

      const response = await s3Client.send(command);
      return (
        response.Contents?.map((item) => ({
          key: item.Key!,
          size: item.Size!,
          lastModified: item.LastModified!,
          url: `${PUBLIC_DOMAIN}/${item.Key}`,
        })) || []
      );
    } catch (error) {
      console.error('Error listing files:', error);
      throw new Error('Failed to list files');
    }
  }

  /**
   * Get content type based on file extension
   */
  private static getContentType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const contentTypes: Record<string, string> = {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      webp: 'image/webp',
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      zip: 'application/zip',
      // Add more types as needed
    };

    return contentTypes[ext || ''] || 'application/octet-stream';
  }
}
