import { ReactNode } from 'react';

interface PageContainerProps {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const PageContainer = ({
  title,
  description,
  action,
  children,
  className = '',
}: PageContainerProps) => {
  return (
    <div className={`h-full space-y-4 sm:space-y-6 ${className}`}>
      {(title || description || action) && (
        <div className="flex items-end gap-2 justify-between">
          {(title || description) && (
            <div>
              {title && <h1 className="text-xl sm:text-2xl font-bold">{title}</h1>}
              {description && <div className="text-muted-foreground">{description}</div>}
            </div>
          )}
          {action && <div>{action}</div>}
        </div>
      )}

      {children}
    </div>
  );
};
