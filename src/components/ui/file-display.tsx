'use client';

import * as React from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Download,
  Eye,
  FileText,
  Image as ImageIcon,
  MoreVertical,
  Trash2,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatFileSize, getDocumentIcon } from '@/lib/documents';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface FileDisplayProps {
  storageId: Id<'_storage'>;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  showActions?: boolean;
  showPreview?: boolean;
  className?: string;
  onDelete?: () => void;
  variant?: 'card' | 'list' | 'compact';
}

export function FileDisplay({
  storageId,
  fileName,
  fileType,
  fileSize,
  showActions = true,
  showPreview = true,
  className = '',
  onDelete,
  variant = 'card',
}: FileDisplayProps) {
  const t = useTranslations('common.files');

  // Récupérer les informations du fichier
  const fileInfo = useQuery(api.storage.getFileMetadata, { storageId });
  const fileUrl = useQuery(api.storage.getFileUrl, { storageId });

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
  const displayName = fileName || `File ${storageId.slice(0, 8)}`;
  const displaySize = fileSize ? formatFileSize(fileSize) : '';

  // Gestionnaire de téléchargement
  const handleDownload = async () => {
    if (!fileUrl) {
      toast.error(t('errors.download_failed'));
      return;
    }

    try {
      const response = await fetch(fileUrl);
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
      toast.error(t('errors.download_failed'));
    }
  };

  // Gestionnaire de suppression
  const handleDelete = async () => {
    if (!onDelete) return;

    try {
      onDelete();
      toast.success(t('success.deleted'));
    } catch (error) {
      toast.error(t('errors.delete_failed'));
    }
  };

  // Composant d'aperçu pour les images
  const ImagePreview = () => {
    if (!fileUrl || fileTypeInfo.type !== 'image') return null;

    return (
      <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
        <Image
          src={fileUrl}
          alt={displayName}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
    );
  };

  // Composant d'aperçu pour les PDFs
  const PdfPreview = () => {
    if (!fileUrl || fileTypeInfo.type !== 'pdf') return null;

    return (
      <div className="flex items-center justify-center w-full h-32 bg-red-50 border-2 border-red-200 rounded-lg">
        <div className="text-center">
          <FileText className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-red-600 font-medium">PDF Document</p>
          <p className="text-xs text-red-500">{displaySize}</p>
        </div>
      </div>
    );
  };

  // Composant d'aperçu générique
  const GenericPreview = () => {
    if (fileTypeInfo.type === 'image' || fileTypeInfo.type === 'pdf') return null;

    return (
      <div className="flex items-center justify-center w-full h-32 bg-gray-50 border-2 border-gray-200 rounded-lg">
        <div className="text-center">
          <FileText className="w-8 h-8 text-gray-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600 font-medium">
            {fileTypeInfo.type.toUpperCase()} File
          </p>
          <p className="text-xs text-gray-500">{displaySize}</p>
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
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {fileUrl && (
            <>
              <DropdownMenuItem onClick={() => window.open(fileUrl, '_blank')}>
                <ExternalLink className="mr-2 h-4 w-4" />
                {t('actions.open')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                {t('actions.download')}
              </DropdownMenuItem>
            </>
          )}
          {onDelete && (
            <DropdownMenuItem onClick={handleDelete} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              {t('actions.delete')}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // Composant de statut
  const FileStatus = () => {
    if (!fileInfo) {
      return (
        <Badge variant="secondary" className="ml-2">
          <AlertCircle className="w-3 h-3 mr-1" />
          Loading...
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="ml-2">
        {fileTypeInfo.type}
      </Badge>
    );
  };

  // Rendu selon le variant
  if (variant === 'compact') {
    return (
      <div className={`flex items-center space-x-2 p-2 rounded-lg border ${className}`}>
        <div className="flex-shrink-0">
          <fileTypeInfo.icon className="w-4 h-4 text-gray-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
          {displaySize && <p className="text-xs text-gray-500">{displaySize}</p>}
        </div>
        <FileStatus />
        <FileActions />
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={`flex items-center space-x-4 p-4 rounded-lg border ${className}`}>
        <div className="flex-shrink-0">
          <fileTypeInfo.icon className="w-8 h-8 text-gray-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
          <div className="flex items-center space-x-2 mt-1">
            <p className="text-xs text-gray-500">{displaySize}</p>
            <FileStatus />
          </div>
        </div>
        <FileActions />
      </div>
    );
  }

  // Variant par défaut : card
  return (
    <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
      {/* Aperçu du fichier */}
      <div className="p-4">
        {showPreview && (
          <div className="mb-4">
            <ImagePreview />
            <PdfPreview />
            <GenericPreview />
          </div>
        )}

        {/* Informations du fichier */}
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
              {displaySize && <p className="text-xs text-gray-500">{displaySize}</p>}
            </div>
            <FileActions />
          </div>

          <div className="flex items-center justify-between">
            <FileStatus />
            {fileType && (
              <Badge variant="outline" className="text-xs">
                {fileType}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant pour afficher une liste de fichiers
interface FileListProps {
  storageIds: Id<'_storage'>[];
  showActions?: boolean;
  variant?: 'card' | 'list' | 'compact';
  className?: string;
  onDeleteFile?: (storageId: Id<'_storage'>) => void;
}

export function FileList({
  storageIds,
  showActions = true,
  variant = 'list',
  className = '',
  onDeleteFile,
}: FileListProps) {
  if (storageIds.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No files to display</p>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {storageIds.map((storageId) => (
        <FileDisplay
          key={storageId}
          storageId={storageId}
          variant={variant}
          showActions={showActions}
          onDelete={onDeleteFile ? () => onDeleteFile(storageId) : undefined}
        />
      ))}
    </div>
  );
}

// Composant pour prévisualiser un fichier dans un modal
interface FilePreviewProps {
  storageId: Id<'_storage'>;
  trigger: React.ReactNode;
  fileName?: string;
  fileType?: string;
}

export function FilePreview({
  storageId,
  trigger,
  fileName,
  fileType,
}: FilePreviewProps) {
  const t = useTranslations('common.files');
  const fileUrl = useQuery(api.storage.getFileUrl, { storageId });

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
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{fileName || t('preview.title')}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {fileUrl && fileTypeInfo.type === 'image' && (
            <div className="relative w-full h-96">
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
              className="w-full h-96 border rounded-lg"
              title={fileName || 'PDF preview'}
            />
          )}

          {(!fileUrl || fileTypeInfo.type === 'file') && (
            <div className="flex items-center justify-center h-96 bg-gray-50 border rounded-lg">
              <div className="text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
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

// Hook personnalisé pour gérer les fichiers
export function useFileOperations() {
  const generateUploadUrl = useQuery(api.storage.generateUploadUrl);
  const uploadFile = useQuery(api.storage.uploadAndCreateDocument);
  const deleteFile = useQuery(api.storage.deleteFile);

  return {
    generateUploadUrl,
    uploadFile,
    deleteFile,
  };
}
