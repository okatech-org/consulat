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
import { Download, Eye, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';

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
  const isMobile = useMediaQuery('(max-width: 640px)');

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpenAction}>
      {showTrigger && (
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsOpenAction(true)}
          >
            <Eye className="size-icon" />
          </Button>
        </SheetTrigger>
      )}
      <SheetContent side={isMobile ? 'bottom' : 'right'} className="!max-w-5xl">
        <div className="flex h-full flex-col gap-4 overflow-hidden">
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
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
      </SheetContent>
    </Sheet>
  );
}
