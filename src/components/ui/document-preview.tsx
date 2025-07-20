'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Download, Eye, ZoomIn, ZoomOut, Scissors, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useBackgroundRemoval } from '@/hooks/use-background-removal';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { RoleGuard } from '@/lib/permissions/utils';

interface DocumentPreviewProps {
  isOpen: boolean;
  setIsOpenAction: (isOpen: boolean) => void;
  url: string;
  title: string;
  type: 'image' | 'pdf';
  onDownload?: () => void;
  onProcessedImageChange?: (processedUrl: string | null) => void;
  showTrigger?: boolean;
  enableBackgroundRemoval?: boolean;
}

export function DocumentPreview({
  url,
  title,
  onDownload,
  isOpen,
  type,
  setIsOpenAction,
  onProcessedImageChange,
  showTrigger = false,
  enableBackgroundRemoval = false,
}: DocumentPreviewProps) {
  const [zoom, setZoom] = useState(1);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const isMobile = useMediaQuery('(max-width: 640px)');

  const {
    isProcessing,
    processImageFromUrl,
    error: bgRemovalError,
    clearError,
  } = useBackgroundRemoval({
    onSuccess: (result) => {
      if (result.imageUrl) {
        // Nettoyer l'ancienne URL traitée si elle existe
        if (processedImageUrl) {
          URL.revokeObjectURL(processedImageUrl);
        }
        setProcessedImageUrl(result.imageUrl);
        // Notifier le parent du changement
        onProcessedImageChange?.(result.imageUrl);
      }
    },
    onError: (error) => {
      console.error('Erreur suppression arrière-plan:', error);
    },
  });

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));

  const handleBackgroundRemoval = async () => {
    if (type !== 'image') {
      toast.error("Cette fonctionnalité n'est pas disponible pour les fichiers PDF");
      return;
    }

    try {
      clearError();
      await processImageFromUrl(url);
    } catch (error) {
      console.error("Erreur lors de la suppression de l'arrière-plan:", error);
    }
  };

  const resetToOriginal = () => {
    if (processedImageUrl) {
      URL.revokeObjectURL(processedImageUrl);
    }
    setProcessedImageUrl(null);
    onProcessedImageChange?.(null);
  };

  // URL de l'image à afficher (traitée ou originale)
  const displayImageUrl = processedImageUrl || url;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpenAction}>
      {showTrigger && (
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => setIsOpenAction(true)}
            leftIcon={<Eye className="size-icon" />}
          />
        </SheetTrigger>
      )}
      <SheetContent side={isMobile ? 'bottom' : 'right'} className="!max-w-5xl">
        <div className="flex h-full flex-col gap-4 overflow-hidden">
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            {bgRemovalError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{bgRemovalError}</AlertDescription>
              </Alert>
            )}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={handleZoomOut}
                leftIcon={<ZoomOut className="size-icon" />}
              />
              <span className="text-sm">{Math.round(zoom * 100)}%</span>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={handleZoomIn}
                leftIcon={<ZoomIn className="size-icon" />}
              />
              {enableBackgroundRemoval && (
                <RoleGuard roles={['ADMIN', 'SUPER_ADMIN', 'MANAGER', 'AGENT']}>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={handleBackgroundRemoval}
                    disabled={isProcessing}
                    leftIcon={<Scissors className="size-icon" />}
                    title="Supprimer l'arrière-plan"
                  />
                  {processedImageUrl && (
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={resetToOriginal}
                      title="Revenir à l'image originale"
                    >
                      Original
                    </Button>
                  )}
                </RoleGuard>
              )}
              {onDownload && (
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={onDownload}
                  leftIcon={<Download className="size-icon" />}
                />
              )}
            </div>
          </SheetHeader>
          <div className="flex-1 overflow-auto">
            {type === 'pdf' ? (
              <iframe src={`${url}#toolbar=0`} className="size-full" title={title} />
            ) : (
              <div className="flex size-full items-center justify-center">
                <div
                  className={cn(
                    'relative transition-transform duration-200',
                    'max-h-full max-w-full',
                  )}
                  style={{ transform: `scale(${zoom})` }}
                >
                  <img
                    src={displayImageUrl}
                    alt={title}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
