import * as React from 'react';

import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, containerClassName, ...props }, ref) => {
    return (
      <div className={cn('relative w-full', containerClassName)}>
        <input
          type={type}
          className={cn(
            'flex h-10 min-h-[44px] w-full rounded-md border border-input bg-transparent',
            'px-4 py-2 text-base shadow-low transition-all',
            'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
            'placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:shadow-medium',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'touch-manipulation md:text-sm',
            className,
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  },
);
Input.displayName = 'Input';

export { Input };
