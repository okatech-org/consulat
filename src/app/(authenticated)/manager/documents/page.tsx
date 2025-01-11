import { Suspense } from 'react'
import { getUserDocumentsList } from '@/actions/documents'
import { DocumentsList } from '@/app/(authenticated)/manager/documents/_utils/components/documents-list'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import { getTranslations } from 'next-intl/server'

export default async function DocumentsPage() {
  const t = await getTranslations('documents')
  const documents = await getUserDocumentsList()

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <DocumentsList documents={documents} />
      </Suspense>
    </div>
  )
}