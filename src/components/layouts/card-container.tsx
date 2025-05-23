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
  contentClass = 'pt-4',
  footerContent,
  headerClass,
}: Readonly<CardContainerProps>) {
  return (
    <Card.Card className={'flex flex-col ' + className}>
      {(title || subtitle || action) && (
        <Card.CardHeader
          className={`flex-row space-y-0 pb-4 mb-4 gap-2 border-b border-border ${headerClass}`}
        >
          <div>
            {title && <Card.CardTitle>{title}</Card.CardTitle>}
            {subtitle && <Card.CardDescription>{subtitle}</Card.CardDescription>}
          </div>
          {action && <div className="ml-auto">{action}</div>}
        </Card.CardHeader>
      )}
      <Card.CardContent
        className={`${contentClass} ${title || subtitle || action ? '!pt-0' : ''}`}
      >
        {children}
      </Card.CardContent>
      {footerContent && <Card.CardFooter>{footerContent}</Card.CardFooter>}
    </Card.Card>
  );
}
