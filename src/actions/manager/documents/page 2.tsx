import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import { DocumentsList } from '@/components/documents/documents-list'
import { DocumentUpload } from '@/components/documents/document-upload'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'

export default async function DocumentsPage() {
  const t = await getTranslations('documents')

  return (
    <div className="container space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <DocumentUpload />
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <DocumentsList />
      </Suspense>
    </div>
  )
}