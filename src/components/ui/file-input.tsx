import { useState, useEffect } from 'react';
import { UploadDropzone } from './uploadthing';
import { ClientUploadedFileData } from 'uploadthing/types';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { buttonVariants } from './button';
import Image from 'next/image';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Eye } from 'lucide-react';
import { Button } from './button';
import { DialogTitle } from '@radix-ui/react-dialog';

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
  loading?: boolean;
  fileUrl?: string;
  showPreview?: boolean;
  previewSize?: { width: number; height: number };
};

const FileInput = ({
  onChange,
  className,
  loading,
  accept = 'image/*,application/pdf',
  fileUrl,
  showPreview = true,
  previewSize = { width: 400, height: 600 },
}: FileInputProps) => {
  const t = useTranslations('inputs');
  const [uploading, setUploading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(fileUrl || null);

  const acceptedFileTypes: Array<'image' | 'pdf'> = [];

  if (accept.includes('image/*')) {
    acceptedFileTypes.push('image');
  }

  if (accept.includes('application/pdf')) {
    acceptedFileTypes.push('pdf');
  }

  const truncateFileName = (fileName: string, maxLength = 20) => {
    if (fileName.length <= maxLength) return fileName;

    const extension = fileName.split('.').pop() || '';
    const nameWithoutExtension = fileName.substring(0, fileName.lastIndexOf('.'));

    if (nameWithoutExtension.length <= maxLength - extension.length - 3) {
      return fileName;
    }

    return `${nameWithoutExtension.substring(0, maxLength - extension.length - 3)}...${extension ? `.${extension}` : ''}`;
  };

  useEffect(() => {
    if (fileUrl) {
      setPreview(fileUrl);
    } else {
      setPreview(null);
      setCurrentFile(null);
      setSelectedFiles([]);
    }
  }, [fileUrl]);

  const isPdf = preview && preview.endsWith('.pdf');
  const isImage = preview && !isPdf;

  if (preview && showPreview) {
    return (
      <div className="relative aspect-16/9 rounded-md min-h-full w-auto overflow-hidden !p-0">
        {isImage ? (
          <div className="flex relative aspect-document rounded-md min-h-full max-h-full w-auto overflow-hidden !p-0">
            {showPreview && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="min-h-full min-w-full absolute hover:bg-transparent inset-0 flex top-1/2 translate-y-[-50%]"
                onClick={() => setIsPreviewOpen(true)}
              >
                <Eye className="size-4" />
              </Button>
            )}
            <Image
              src={preview}
              alt="Preview"
              width={previewSize.width}
              height={previewSize.height}
              className="size-full object-cover"
            />
          </div>
        ) : (
          <div className="flex relative aspect-document h-full max-h-[150px] w-auto items-center justify-center rounded-md bg-muted !p-0">
            {showPreview && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="min-h-full min-w-full absolute hover:bg-transparent inset-0 flex top-1/2 translate-y-[-50%]"
                onClick={() => setIsPreviewOpen(true)}
              >
                <Eye className="size-4" />
              </Button>
            )}
            <div className="flex flex-col items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-10 h-10 mb-2 text-primary/60"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
              <span className="text-sm text-gray-600">Document</span>
            </div>
          </div>
        )}

        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className={cn('max-w-screen-lg', 'max-h-[90vh]')}>
            <DialogTitle className="sr-only">
              Voir le document : {truncateFileName(currentFile || '')}
            </DialogTitle>
            {isPdf ? (
              <iframe
                src={preview}
                className="w-full h-[80vh] rounded-lg"
                title="PDF Preview"
              />
            ) : (
              <div className="relative aspect-[3/4] w-full h-full overflow-hidden rounded-lg">
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <UploadDropzone
      className={cn(
        'cursor-pointer bg-primary/10 transition-all relative aspect-16/9 rounded-md min-h-full w-auto overflow-hidden !p-0',
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
        setUploadProgress(progress + (loading ? 10 : 0));
      }}
      onChange={(files) => {
        console.log('Files selected:', files);
        setSelectedFiles(files);
      }}
      onClientUploadComplete={(res) => {
        const file = res[0];
        setUploading(false);
        setUploadProgress(0);
        setCurrentFile(null);
        setSelectedFiles([]);

        if (file) {
          const fileUrl = file.serverData?.fileUrl || file.url;
          setPreview(fileUrl);
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
            'border-2 border-dashed rounded-md p-4',
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
                  {t('fileInput.uploading', {
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
                    {t('fileInput.uploadingFile', { fileName: currentFile })}
                  </span>
                )}
              </div>
            );
          }

          if (selectedFiles.length > 0 && selectedFiles[0]) {
            const fileName = selectedFiles[0].name;
            return (
              <div className="flex flex-col items-center">
                <span className="text-sm font-medium text-gray-700">
                  {t('fileInput.label')}
                </span>
                <div
                  className="mt-2 text-sm text-gray-600 flex items-center justify-center"
                  title={fileName}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                    />
                  </svg>
                  <span className="truncate max-w-[200px]">
                    {truncateFileName(fileName)}
                  </span>
                </div>
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
          if (isUploading || selectedFiles.length > 0) return null;
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
        button: ({ isUploading }) => {
          if (isUploading) return null;

          const buttonText =
            selectedFiles.length > 0 ? t('fileInput.start') : t('fileInput.button');

          return (
            <span
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'w-full bg-transparent',
              )}
            >
              {buttonText}
            </span>
          );
        },
        uploadIcon: ({ isUploading }) => {
          if (isUploading || selectedFiles.length > 0) return null;
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
