import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
    'disabled:pointer-events-none disabled:opacity-50',
    'touch-manipulation active:scale-[0.98]',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  ].join(' '),
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-interactive hover:shadow-interactive-hover active:shadow-interactive-active hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground shadow-interactive hover:shadow-interactive-hover active:shadow-interactive-active hover:bg-destructive/90',
        outline:
          'border border-input bg-background shadow-interactive hover:shadow-interactive-hover active:shadow-interactive-active hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground shadow-interactive hover:shadow-interactive-hover active:shadow-interactive-active hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        success:
          'bg-success text-success-foreground shadow-interactive hover:shadow-interactive-hover active:shadow-interactive-active hover:bg-success/90',
        warning:
          'bg-warning text-warning-foreground shadow-interactive hover:shadow-interactive-hover active:shadow-interactive-active hover:bg-warning/90',
        info: 'bg-info text-info-foreground shadow-interactive hover:shadow-interactive-hover active:shadow-interactive-active hover:bg-info/90',
      },
      size: {
        default: 'h-10 px-4 py-2 min-h-[44px] min-w-[44px]',
        sm: 'h-9 rounded-md px-3 text-xs min-h-[36px] min-w-[36px]',
        lg: 'h-12 rounded-md px-8 min-h-[48px]',
        icon: 'h-10 w-10 min-h-[44px] min-w-[44px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, type = 'button', ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        type={type}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
