import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';

interface InfoFieldProps {
  label: string;
  value?: React.ReactNode | null;
  required?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export function InfoField({ label, value, required, icon, className }: InfoFieldProps) {
  const t = useTranslations('profile.review');

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {icon}
          <span>{label}</span>
        </div>
        {!value && required && (
          <Badge variant="destructive" className="text-xs">
            {t('required')}
          </Badge>
        )}
      </div>
      <div className="mt-1">
        {value || (
          <span className="text-sm italic text-muted-foreground">
            {t('not_provided')}
          </span>
        )}
      </div>
    </div>
  );
}

interface DocumentStatusProps {
  type: string;
  isUploaded: boolean;
  required?: boolean;
  customText?: string;
  className?: string;
}

export function DocumentStatus({
  type,
  isUploaded,
  customText,
  required = true,
  className = '',
}: DocumentStatusProps) {
  const t = useTranslations('profile.review');

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-2">
        <FileText className="size-4 text-muted-foreground" />
        <span>{type}</span>
      </div>
      <Badge variant={isUploaded ? 'valid' : required ? 'destructive' : 'outline'}>
        {isUploaded
          ? (customText ?? t('document_uploaded'))
          : required
            ? t('document_missing')
            : t('not_provided')}
      </Badge>
    </div>
  );
}
