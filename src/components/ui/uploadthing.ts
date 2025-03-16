import {
  generateUploadButton,
  generateUploadDropzone,
  generateReactHelpers,
} from '@uploadthing/react';

import type { OurFileRouter } from '@/app/api/uploadthing/core';

export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();
export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>();

export type FileUploadResponse = Awaited<ReturnType<typeof uploadFiles>>[number];

export const uploadFileFromClient = async (file: File) => {
  const fileType = file.type;

  if (fileType.startsWith('image/')) {
    console.log('Uploading image');
    return uploadFiles('imageUploader', { files: [file] });
  } else if (fileType.startsWith('application/pdf')) {
    console.log('Uploading pdf');
    return uploadFiles('pdfUploader', { files: [file] });
  } else {
    throw new Error('Unsupported file type');
  }
};
