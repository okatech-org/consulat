import { PageContainer } from '@/components/layouts/page-container';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <PageContainer>
      {/* Structure principale en grille */}
      <div className="grid grid-cols-8 gap-4">
        {/* Header de profil */}
        <div className="col-span-full lg:col-span-5">
          <div className="bg-card rounded-lg border p-4 md:p-6">
            <div className="flex items-center gap-4 md:gap-6">
              {/* Avatar */}
              <Skeleton className="size-16 md:size-32 rounded-full" />

              {/* Informations profil */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-3">
                  <Skeleton className="h-6 md:h-8 w-48" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-28" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alerte de statut */}
        <div className="col-span-full lg:col-span-3">
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-2 mb-3">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>

      {/* Deuxième ligne de la grille */}
      <div className="grid grid-cols-8 gap-4">
        {/* Zone principale - Onglets */}
        <div className="col-span-full lg:col-span-5 space-y-4">
          {/* Navigation des onglets */}
          <div className="flex flex-wrap gap-2 p-1 bg-muted rounded-lg">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-4" />
              </div>
            ))}
          </div>

          {/* Contenu de l'onglet actif */}
          <div className="bg-card rounded-lg border p-6">
            <div className="space-y-6">
              {/* Section formulaire */}
              <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>

              {/* Section documents (si c'est l'onglet documents) */}
              <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                    <div className="mt-4 flex justify-center">
                      <Skeleton className="h-24 w-24 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Bouton de sauvegarde */}
              <div className="flex justify-end">
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-span-full lg:col-span-3 space-y-4">
          {/* Notes de révision */}
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-2 mb-3">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-5 w-20" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="border-b pb-3 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          </div>

          {/* Barre de progression */}
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-6 w-12 rounded-full" />
            </div>

            {/* Barre de progression principale */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-8" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>

            {/* Bouton d'expansion */}
            <div className="flex justify-center">
              <Skeleton className="h-8 w-32" />
            </div>

            {/* Sections détaillées */}
            <div className="space-y-3 mt-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-3 w-8" />
                      <Skeleton className="h-5 w-10 rounded-full" />
                    </div>
                  </div>
                  <Skeleton className="h-1.5 w-full rounded-full ml-10" />
                </div>
              ))}
            </div>
          </div>

          {/* Bouton de soumission */}
          <div className="flex flex-col items-center space-y-2">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
