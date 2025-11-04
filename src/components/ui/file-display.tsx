'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Download,
  FileText,
  Image as ImageIcon,
  MoreVertical,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { DocumentStatus } from '@/convex/lib/constants';

interface FileDisplayProps {
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  status?: DocumentStatus;
  showActions?: boolean;
  showPreview?: boolean;
  className?: string;
  onDelete?: () => void;
  variant?: 'card' | 'list' | 'compact' | 'document';
}

export function FileDisplay({
  fileUrl,
  fileName,
  fileType,
  status,
  showActions = true,
  showPreview = true,
  className = '',
  onDelete,
  variant = 'card',
}: FileDisplayProps) {
  const t = useTranslations('inputs.documentStatus');
  const t_common = useTranslations('common');

  // Déterminer le type de fichier pour l'affichage
  const getFileTypeInfo = () => {
    if (fileType) {
      if (fileType.startsWith('image/')) return { type: 'image', icon: ImageIcon };
      if (fileType.includes('pdf')) return { type: 'pdf', icon: FileText };
      if (fileType.includes('text/')) return { type: 'text', icon: FileText };
      if (fileType.includes('video/')) return { type: 'video', icon: FileText };
      if (fileType.includes('audio/')) return { type: 'audio', icon: FileText };
    }
    return { type: 'file', icon: FileText };
  };

  const fileTypeInfo = getFileTypeInfo();
  const displayName = fileName || `File ${fileUrl?.split('/').pop()?.slice(0, 8)}`;

  // Gestionnaire de téléchargement
  const handleDownload = async () => {
    if (!fileUrl) {
      toast.error(t('errors.download_failed'));
      return;
    }

    try {
      const response = await fetch(fileUrl!);
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = displayName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(t('success.downloaded'));
    } catch (error) {
      toast.error(t('errors.download_failed'), {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // Gestionnaire de suppression
  const handleDelete = async () => {
    if (!onDelete) return;

    try {
      onDelete();
      toast.success(t('success.deleted'));
    } catch (error) {
      toast.error(t('errors.delete_failed'), {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // Composant d'aperçu pour les images
  const ImagePreview = () => {
    if (!fileUrl || fileTypeInfo.type !== 'image') return null;

    return (
      <div className="relative w-full h-full bg-muted rounded-lg overflow-hidden">
        <FilePreview
          fileUrl={fileUrl}
          trigger={
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-full flex flex-col justify-center items-center gap-2 p-0 absolute top-0 right-0"
            >
              <Image
                src={fileUrl}
                alt={displayName}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </Button>
          }
          fileName={displayName}
          fileType={fileType}
        />
      </div>
    );
  };

  // Composant d'aperçu pour les PDFs
  const PdfPreview = () => {
    if (!fileUrl || fileTypeInfo.type !== 'pdf') return null;

    return (
      <div className="flex items-center relative justify-center w-full h-full bg-muted border border-border rounded-lg">
        <FilePreview
          fileUrl={fileUrl}
          trigger={
            <div className="relative w-full h-full">
              <iframe
                src={fileUrl + '#toolbar=0'}
                className="w-full h-full min-h-full border rounded-lg"
                title={fileName || 'Document PDF'}
                style={{ aspectRatio: '300/400' }}
              />
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-full flex flex-col justify-center items-center gap-2 p-0 absolute top-0 right-0"
              >
                <FileText className="w-8 h-8 text-muted-foreground mr-2" />
              </Button>
            </div>
          }
          fileName={displayName}
          fileType={fileType}
        />
      </div>
    );
  };

  // Composant d'aperçu générique
  const GenericPreview = () => {
    if (fileTypeInfo.type === 'image' || fileTypeInfo.type === 'pdf') return null;

    return (
      <div className="flex items-center justify-center w-full h-32 bg-muted border border-border rounded-lg">
        <div className="text-center">
          <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground font-medium">
            {fileTypeInfo.type.toUpperCase()} File
          </p>
        </div>
      </div>
    );
  };

  // Composant d'actions
  const FileActions = () => {
    if (!showActions) return null;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-1 border border-border rounded-full"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {fileUrl && (
            <>
              <DropdownMenuItem onClick={() => window.open(fileUrl, '_blank')}>
                <ExternalLink className="mr-2 h-4 w-4" />
                {t_common('actions.open')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                {t_common('actions.download')}
              </DropdownMenuItem>
            </>
          )}
          {onDelete && (
            <DropdownMenuItem onClick={handleDelete} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              {t_common('actions.delete')}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // Composant de statut
  const FileStatus = () => {
    return <Badge variant="outline">{t(`options.${status}`)}</Badge>;
  };

  // Rendu selon le variant
  if (variant === 'compact') {
    return (
      <div
        className={`flex items-center space-x-2 p-2 rounded-lg border bg-card ${className}`}
      >
        <div className="flex-shrink-0">
          <fileTypeInfo.icon className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-card-foreground truncate max-w-[150px]">
            {displayName}
          </p>
        </div>
        <FileStatus />
        <FileActions />
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div
        className={`flex items-center space-x-4 p-4 rounded-lg border bg-card ${className}`}
      >
        <div className="flex-shrink-0">
          <fileTypeInfo.icon className="w-8 h-8 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-card-foreground truncate max-w-[150px]">
            {displayName}
          </p>
          <div className="flex items-center space-x-2 mt-1">
            <FileStatus />
          </div>
        </div>
        <FileActions />
      </div>
    );
  }

  // Variant par défaut : card
  return (
    <div
      className={`bg-card text-card-foreground rounded-lg border shadow h-full ${className}`}
    >
      {/* Aperçu du fichier */}
      <div className="p-2 sm:p-4 h-full flex flex-col justify-between">
        {showPreview && (
          <div className="h-full mb-4">
            <ImagePreview />
            <PdfPreview />
            <GenericPreview />
          </div>
        )}

        {/* Informations du fichier */}
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <FileStatus />
            <FileActions />
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant pour prévisualiser un fichier dans un modal
interface FilePreviewProps {
  fileUrl: string;
  trigger: React.ReactNode;
  fileName?: string;
  fileType?: string;
}

export function FilePreview({ fileUrl, trigger, fileName, fileType }: FilePreviewProps) {
  const t = useTranslations('common.files');

  const getFileTypeInfo = () => {
    if (fileType) {
      if (fileType.startsWith('image/')) return { type: 'image' };
      if (fileType.includes('pdf')) return { type: 'pdf' };
    }
    return { type: 'file' };
  };

  const fileTypeInfo = getFileTypeInfo();

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl h-full max-h-[90vh]">
        <div className="flex-1 overflow-auto h-full">
          {fileUrl && fileTypeInfo.type === 'image' && (
            <div className="relative w-full h-full">
              <Image
                src={fileUrl}
                alt={fileName || 'File preview'}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          )}

          {fileUrl && fileTypeInfo.type === 'pdf' && (
            <iframe
              src={fileUrl}
              className="w-full min-h-full border rounded-lg"
              title={fileName || 'Document PDF'}
            />
          )}

          {(!fileUrl || fileTypeInfo.type === 'file') && (
            <div className="flex items-center justify-center h-96 bg-muted border border-border rounded-lg">
              <div className="text-center">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {fileUrl ? t('preview.unsupported') : t('preview.loading')}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
