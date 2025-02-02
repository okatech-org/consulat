'use client';

import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import { cn } from '@/lib/utils';

interface LottieAnimationProps {
  src: string;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
}

export default function LottieAnimation({
  src,
  loop = true,
  autoplay = true,
  className,
}: LottieAnimationProps) {
  const [animationData, setAnimationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnimation = async () => {
      try {
        const response = await fetch(src);
        const data = await response.json();
        setAnimationData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load animation');
        console.error('Error loading Lottie animation:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnimation();
  }, [src]);

  if (isLoading) {
    return <div className="size-6 animate-pulse rounded-full bg-muted" />;
  }

  if (error || !animationData) {
    return null;
  }

  return (
    <div className={cn('w-full h-full', className)}>
      <Lottie animationData={animationData} loop={loop} autoplay={autoplay} />
    </div>
  );
}
