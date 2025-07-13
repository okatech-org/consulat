import { PageContainer } from '@/components/layouts/page-container';
import { Skeleton } from '@/components/ui/skeleton';
import CardContainer from '@/components/layouts/card-container';

export default function Loading() {
  return (
    <PageContainer>
      <div className="w-full overflow-x-hidden max-w-7xl mx-auto flex flex-col lg:pb-0">
        {/* Header mobile avec étapes */}
        <header className="w-full border-b border-border pb-6 lg:hidden">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-16" />
          </div>
          <div className="flex items-center space-x-4 overflow-x-auto">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center space-y-2 min-w-0">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </header>

        {/* Layout desktop avec sidebar */}
        <div className="w-full flex flex-col lg:flex-row lg:gap-4">
          {/* Sidebar desktop */}
          <aside className="hidden lg:block lg:w-80 lg:flex-shrink-0">
            <div className="bg-card border border-border rounded-lg p-6">
              <Skeleton className="h-6 w-32 mb-6" />
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <Skeleton className="h-6 w-6 rounded-full mt-1" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Contenu principal */}
          <main className="flex-1 min-w-0">
            <div className="mx-auto w-full max-w-4xl">
              <div className="flex flex-col md:pb-10 gap-4 justify-center">
                {/* Contenu du formulaire */}
                <CardContainer>
                  <div className="space-y-6">
                    {/* Titre de l'étape */}
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-64" />
                    </div>

                    {/* Formulaire - simulation étape documents */}
                    <div className="grid gap-4 md:grid-cols-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-6 w-16 rounded-full" />
                          </div>
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                          <div className="flex justify-center">
                            <Skeleton className="h-24 w-24 rounded-lg" />
                          </div>
                          <Skeleton className="h-10 w-full" />
                        </div>
                      ))}
                    </div>

                    {/* Simulation formulaire basique */}
                    <div className="grid gap-4 md:grid-cols-2">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContainer>

                {/* Boutons de navigation */}
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-48" />
                </div>

                {/* Informations de validation */}
                <div className="flex items-center justify-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>

              {/* Progression mobile */}
              <div className="lg:hidden mt-8 p-4 bg-card border border-border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            </div>
          </main>
        </div>
      </div>
    </PageContainer>
  );
}
