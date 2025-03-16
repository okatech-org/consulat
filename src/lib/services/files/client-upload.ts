import { OurFileRouter } from '@/app/api/uploadthing/core';
import { genUploader } from 'uploadthing/client';

export const { uploadFiles } = genUploader<OurFileRouter>();

export const uploadFile = async (file: File) => {
  const response = await uploadFiles('documentUploader', {
    files: [file],
  });

  return response;
};
