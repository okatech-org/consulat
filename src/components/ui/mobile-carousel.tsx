'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileCarouselProps {
  children: React.ReactNode[];
  className?: string;
  showControls?: boolean;
  showIndicators?: boolean;
  autoScroll?: boolean;
  autoScrollInterval?: number;
}

export function MobileCarousel({
  children,
  className,
  showControls = false,
  showIndicators = true,
  autoScroll = false,
  autoScrollInterval = 5000,
}: MobileCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const slideRef = useRef<HTMLDivElement | null>(null);

  // Minimum swipe distance (px)
  const minSwipeDistance = 50;

  // Auto-scroll effect
  useEffect(() => {
    if (!autoScroll) return;

    const interval = setInterval(() => {
      goToNext();
    }, autoScrollInterval);

    return () => clearInterval(interval);
  }, [autoScroll, autoScrollInterval, currentIndex, children.length]);

  // Fonction pour aller à un slide spécifique
  const goToSlide = (index: number) => {
    // S'assurer que l'index est dans les limites
    const newIndex = Math.max(0, Math.min(index, children.length - 1));
    setCurrentIndex(newIndex);

    // Faire défiler jusqu'au slide correspondant
    if (carouselRef.current) {
      const scrollPosition = newIndex * carouselRef.current.offsetWidth;
      carouselRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth',
      });
    }
  };

  // Fonctions de navigation
  const goToPrevious = () => {
    const newIndex = (currentIndex - 1 + children.length) % children.length;
    goToSlide(newIndex);
  };

  const goToNext = () => {
    const newIndex = (currentIndex + 1) % children.length;
    goToSlide(newIndex);
  };

  // Gestionnaires d'événements tactiles
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  // Gestionnaire de scroll pour mettre à jour l'index actuel
  const handleScroll = () => {
    if (!carouselRef.current) return;

    const scrollPosition = carouselRef.current.scrollLeft;
    const slideWidth = carouselRef.current.offsetWidth;
    const newIndex = Math.round(scrollPosition / slideWidth);

    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < children.length) {
      setCurrentIndex(newIndex);
    }
  };

  // Configurer les écouteurs d'événements de défilement
  useEffect(() => {
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('scroll', handleScroll);
      return () => carousel.removeEventListener('scroll', handleScroll);
    }
  }, [currentIndex]);

  return (
    <div className={cn('relative w-full', className)}>
      {/* Carousel container */}
      <div
        ref={carouselRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none carousel-zone"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Wrap each child in a container */}
        {React.Children.map(children, (child, index) => (
          <div
            ref={index === 0 ? slideRef : null}
            className="flex-none w-full snap-center"
            style={{ scrollSnapAlign: 'start' }}
          >
            {child}
          </div>
        ))}
      </div>

      {/* Navigation controls */}
      {showControls && (
        <div className="absolute inset-0 flex items-center justify-between pointer-events-none">
          <button
            onClick={goToPrevious}
            className="p-2 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-md pointer-events-auto"
            aria-label="Slide précédent"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToNext}
            className="p-2 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-md pointer-events-auto"
            aria-label="Slide suivant"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Indicators */}
      {showIndicators && children.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {Array.from({ length: children.length }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                currentIndex === index
                  ? 'bg-blue-600 w-4'
                  : 'bg-gray-300 dark:bg-gray-600',
              )}
              aria-label={`Aller au slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
