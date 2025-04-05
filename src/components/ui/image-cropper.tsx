'use client';

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
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
import { RotateCcw } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface Area {
  width: number;
  height: number;
  x: number;
  y: number;
}

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
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onCropChange = useCallback((newCrop: Point) => {
    setCrop(newCrop);
  }, []);

  const onZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  const onRotationChange = useCallback((rotation: number) => {
    setRotation(rotation);
  }, []);

  const handleRotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  const onCropCompleteCallback = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  const createCroppedImage = useCallback(async () => {
    if (!croppedAreaPixels) return;

    try {
      setIsLoading(true);
      const croppedImage = await getCroppedImg(
        imageUrl,
        croppedAreaPixels,
        rotation,
        circularCrop,
        fileName,
      );
      if (croppedImage) {
        onCropComplete(croppedImage);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [croppedAreaPixels, imageUrl, rotation, circularCrop, onCropComplete, fileName]);

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>
        <div className="relative h-[300px] w-full">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspectRatio}
            onCropChange={onCropChange}
            onCropComplete={onCropCompleteCallback}
            onZoomChange={onZoomChange}
            onRotationChange={onRotationChange}
            cropShape={circularCrop ? 'round' : 'rect'}
            showGrid={!circularCrop}
          />
        </div>
        <div className="mt-4 space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('zoom')}</label>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRotate}
                type="button"
                className="h-8 w-8 p-0"
              >
                <RotateCcw className="h-4 w-4" />
                <span className="sr-only">Rotate</span>
              </Button>
            </div>
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.1}
              onValueChange={(values) => {
                if (values[0] !== undefined) {
                  setZoom(values[0]);
                }
              }}
              className="mt-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Rotation</label>
            <Slider
              value={[rotation]}
              min={0}
              max={360}
              step={1}
              onValueChange={(values) => {
                if (values[0] !== undefined) {
                  setRotation(values[0]);
                }
              }}
              className="mt-2"
            />
          </div>
        </div>
        <DialogFooter className="scape-y-4">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            {t('cancel')}
          </Button>
          <Button onClick={createCroppedImage} disabled={isLoading}>
            {isLoading ? t('processing') : t('apply')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Function to create the cropped image with improved rotation handling
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
  circularCrop = false,
  fileName?: string,
): Promise<File | null> {
  try {
    const image = await createImage(imageSrc);

    // Create a canvas that can hold the complete rotated image
    const maxSize = Math.max(image.width, image.height);
    const rotationCanvas = document.createElement('canvas');
    const rotationSize = maxSize * 2;
    rotationCanvas.width = rotationSize;
    rotationCanvas.height = rotationSize;

    const rotationCtx = rotationCanvas.getContext('2d');
    if (!rotationCtx) {
      return null;
    }

    // Clear canvas with transparent background
    rotationCtx.clearRect(0, 0, rotationSize, rotationSize);

    // Move to center of canvas to rotate and then draw the image
    const centerX = rotationSize / 2;
    const centerY = rotationSize / 2;

    // Save the canvas state, rotate from center
    rotationCtx.save();
    rotationCtx.translate(centerX, centerY);
    rotationCtx.rotate((rotation * Math.PI) / 180);
    rotationCtx.translate(-image.width / 2, -image.height / 2);

    // Draw the original image
    rotationCtx.drawImage(image, 0, 0);
    rotationCtx.restore();

    // Create a canvas for the final cropped image
    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = pixelCrop.width;
    croppedCanvas.height = pixelCrop.height;

    const croppedCtx = croppedCanvas.getContext('2d');
    if (!croppedCtx) {
      return null;
    }

    // Calculate the correct position of the crop area on the rotated image
    const cropX = centerX - image.width / 2 + pixelCrop.x;
    const cropY = centerY - image.height / 2 + pixelCrop.y;

    // Draw the cropped image from the rotated canvas
    croppedCtx.drawImage(
      rotationCanvas,
      cropX,
      cropY,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height,
    );

    // Apply circular mask if needed
    if (circularCrop) {
      croppedCtx.globalCompositeOperation = 'destination-in';
      croppedCtx.beginPath();
      croppedCtx.arc(
        pixelCrop.width / 2,
        pixelCrop.height / 2,
        Math.min(pixelCrop.width, pixelCrop.height) / 2,
        0,
        2 * Math.PI,
        true,
      );
      croppedCtx.fill();
    }

    // Import pica for high-quality resizing
    const pica = await import('pica').then((module) => new module.default());

    // Create final output canvas
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = pixelCrop.width;
    outputCanvas.height = pixelCrop.height;

    // Use pica for high-quality resizing
    const result = await pica.resize(croppedCanvas, outputCanvas, {
      quality: 3,
      alpha: true,
    });

    // Convert the canvas to a blob and then to a File
    return new Promise((resolve) => {
      result.toBlob(
        (blob: Blob | null) => {
          if (!blob) {
            resolve(null);
            return;
          }

          // Create a File from the Blob
          const outputFileName = fileName ? `${fileName}.png` : 'cropped-image.png';
          const file = new File([blob], outputFileName, { type: 'image/png' });
          resolve(file);
        },
        'image/png',
        0.85, // Compression quality for better file size
      );
    });
  } catch (error) {
    console.error('Error processing image:', error);
    return null;
  }
}

// Helper function to create an image from a URL
function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
    image.setAttribute('crossOrigin', 'anonymous'); // Needed for CORS
  });
}
