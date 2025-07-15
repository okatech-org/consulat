import { PageContainer } from '@/components/layouts/page-container';
import CardContainer from '@/components/layouts/card-container';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

function ChildrenLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse overflow-hidden rounded-lg border bg-card"
        >
          {/* Header avec avatar */}
          <div className="p-4 pb-0">
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-muted" />
                <div className="h-3 w-1/2 rounded bg-muted" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            <div className="space-y-2">
              <div className="h-3 w-1/4 rounded bg-muted" />
              <div className="h-4 w-2/3 rounded bg-muted" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-1/3 rounded bg-muted" />
              <div className="h-4 w-1/2 rounded bg-muted" />
            </div>
          </div>

          {/* Footer avec boutons */}
          <div className="p-4 pt-0">
            <div className="flex gap-2">
              <div className="h-9 flex-1 rounded bg-muted" />
              <div className="h-9 w-9 rounded bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function LoadingPage() {
  return (
    <PageContainer
      title="Profils de mes enfants"
      description="Gérez les profils de vos enfants et effectuez des démarches en leur nom"
    >
      <CardContainer>
        <ChildrenLoadingSkeleton />
      </CardContainer>
    </PageContainer>
  );
}
