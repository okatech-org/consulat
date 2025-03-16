'use client';

import { useState, useCallback } from 'react';
import { uploadFile } from '@/app/actions/upload';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onUploadComplete?: (file: { url: string; key: string; size: number }) => void;
  onUploadError?: (error: string) => void;
  className?: string;
  accept?: string;
  maxSize?: number; // in bytes
}

export function FileUpload({
  onUploadComplete,
  onUploadError,
  className,
  accept,
  maxSize = 5 * 1024 * 1024, // 5MB default
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleUpload = useCallback(
    async (file: File) => {
      if (maxSize && file.size > maxSize) {
        onUploadError?.(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
        return;
      }

      try {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        const result = await uploadFile(formData);

        if (!result.success || !result.file) {
          throw new Error(result.error || 'Upload failed');
        }

        onUploadComplete?.(result.file);
      } catch (error) {
        console.error('Upload error:', error);
        onUploadError?.(error instanceof Error ? error.message : 'Upload failed');
      } finally {
        setIsUploading(false);
      }
    },
    [maxSize, onUploadComplete, onUploadError],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleUpload(e.dataTransfer.files[0]);
      }
    },
    [handleUpload],
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        handleUpload(e.target.files[0]);
      }
    },
    [handleUpload],
  );

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center w-full min-h-[200px] border-2 border-dashed rounded-lg transition-colors',
        dragActive ? 'border-primary bg-primary/5' : 'border-gray-300',
        className,
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleChange}
        accept={accept}
        disabled={isUploading}
      />

      <div className="flex flex-col items-center justify-center p-6 text-center">
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Uploading...</p>
          </div>
        ) : (
          <>
            <svg
              className="w-10 h-10 mb-3 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              {accept ? `${accept.replace(/,/g, ', ')} files` : 'Any file'} up to{' '}
              {maxSize / 1024 / 1024}MB
            </p>
          </>
        )}
      </div>
    </div>
  );
}
