import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center min-w-max w-max rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground shadow',
        secondary: 'border-transparent bg-secondary text-secondary-foreground shadow',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground shadow',
        destructiveOutline: 'border-destructive text-destructive bg-destructive/10',
        outline: 'text-foreground',
        outlineReverse: 'text-primary-foreground! border-primary-foreground!',
        warning: 'border-yellow-500 text-yellow-500 bg-yellow-500/10',
        success: 'border-green-500 text-green-500 bg-green-500/10',
        info: 'border-blue-500 text-blue-500 bg-blue-500/10',
        error: 'border-red-500 text-red-500 bg-red-500/10',
      },
    },
    defaultVariants: {
      variant: 'outline',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];
export { Badge, badgeVariants };
