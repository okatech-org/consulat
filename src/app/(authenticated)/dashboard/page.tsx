import { Suspense } from 'react'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import { getCurrentUser } from '@/actions/user'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  return (
    <>
      {/* Contenu principal */}
      <div className="container pb-20 pt-4 md:py-8">
        <Suspense fallback={<LoadingSkeleton />}>
          {/* Section profil - toujours en haut sur mobile */}
          <div className="mb-6">

          </div>

          {/* Grille responsive pour les autres sections */}
          <div className="grid gap-4 md:grid-cols-2">

          </div>
        </Suspense>
      </div>
    </>
  )
}