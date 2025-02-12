'use client';

import { cn } from '@/lib/utils';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type CardProps = React.ComponentProps<typeof Card> & {
  title?: string;
  description?: string;
  action?: React.ReactNode;
};

export function ErrorCard({
  className,
  title = "Oups, quelque chose s'est mal passé",
  description = "Votre demande n'a pas été traitée. Veuillez réessayer.",
  action,
  ...props
}: CardProps) {
  return (
    <Card className={cn('w-[380px] mx-auto', className)} {...props}>
      <CardHeader>
        <CardTitle className={'mb-2'}>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {action && <CardFooter>{action}</CardFooter>}
    </Card>
  );
}
