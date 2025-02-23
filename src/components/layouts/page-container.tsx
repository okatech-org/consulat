import { ReactNode } from 'react';

interface PageContainerProps {
  title: string;
  description?: string;
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
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>

      {children}
    </div>
  );
};
