import * as Card from '@/components/ui/card';

interface CardContainerProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClass?: string;
}

export default function CardContainer({
  title,
  action,
  subtitle,
  children,
  className,
  contentClass,
}: Readonly<CardContainerProps>) {
  return (
    <Card.Card className={'flex flex-col ' + className}>
      {(title || subtitle || action) && (
        <Card.CardHeader className={'flex-row space-y-0'}>
          <div>
            {title && (
              <Card.CardTitle className={'text-2xl font-bold tracking-tight'}>
                {title}
              </Card.CardTitle>
            )}
            {subtitle && <Card.CardDescription>{subtitle}</Card.CardDescription>}
          </div>
          {action && <div className="ml-auto">{action}</div>}
        </Card.CardHeader>
      )}
      <Card.CardContent className={`${title || subtitle ? '' : 'pt-6'} ${contentClass}`}>
        {children}
      </Card.CardContent>
    </Card.Card>
  );
}
