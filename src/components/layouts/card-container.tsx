import * as Card from '@/components/ui/card';

interface CardContainerProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  footerContent?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClass?: string;
  headerClass?: string;
}

export default function CardContainer({
  title,
  action,
  subtitle,
  children,
  className,
  contentClass,
  footerContent,
  headerClass,
}: Readonly<CardContainerProps>) {
  return (
    <Card.Card className={'flex flex-col ' + className}>
      {(title || subtitle || action) && (
        <Card.CardHeader className={`flex-row pb-2 space-y-0 ${headerClass}`}>
          <div>
            {title && (
              <Card.CardTitle className={'text-xl font-bold tracking-tight'}>
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
      {footerContent && <Card.CardFooter>{footerContent}</Card.CardFooter>}
    </Card.Card>
  );
}
