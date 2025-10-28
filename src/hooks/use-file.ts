'use client';

import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { tryCatch } from '@/lib/utils';
import { useMutation } from 'convex/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';

export function useFile() {
  const t_errors = useTranslations('messages.errors');
  const [isLoading, setIsLoading] = useState(false);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const deleteFile = useMutation(api.storage.deleteFile);

  async function handleFileUpload(file: File) {
    setIsLoading(true);

    try {
      const uploadUrl = await generateUploadUrl();

      const result = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!result.ok) {
        throw new Error(`Upload failed: ${result.statusText}`);
      }

      const { storageId } = (await result.json()) as { storageId: string };

      return {
        storageId: storageId as Id<'_storage'>,
        url: uploadUrl,
        name: file.name,
        type: file.type,
        size: file.size,
      };
    } catch (error) {
      toast.error(
        t_errors(error instanceof Error ? error.message : "Erreur lors de l'upload"),
      );
      console.error(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  async function handleFileDelete(fileUrl: string) {
    setIsLoading(true);
    const fileKey = fileUrl.split('/').pop();
    if (fileKey) {
      await tryCatch(deleteFile({ storageId: fileKey as Id<'_storage'> }));
    }
    setIsLoading(false);
  }

  return {
    isLoading,
    handleFileUpload,
    handleFileDelete,
  };
}
