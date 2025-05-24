'use client';

import { deleteFile } from '@/actions/utils';
import { uploadFileFromClient } from '@/components/ui/uploadthing';
import { tryCatch } from '@/lib/utils';
import { useState } from 'react';

export function useFile() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleFileUpload(file: File) {
    setIsLoading(true);
    const uploadResult = await tryCatch(uploadFileFromClient(file));
    if (uploadResult.data[0]) {
      setIsLoading(false);
      return uploadResult.data[0].ufsUrl;
    }
  }

  async function handleFileDelete(fileUrl: string) {
    setIsLoading(true);
    const fileKey = fileUrl.split('/').pop();
    if (fileKey) {
      await tryCatch(deleteFile(fileUrl));
    }
    setIsLoading(false);
  }

  return {
    isLoading,
    handleFileUpload,
    handleFileDelete,
  };
}
