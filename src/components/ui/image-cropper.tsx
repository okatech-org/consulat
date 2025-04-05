'use client';

import React, { useState, useRef, useCallback } from 'react';
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
import { RotateCcw, RotateCw } from 'lucide-react';

interface ImageCropperProps {
  imageUrl: string;
  aspectRatio?: number;
  circularCrop?: boolean;
  onCropComplete: (croppedImage: File) => void;
  onCancel: () => void;
  open: boolean;
  fileName?: string;
}

export function ImageCropper({
  imageUrl,
  aspectRatio = 1,
  circularCrop = true,
  onCropComplete,
  onCancel,
  open,
  fileName,
}: ImageCropperProps) {
  const t = useTranslations('common.cropper');
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const editorRef = useRef<AvatarEditor | null>(null);

  // Function to handle rotation to the left (counterclockwise)
  const handleRotateLeft = useCallback(() => {
    setRotation((prev) => {
      // Rotate 90 degrees counterclockwise
      return prev - 90;
    });
  }, []);

  // Function to handle rotation to the right (clockwise)
  const handleRotateRight = useCallback(() => {
    setRotation((prev) => {
      // Rotate 90 degrees clockwise
      return prev + 90;
    });
  }, []);

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

  // Normalize rotation value for AvatarEditor (which expects 0-359)
  const normalizeRotation = (value: number) => {
    // Convert negative values to positive equivalent in 0-359 range
    return ((value % 360) + 360) % 360;
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>

        <div className="flex justify-center py-4">
          <AvatarEditor
            ref={editorRef}
            image={imageUrl}
            width={width}
            height={height}
            border={50}
            borderRadius={circularCrop ? Math.min(width, height) / 2 : 0}
            color={[0, 0, 0, 0.6]} // Background color behind the cropped image
            scale={scale}
            rotate={normalizeRotation(rotation)}
            crossOrigin="anonymous"
          />
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-sm font-medium">Agrandir l&apos;image</label>
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
              className="mt-2"
            />
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse gap-4 md:flex-row md:justify-end">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            {t('cancel')}
          </Button>
          <Button onClick={handleCropComplete} disabled={isLoading}>
            {isLoading ? t('processing') : t('apply')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
