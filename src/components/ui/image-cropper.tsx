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
import Slider from '@/components/ui/slider';
import { ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

interface ImageCropperProps {
  imageUrl: string | File;
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
  circularCrop = true, // Force circular crop
  onCropComplete,
  onCancel,
  open,
  fileName = 'cropped-image',
  guide,
}: ImageCropperProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState({ x: 0.5, y: 0.5 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const editorRef = useRef<AvatarEditor | null>(null);

  // Calculate editor dimensions based on aspect ratio, forcing 1:1 for circular crop
  const getEditorDimensions = useCallback(() => {
    const baseSize = 500;
    return { width: baseSize, height: baseSize }; // Always square for circular crop
  }, []);

  const { width, height } = getEditorDimensions();

  const handlePositionChange = useCallback((position: { x: number; y: number }) => {
    setPosition(position);
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleRotationChange = useCallback((value: number) => {
    setRotation(value);
  }, []);

  const handleCropComplete = useCallback(async () => {
    if (!editorRef.current || !imageLoaded) return;

    try {
      setIsLoading(true);

      // For highest quality, we'll use the original image size when possible
      // This helps avoid the blurry output
      const canvas = editorRef.current.getImage();

      // Apply circular mask
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Create a circular mask
      ctx.globalCompositeOperation = 'destination-in';
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, Math.PI * 2);
      ctx.fill();

      // Convert to file with high quality setting
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/png', 1.0);
      });

      if (!blob) {
        throw new Error('Failed to create image blob');
      }

      // Create a file
      const outputFileName = `${fileName}.png`;
      const file = new File([blob], outputFileName, { type: 'image/png' });

      // Call the callback with the cropped image
      onCropComplete(file);
    } catch (error) {
      console.error('Error creating cropped image:', error);
    } finally {
      setIsLoading(false);
    }
  }, [onCropComplete, fileName, imageLoaded]);

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Recadrer l&apos;image</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-center p-2 bg-gray-50 dark:bg-gray-900 rounded-md">
            <AvatarEditor
              ref={editorRef}
              image={imageUrl}
              width={width}
              height={height}
              border={50}
              position={position}
              borderRadius={999}
              color={[0, 0, 0, 0.6]} // Background color
              scale={scale}
              rotate={rotation}
              style={{ width: '100%', height: 'auto' }}
              crossOrigin="anonymous"
              onPositionChange={handlePositionChange}
              onLoadSuccess={handleImageLoad}
              onImageReady={handleImageLoad}
              disableHiDPIScaling={false}
              disableBoundaryChecks={true}
            />
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Agrandir l&apos;image</label>
              </div>
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

            <div className="space-y-2">
              <Slider
                value={[rotation]}
                min={-180}
                max={180}
                step={5}
                onValueChange={(values) => {
                  if (values[0] !== undefined) {
                    handleRotationChange(values[0]);
                  }
                }}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>-180°</span>
                <span>0°</span>
                <span>180°</span>
              </div>
            </div>
          </div>
        </div>

        {guide && <div className="w-full mt-4">{guide}</div>}

        <DialogFooter className="flex flex-col gap-2 mt-4">
          <div className="flex flex-row justify-between w-full">
            <div>
              <Button
                variant="outline"
                onClick={() => {
                  setScale(1);
                  setRotation(0);
                }}
                disabled={isLoading}
              >
                Réinitialiser
              </Button>
            </div>
            <div className="flex flex-col-reverse gap-4 md:flex-row md:justify-end">
              <Button variant="outline" onClick={onCancel} disabled={isLoading}>
                Annuler
              </Button>
              <Button onClick={handleCropComplete} disabled={isLoading || !imageLoaded}>
                {isLoading ? 'Traitement en cours...' : 'Valider'}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
