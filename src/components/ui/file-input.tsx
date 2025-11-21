'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Loader2, TrashIcon } from 'lucide-react';
import { Input } from './input';
import { DocumentPreview } from './document-preview';

export interface FileInputProps {
  onChangeAction: (file: File) => void;
  onDeleteAction?: () => void;
  accept?: string;
  loading?: boolean;
  disabled?: boolean;
  fileUrl?: string | null;
  fileType?: string | null;
  showPreview?: boolean;
  preview?: React.ReactNode;
  aspectRatio?: string;
  enableBackgroundRemoval?: boolean;
  onProcessedImageChange?: (processedUrl: string | null) => void;
}

export function FileInput({
  onChangeAction,
  onDeleteAction,
  accept = 'image/*,application/pdf',
  loading = false,
  disabled = false,
  fileUrl,
  fileType,
  showPreview = true,
  aspectRatio = '16/9',
  enableBackgroundRemoval = false,
  onProcessedImageChange,
}: FileInputProps) {
  const t = useTranslations('inputs.fileInput');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const isPdf = fileType?.includes('application/pdf') ?? false;

  const handleDownload = async () => {
    if (!fileUrl || !fileType) return;

    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      // Get file extension from content type
      const contentType = response.headers.get('content-type');
      const extension = contentType?.split('/')[1] || 'pdf';
      a.download = `${fileType?.toLowerCase()}.${extension}`;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const acceptedFileTypes: Array<'image' | 'pdf'> = [];

  if (accept.includes('image/*')) {
    acceptedFileTypes.push('image');
  }

  if (accept.includes('application/pdf')) {
    acceptedFileTypes.push('pdf');
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file) return;
    onChangeAction(file);
  };

  // Si nous avons une URL de fichier et que showPreview est vrai, afficher la prévisualisation
  if (fileUrl && showPreview && !loading) {
    return (
      <div
        className={cn(
          'relative flex flex-col border-dashed w-full p-4 h-[150px] rounded-md border bg-background',
          aspectRatio && `aspect-[${aspectRatio}]`,
        )}
      >
        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          className="w-full h-full flex items-center justify-center cursor-pointer overflow-hidden rounded-md"
        >
          {isPdf ? (
            <div className="flex flex-col items-center justify-center gap-2 p-4">
              <svg
                className="size-icon text-primary"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-center text-muted-foreground">
                {t('preview')}
              </span>
            </div>
          ) : (
            <div className="relative w-full h-full">
              <Image
                src={fileUrl}
                alt={t('label')}
                fill
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
          )}
        </button>

        <DocumentPreview
          url={fileUrl}
          title={t('label')}
          type={fileType?.includes('image') ? 'image' : 'pdf'}
          onDownload={handleDownload}
          isOpen={previewOpen}
          setIsOpenAction={setPreviewOpen}
          enableBackgroundRemoval={enableBackgroundRemoval}
          onProcessedImageChange={onProcessedImageChange}
        />

        {onDeleteAction && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteAction?.();
            }}
            className="absolute top-2 right-2"
          >
            <TrashIcon className="size-icon" />
          </Button>
        )}
      </div>
    );
  }

  // Sinon, afficher le champ d'upload
  return (
    <div
      className={cn(
        `flex flex-col items-center justify-start p-4 w-full h-[150px] aspect-[${aspectRatio}] rounded-md border border-dashed bg-muted/50 p-4`,
        'transition-all duration-300 ease-in-out',
        loading || disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
      )}
    >
      <div className="flex flex-col items-center justify-center w-full h-full text-center gap-2">
        {loading ? (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">{t('uploading')}</span>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center gap-1">
              <svg
                className="size-icon text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                ></path>
              </svg>
              <p className="text-xs text-muted-foreground">{t('label')}</p>
              <p className="text-xs text-muted-foreground">
                {t('acceptedFileTypes', {
                  acceptedFileTypes: acceptedFileTypes
                    .map((type) => t(`${type}`))
                    .join(', '),
                })}
              </p>
            </div>
            <Input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept={accept}
              onChange={handleFileChange}
              disabled={loading || disabled}
            />
            <Button
              type="button"
              variant="outline"
              className="bg-transparent border-dashed border-input text-xs"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading || disabled}
            >
              {t('button')}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
