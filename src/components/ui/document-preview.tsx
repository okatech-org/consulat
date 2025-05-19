'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Eye, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocumentPreviewProps {
  isOpen: boolean;
  setIsOpenAction: (isOpen: boolean) => void;
  url: string;
  title: string;
  type: 'image' | 'pdf';
  onDownload?: () => void;
  showTrigger?: boolean;
}

export function DocumentPreview({
  url,
  title,
  onDownload,
  isOpen,
  type,
  setIsOpenAction,
  showTrigger = false,
}: DocumentPreviewProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpenAction}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsOpenAction(true)}
          >
            <Eye className="size-icon" />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="h-[90vh] max-w-4xl">
        <div className="flex h-full flex-col gap-4 overflow-hidden">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
