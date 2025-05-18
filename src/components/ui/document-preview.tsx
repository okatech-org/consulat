'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocumentPreviewProps {
  isOpen: boolean;
  setIsOpenAction: (isOpen: boolean) => void;
  url: string;
  title: string;
  type: string;
  onDownload?: () => void;
}

export function DocumentPreview({
  url,
  title,
  onDownload,
  isOpen,
  setIsOpenAction,
}: DocumentPreviewProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const isPDF = url.toLowerCase().endsWith('.pdf');

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpenAction}>
      <DialogContent className="h-[90vh] max-w-4xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="size-icon" />
            </Button>
            <span className="text-sm">{Math.round(zoom * 100)}%</span>
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="size-icon" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleRotate}>
              <RotateCw className="size-icon" />
            </Button>
            {onDownload && (
              <Button variant="outline" size="sm" onClick={onDownload}>
                <Download className="size-icon" />
              </Button>
            )}
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-auto p-4">
          {isPDF ? (
            <iframe src={`${url}#toolbar=0`} className="size-full" title={title} />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div
                className={cn(
                  'relative transition-transform duration-200',
                  'max-h-full max-w-full',
                )}
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={title}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
