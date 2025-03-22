'use client';

import * as React from 'react';
import { useGesture } from '@use-gesture/react';
import { motion, AnimatePresence } from 'framer-motion';

import { cn } from '@/lib/utils';

export interface SwipeableViewProps {
  children: React.ReactNode[];
  activeIndex: number;
  onIndexChange?: (index: number) => void;
  threshold?: number;
  direction?: 'horizontal' | 'vertical';
  loop?: boolean;
  animationVariant?: 'slide' | 'fade' | 'zoom' | 'none';
  indicators?: boolean;
  disableSwipe?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const SwipeableView = React.forwardRef<HTMLDivElement, SwipeableViewProps>(
  (
    {
      className,
      children,
      activeIndex,
      onIndexChange,
      threshold = 0.3,
      direction = 'horizontal',
      loop = false,
      animationVariant = 'slide',
      indicators = true,
      disableSwipe = false,
      ...props
    },
    ref,
  ) => {
    const isHorizontal = direction === 'horizontal';
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [dragging, setDragging] = React.useState(false);

    // Ensure activeIndex is within bounds
    const clampedIndex = React.useMemo(() => {
      if (children.length === 0) return 0;
      if (loop) {
        if (activeIndex < 0) return children.length - 1;
        if (activeIndex >= children.length) return 0;
      }
      return Math.max(0, Math.min(activeIndex, children.length - 1));
    }, [activeIndex, children.length, loop]);

    // Handle swipe gesture
    const bind = useGesture(
      {
        onDrag: ({
          down,
          movement: [mx, my],
          direction: [dx, dy],
          velocity: [vx, vy],
        }) => {
          if (disableSwipe) return;

          const movement = isHorizontal ? mx : my;
          const dir = isHorizontal ? dx : dy;
          const velocity = isHorizontal ? vx : vy;

          if (down) {
            setDragging(true);
            return;
          }

          setDragging(false);

          const thresholdDistance = containerRef.current
            ? (isHorizontal
                ? containerRef.current.offsetWidth
                : containerRef.current.offsetHeight) * threshold
            : 100;

          const canSwipeForward = clampedIndex > 0 || loop;
          const canSwipeBackward = clampedIndex < children.length - 1 || loop;

          if (Math.abs(movement) > thresholdDistance || Math.abs(velocity) > 0.5) {
            if (dir < 0 && canSwipeBackward) {
              // Swipe to next
              onIndexChange?.(
                clampedIndex + 1 === children.length && loop ? 0 : clampedIndex + 1,
              );
            } else if (dir > 0 && canSwipeForward) {
              // Swipe to previous
              onIndexChange?.(
                clampedIndex - 1 < 0 && loop ? children.length - 1 : clampedIndex - 1,
              );
            }
          }
        },
      },
      {
        drag: {
          filterTaps: true,
          from: () => [0, 0],
          rubberband: true,
          delay: 0,
          bounds: { top: 0, bottom: 0, left: 0, right: 0 },
          axis: isHorizontal ? 'x' : 'y',
        },
      },
    );

    // Animation variants
    const variants = {
      slide: {
        initial: ((custom: number) => ({
          x: isHorizontal ? custom * 100 + '%' : 0,
          y: !isHorizontal ? custom * 100 + '%' : 0,
          opacity: 0,
        })) as any,
        animate: {
          x: 0,
          y: 0,
          opacity: 1,
        },
        exit: ((custom: number) => ({
          x: isHorizontal ? custom * -100 + '%' : 0,
          y: !isHorizontal ? custom * -100 + '%' : 0,
          opacity: 0,
        })) as any,
      },
      fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      },
      zoom: {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 1.1 },
      },
      none: {
        initial: {},
        animate: {},
        exit: {},
      },
    };

    return (
      <div
        className={cn('relative w-full overflow-hidden touch-manipulation', className)}
        ref={ref}
        {...props}
      >
        <div
          ref={containerRef}
          {...(disableSwipe ? {} : bind())}
          className={cn(
            'relative w-full h-full touch-manipulation',
            dragging ? 'cursor-grabbing' : 'cursor-grab',
            isHorizontal ? 'flex flex-row' : 'flex flex-col',
            disableSwipe && 'pointer-events-none',
          )}
        >
          <AnimatePresence initial={false} mode="wait" custom={1}>
            {React.Children.toArray(children)[clampedIndex] && (
              <motion.div
                key={clampedIndex}
                custom={1}
                initial={
                  animationVariant !== 'none'
                    ? variants[animationVariant].initial
                    : undefined
                }
                animate={
                  animationVariant !== 'none'
                    ? variants[animationVariant].animate
                    : undefined
                }
                exit={
                  animationVariant !== 'none'
                    ? variants[animationVariant].exit
                    : undefined
                }
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="absolute inset-0 w-full h-full"
              >
                {React.Children.toArray(children)[clampedIndex]}
              </motion.div>
            )}
          </AnimatePresence>

          {indicators && children.length > 1 && (
            <div
              className={cn(
                'absolute flex gap-1.5 z-10',
                isHorizontal
                  ? 'bottom-4 left-1/2 -translate-x-1/2'
                  : 'right-4 top-1/2 -translate-y-1/2 flex-col',
              )}
            >
              {React.Children.map(children, (_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => onIndexChange?.(index)}
                  className={cn(
                    'rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-primary touch-manipulation',
                    index === clampedIndex
                      ? 'bg-primary w-2.5 h-2.5'
                      : 'bg-primary/30 w-2 h-2',
                  )}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  },
);
SwipeableView.displayName = 'SwipeableView';

export { SwipeableView };
