'use client';

import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { MobileCarousel } from './mobile-carousel';

interface MobileSectionCarouselProps {
  title: string;
  children: ReactNode;
  className?: string;
  badgeText?: string;
  subtitle?: string;
  bgClassName?: string;
}

export function MobileSectionCarousel({
  title,
  children,
  className,
  badgeText,
  subtitle,
  bgClassName = 'bg-white dark:bg-black',
}: MobileSectionCarouselProps) {
  // Fonction pour diviser les enfants en groupes pour le mode desktop
  const desktopChildren = React.Children.toArray(children);

  // Fonction pour transformer les enfants en slides individuelles pour le mode mobile
  const createMobileSlides = () => {
    const childArray = React.Children.toArray(children);
    return childArray.map((child, index) => (
      <div key={index} className="px-3 py-5 overflow-hidden">
        {child}
      </div>
    ));
  };

  return (
    <section className={cn('py-12 sm:py-16', bgClassName)}>
      <div className="container mx-auto px-4">
        {/* En-tête de section */}
        <div className="text-center mb-8 sm:mb-12">
          {badgeText && (
            <span className="mb-4 inline-block rounded-full bg-blue-100 px-4 py-1.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 home-badge">
              {badgeText}
            </span>
          )}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 home-title">
            {title}
          </h2>
          {subtitle && (
            <p className="max-w-2xl mx-auto text-base sm:text-lg home-subtitle">
              {subtitle}
            </p>
          )}
        </div>

        {/* Version mobile: carousel */}
        <div className="block sm:hidden">
          <MobileCarousel showIndicators={true} className={cn('mb-8', className)}>
            {createMobileSlides()}
          </MobileCarousel>
        </div>

        {/* Version desktop: grid */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {desktopChildren}
        </div>
      </div>
    </section>
  );
}
