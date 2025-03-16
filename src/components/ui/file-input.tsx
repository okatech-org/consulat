import { useState } from 'react';
import { UploadDropzone } from './uploadthing';
import { ClientUploadedFileData } from 'uploadthing/types';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

type FileUploadResponse = ClientUploadedFileData<{
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  userId: string;
}>;

type FileInputProps = {
  onChange: (result: FileUploadResponse) => void;
  accept?: string;
  className?: string;
};

const FileInput = ({
  onChange,
  className,
  accept = 'image/*,application/pdf',
}: FileInputProps) => {
  const t = useTranslations('inputs');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState<string | null>(null);

  const acceptedFileTypes: Array<'image' | 'pdf'> = [];

  if (accept.includes('image/*')) {
    acceptedFileTypes.push('image');
  }

  if (accept.includes('application/pdf')) {
    acceptedFileTypes.push('pdf');
  }

  return (
    <UploadDropzone
      className={cn(
        'cursor-pointer bg-primary/10 transition-all',
        uploading ? 'bg-primary/5' : 'bg-primary/10',
        className,
      )}
      endpoint={accept === 'image/*' ? 'imageUploader' : 'documentUploader'}
      onUploadBegin={(fileName) => {
        setUploading(true);
        setCurrentFile(fileName);
        setUploadProgress(0);
      }}
      onUploadProgress={(progress) => {
        setUploadProgress(progress);
      }}
      onChange={(files) => {
        console.log('Files selected:', files);
      }}
      onClientUploadComplete={(res) => {
        const file = res[0];
        setUploading(false);
        setUploadProgress(0);
        setCurrentFile(null);

        if (file) {
          onChange(file as FileUploadResponse);
        }
      }}
      onUploadError={(error) => {
        console.error('Upload error:', error);
        setUploading(false);
        setUploadProgress(0);
        setCurrentFile(null);
      }}
      appearance={{
        container: ({ isUploading }) =>
          cn(
            'border-2 border-dashed rounded-md p-8',
            isUploading
              ? 'border-primary/30'
              : 'border-primary/50 hover:border-primary/80',
          ),
        label: ({ isUploading }) =>
          cn('text-sm font-medium', isUploading ? 'text-gray-500' : 'text-gray-700'),
        allowedContent: ({ isUploading }) =>
          cn('text-xs mt-1', isUploading ? 'text-gray-400' : 'text-gray-500'),
        button: {
          container:
            'bg-primary hover:bg-primary/90 text-white rounded-md mt-2 transition-all',
        },
        uploadIcon: ({ isUploading }) =>
          cn(
            'w-12 h-12 mx-auto mb-4',
            isUploading ? 'text-primary/30' : 'text-primary/60',
          ),
      }}
      content={{
        label: ({ isUploading, uploadProgress }) => {
          if (isUploading) {
            return (
              <div className="flex flex-col items-center">
                <span className="text-sm font-medium text-gray-700">
                  {t.rich('fileInput.uploading', {
                    progress: Math.round(uploadProgress),
                  })}
                </span>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div
                    className="bg-primary h-2.5 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                {currentFile && (
                  <span className="text-xs text-gray-500 mt-1">
                    {t.rich('fileInput.uploadingFile', { fileName: currentFile })}
                  </span>
                )}
              </div>
            );
          }
          return (
            <span className="text-sm font-medium text-gray-700">
              {t('fileInput.label')}
            </span>
          );
        },
        allowedContent: ({ isUploading }) => {
          if (isUploading) return null;
          return (
            <span className="text-xs font-medium text-gray-500">
              {t('fileInput.acceptedFileTypes', {
                acceptedFileTypes: acceptedFileTypes
                  .map((type) => t(`fileInput.${type}`))
                  .join(', '),
              })}
            </span>
          );
        },
        button: ({ isUploading, ready }) => {
          if (isUploading) return null;
          return (
            <span className="px-3 py-2 text-sm inline-block">
              {ready ? t('fileInput.button') : t('fileInput.uploading')}
            </span>
          );
        },
        uploadIcon: ({ isUploading }) => {
          if (isUploading) return null;
          return (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-10 h-10 mx-auto text-primary/60"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
          );
        },
      }}
    />
  );
};

FileInput.displayName = 'FileInput';

export { FileInput, type FileUploadResponse };
