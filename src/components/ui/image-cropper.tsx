'use client';

import React, { useState, useRef, useCallback, ReactNode } from 'react';
import AvatarEditor from 'react-avatar-editor';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useTranslations } from 'next-intl';
import Slider from '@/components/ui/slider';

interface ImageCropperProps {
  imageUrl: string;
  aspectRatio?: number;
  circularCrop?: boolean;
  onCropComplete: (croppedImage: File) => void;
  onCancel: () => void;
  open: boolean;
  fileName?: string;
  guide?: ReactNode;
}

export function ImageCropper({
  imageUrl,
  aspectRatio = 1,
  circularCrop = true,
  onCropComplete,
  onCancel,
  open,
  fileName,
  guide,
}: ImageCropperProps) {
  const t = useTranslations('common.cropper');
  const [scale, setScale] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const editorRef = useRef<AvatarEditor | null>(null);

  // Dans votre composant ImageCropper
  const handleCropComplete = useCallback(async () => {
    if (!editorRef.current) return;

    try {
      setIsLoading(true);

      // Étape 1: Créer une image à partir de l'URL
      const img = new Image();
      img.crossOrigin = 'anonymous';

      // Attendre que l'image soit chargée
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });

      // Étape 2: Dessiner l'image sur un canvas
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Dessiner l'image d'origine
      ctx.drawImage(img, 0, 0);

      // Étape 3: Utiliser les données de l'éditeur pour recadrer
      const editor = editorRef.current;
      const position = editor.getCroppingRect();

      // Créer un nouveau canvas pour l'image recadrée
      const croppedCanvas = document.createElement('canvas');
      const cropSize = Math.min(img.width, img.height);
      croppedCanvas.width = cropSize;
      croppedCanvas.height = cropSize;
      const croppedCtx = croppedCanvas.getContext('2d');

      if (!croppedCtx) {
        throw new Error('Could not get cropped canvas context');
      }

      // Dessiner la partie recadrée
      croppedCtx.drawImage(
        canvas,
        position.x * img.width,
        position.y * img.height,
        position.width * img.width,
        position.height * img.height,
        0,
        0,
        cropSize,
        cropSize,
      );

      // Si recadrage circulaire demandé
      if (circularCrop) {
        croppedCtx.globalCompositeOperation = 'destination-in';
        croppedCtx.beginPath();
        croppedCtx.arc(cropSize / 2, cropSize / 2, cropSize / 2, 0, Math.PI * 2);
        croppedCtx.fill();
      }

      // Convertir en fichier
      const blob = await new Promise<Blob | null>((resolve) => {
        croppedCanvas.toBlob((blob) => resolve(blob), 'image/png', 0.95);
      });

      if (!blob) {
        throw new Error('Failed to create image blob');
      }

      // Créer un fichier
      const outputFileName = fileName ? `${fileName}.png` : 'cropped-image.png';
      const file = new File([blob], outputFileName, { type: 'image/png' });

      // Appeler le callback avec l'image recadrée
      onCropComplete(file);
    } catch (error) {
      console.error('Error creating cropped image:', error);
    } finally {
      setIsLoading(false);
    }
  }, [onCropComplete, fileName, circularCrop, imageUrl]);

  // Calculate editor dimensions based on aspect ratio
  const getEditorDimensions = useCallback(() => {
    const baseSize = 250; // Base size for the editor

    if (aspectRatio === 1) {
      return { width: baseSize, height: baseSize };
    } else if (aspectRatio > 1) {
      // Landscape orientation
      return { width: baseSize, height: baseSize / aspectRatio };
    } else {
      // Portrait orientation
      return { width: baseSize * aspectRatio, height: baseSize };
    }
  }, [aspectRatio]);

  const { width, height } = getEditorDimensions();

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>

        <div className="flex justify-center">
          <AvatarEditor
            ref={editorRef}
            image={imageUrl}
            width={width}
            height={height}
            border={50}
            borderRadius={circularCrop ? Math.min(width, height) / 2 : 0}
            color={[0, 0, 0, 0.6]} // Background color behind the cropped image
            scale={scale}
            rotate={0}
            crossOrigin="anonymous"
          />
        </div>

        <div className="space-y-4 mb-2">
          <label className="text-sm font-medium mb-2">Agrandir l&apos;image</label>
          <Slider
            value={[scale]}
            min={1}
            max={3}
            step={0.1}
            onValueChange={(values) => {
              if (values[0] !== undefined) {
                setScale(values[0]);
              }
            }}
          />
        </div>

        <DialogFooter className="flex flex-col gap-2">
          {guide && <div>{guide}</div>}
          <div className="flex flex-col-reverse gap-4 md:flex-row md:justify-end">
            <Button variant="outline" onClick={onCancel} disabled={isLoading}>
              {t('cancel')}
            </Button>
            <Button onClick={handleCropComplete} disabled={isLoading}>
              {isLoading ? t('processing') : 'Valider'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
