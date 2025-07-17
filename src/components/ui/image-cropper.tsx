'use client';

import React, { useState, useRef, useCallback, ReactNode, TouchEvent } from 'react';
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

interface ImageCropperProps {
  imageUrl: string | File;
  onCropComplete: (croppedImage: File) => void;
  onCancel: () => void;
  open: boolean;
  fileName?: string;
  guide?: ReactNode;
}

export function ImageCropper({
  imageUrl,
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
  const touchStateRef = useRef({
    startDistance: 0,
    startAngle: 0,
    initialScale: 1,
    initialRotation: 0,
    isInteracting: false,
  });

  // Calculate editor dimensions - always square for circular crop
  const baseSize = 500;
  const width = baseSize;
  const height = baseSize;

  const handlePositionChange = useCallback((position: { x: number; y: number }) => {
    setPosition(position);
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleRotationChange = useCallback((value: number) => {
    // Clamp rotation to -180 to 180
    let newRotation = value % 360;
    if (newRotation > 180) newRotation -= 360;
    if (newRotation < -180) newRotation += 360;
    setRotation(newRotation);
  }, []);

  // Helper function to handle scale changes
  const handleScaleChange = useCallback((value: number) => {
    // Clamp scale between 0.5 and 2
    const newScale = Math.min(Math.max(value, 0.5), 2);
    setScale(newScale);
  }, []);

  // Helper function to calculate distance between two points
  const getDistance = (touches: React.TouchList): number => {
    const touch1 = touches[0];
    const touch2 = touches[1];
    if (!touch1 || !touch2) return 0; // Check if touches are defined
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2),
    );
  };

  // Helper function to calculate angle between two points
  const getAngle = (touches: React.TouchList): number => {
    const touch1 = touches[0];
    const touch2 = touches[1];
    if (!touch1 || !touch2) return 0; // Check if touches are defined
    return (
      Math.atan2(touch2.clientY - touch1.clientY, touch2.clientX - touch1.clientX) *
      (180 / Math.PI)
    );
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    if (event.touches.length === 2) {
      event.preventDefault(); // Prevent page scroll/zoom
      const distance = getDistance(event.touches);
      const angle = getAngle(event.touches);
      touchStateRef.current = {
        startDistance: distance,
        startAngle: angle,
        initialScale: scale,
        initialRotation: rotation,
        isInteracting: true,
      };
    }
  };

  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStateRef.current.isInteracting && event.touches.length === 2) {
      event.preventDefault(); // Prevent page scroll/zoom

      const currentDistance = getDistance(event.touches);
      const currentAngle = getAngle(event.touches);

      // Calculate scale change
      const scaleChange = currentDistance / touchStateRef.current.startDistance;
      let newScale = touchStateRef.current.initialScale * scaleChange;
      newScale = Math.min(Math.max(newScale, 0.5), 2); // Clamp scale between 0.5 and 2

      // Calculate rotation change
      const angleChange = currentAngle - touchStateRef.current.startAngle;
      const newRotation = touchStateRef.current.initialRotation + angleChange;

      setScale(newScale);
      handleRotationChange(newRotation); // Use handleRotationChange to clamp rotation
    }
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStateRef.current.isInteracting) {
      // If only one touch remains, stop interaction
      if (event.touches.length < 2) {
        touchStateRef.current = {
          startDistance: 0,
          startAngle: 0,
          initialScale: 1,
          initialRotation: 0,
          isInteracting: false,
        };
      }
    }
  };

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
          <div
            className="flex justify-center p-2 bg-gray-50 rounded-md touch-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ touchAction: 'none' }}
          >
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
                min={0.5}
                max={2.5}
                step={0.1}
                onValueChange={(values) => {
                  if (values[0] !== undefined) {
                    handleScaleChange(values[0]);
                  }
                }}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0.5x</span>
                <span>1x</span>
                <span>2.5x</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Tourner l&apos;image</label>
              </div>
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
          <div className="flex flex-col-reverse gap-4 md:flex-row md:justify-end">
            <Button variant="outline" onClick={onCancel} disabled={isLoading}>
              Annuler
            </Button>
            <Button onClick={handleCropComplete} disabled={isLoading || !imageLoaded}>
              {isLoading ? 'Traitement en cours...' : 'Valider'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
