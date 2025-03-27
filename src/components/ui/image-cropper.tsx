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
}

export function ImageCropper({
  imageUrl,
  aspectRatio = 1,
  circularCrop = true,
  onCropComplete,
  onCancel,
  open,
}: ImageCropperProps) {
  const t = useTranslations('common.cropper');
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onCropChange = useCallback((newCrop: Point) => {
    setCrop(newCrop);
  }, []);

  const onZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
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
      const croppedImage = await getCroppedImg(imageUrl, croppedAreaPixels, circularCrop);
      if (croppedImage) {
        onCropComplete(croppedImage);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [croppedAreaPixels, imageUrl, circularCrop, onCropComplete]);

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
            aspect={aspectRatio}
            onCropChange={onCropChange}
            onCropComplete={onCropCompleteCallback}
            onZoomChange={onZoomChange}
            cropShape={circularCrop ? 'round' : 'rect'}
            showGrid={!circularCrop}
          />
        </div>
        <div className="mt-4">
          <label className="text-sm font-medium">{t('zoom')}</label>
          <Slider
            value={[zoom]}
            min={1}
            max={3}
            step={0.1}
            onValueChange={(zoom) => setZoom(zoom[0])}
            className="mt-2"
          />
        </div>
        <DialogFooter>
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

// Function to create the cropped image
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  circularCrop = false,
): Promise<File | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  // Set canvas dimensions to the cropped size
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Draw the cropped image onto the canvas
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  // If circular crop is enabled, apply a circular mask
  if (circularCrop) {
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    ctx.arc(
      pixelCrop.width / 2,
      pixelCrop.height / 2,
      Math.min(pixelCrop.width, pixelCrop.height) / 2,
      0,
      2 * Math.PI,
      true,
    );
    ctx.fill();
  }

  // Convert the canvas to a Blob and then to a File
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        resolve(null);
        return;
      }

      // Create a File from the Blob
      const file = new File([blob], 'cropped-image.png', { type: 'image/png' });
      resolve(file);
    }, 'image/png');
  });
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
