'use client';

import { Card, CardFooter, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import CardContainer from '../layouts/card-container';

type CardProps = React.ComponentProps<typeof Card> & {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
};

export function ErrorCard({ title, description, action, ...props }: CardProps) {
  const t_errors = useTranslations('messages.errors');
  return (
    <CardContainer
      className="bg-destructive/10 text-red-500"
      contentClass="p-4 space-y-2"
      {...props}
    >
      {title && (
        <CardTitle className="text-lg font-medium">
          {title ?? t_errors('been_error')}
        </CardTitle>
      )}
      {description ?? t_errors('been_error_description')}
      {action && <CardFooter>{action}</CardFooter>}
    </CardContainer>
  );
}
