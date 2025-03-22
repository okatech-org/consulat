'use client';

import * as React from 'react';
import { VariantProps, cva } from 'class-variance-authority';
import { X } from 'lucide-react';
import { AlertCircle, CheckCircle2, Info, XCircle, LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const toastIconVariants = cva('size-5 shrink-0', {
  variants: {
    variant: {
      default: 'text-foreground',
      success: 'text-success',
      error: 'text-destructive',
      warning: 'text-warning',
      info: 'text-info',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const getIcon = (variant: FeedbackVariant): LucideIcon => {
  switch (variant) {
    case 'success':
      return CheckCircle2;
    case 'error':
      return XCircle;
    case 'warning':
      return AlertCircle;
    case 'info':
      return Info;
    default:
      return Info;
  }
};

type FeedbackVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

export interface FeedbackToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastIconVariants> {
  variant?: FeedbackVariant;
  title: string;
  description?: string;
  action?: React.ReactNode;
  haptic?: boolean;
  autoClose?: boolean;
  duration?: number;
  showIcon?: boolean;
  showCloseButton?: boolean;
}

export function FeedbackToast({
  className,
  variant = 'default',
  title,
  description,
  action,
  haptic = true,
  autoClose = true,
  duration = 3000,
  showIcon = true,
  showCloseButton = true,
  ...props
}: FeedbackToastProps) {
  const { toast } = useToast();
  const [visible, setVisible] = React.useState(true);

  // Get the icon component based on the variant
  const Icon = getIcon(variant);

  // Handle haptic feedback if supported
  React.useEffect(() => {
    if (haptic && typeof window !== 'undefined' && 'navigator' in window) {
      try {
        if ('vibrate' in navigator) {
          switch (variant) {
            case 'success':
              navigator.vibrate(50);
              break;
            case 'error':
              navigator.vibrate([100, 50, 100]);
              break;
            case 'warning':
              navigator.vibrate([50, 50, 50]);
              break;
            default:
              navigator.vibrate(50);
              break;
          }
        }
      } catch (error) {
        console.error('Haptic feedback failed:', error);
      }
    }
  }, [haptic, variant]);

  // Handle auto-close
  React.useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setVisible(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration]);

  // Show the toast using the toast hook
  React.useEffect(() => {
    // Use a more specific type declaration
    const toastVariant: 'default' | 'success' | 'destructive' | null | undefined = {
      default: 'default',
      success: 'success',
      error: 'destructive',
      warning: null,
      info: null,
    }[variant];

    toast({
      variant: toastVariant,
      title,
      description,
      // Cast action to the expected type
      action: action as any,
    });
  }, [toast, variant, title, description, action]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        'pointerEvents-auto flex w-full items-center justify-between space-x-4 rounded-md border px-4 py-3 shadow-medium',
        {
          'border-border bg-background text-foreground': variant === 'default',
          'border-success/20 bg-success/10 text-success': variant === 'success',
          'border-destructive/20 bg-destructive/10 text-destructive': variant === 'error',
          'border-warning/20 bg-warning/10 text-warning': variant === 'warning',
          'border-info/20 bg-info/10 text-info': variant === 'info',
        },
        'touch-manipulation animation-slide-in',
        className,
      )}
      {...props}
    >
      <div className="flex flex-1 items-start gap-3">
        {showIcon && <Icon className={toastIconVariants({ variant })} />}
        <div className="grid gap-1">
          <div className="text-base font-medium leading-none tracking-tight">{title}</div>
          {description && <div className="text-sm opacity-90">{description}</div>}
        </div>
      </div>

      {action && <div>{action}</div>}

      {showCloseButton && (
        <button
          type="button"
          className="flex rounded-md p-1 text-foreground/50 opacity-70 transition-opacity hover:text-foreground hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
          onClick={() => setVisible(false)}
        >
          <X className="size-4" />
          <span className="sr-only">Close</span>
        </button>
      )}
    </div>
  );
}
