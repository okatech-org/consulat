import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/card'
import { DocumentItem } from './document-item'
import { useDocuments } from '@/hooks/use-documents'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'

export function DocumentsList() {
  const t = useTranslations('documents')
  const { documents, isLoading } = useDocuments()

  if (isLoading) return <LoadingSkeleton />

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {documents.map((doc) => (
        <DocumentItem key={doc.id} document={doc} />
      ))}
    </div>
  )
}