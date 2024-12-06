import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { FileText } from 'lucide-react'

interface InfoFieldProps {
  label: string
  value?: string | null
  required?: boolean
  icon?: React.ReactNode
  className?: string
}

export function InfoField({ label, value, required, icon, className }: InfoFieldProps) {
  const t = useTranslations('registration.review')

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
  )
}

interface DocumentStatusProps {
  type: string
  isUploaded: boolean
  required?: boolean
}

export function DocumentStatus({ type, isUploaded, required = true }: DocumentStatusProps) {
  const t = useTranslations('registration.review')

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <span>{type}</span>
      </div>
      <Badge variant={isUploaded ? "outline" : required ? "destructive" : "outline"}>
        {isUploaded
          ? t('document_uploaded')
          : required
            ? t('document_missing')
            : t('not_provided')
        }
      </Badge>
    </div>
  )
}