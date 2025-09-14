'use client';

import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { IntelNavigationBar } from '@/components/intelligence/intel-navigation-bar';

export default function IntelLoadingPage() {
  return (
    <>
      <IntelNavigationBar currentPage="Chargement..." />
      <div className="space-y-6">
        <LoadingSkeleton variant="grid" columns={2} rows={2} aspectRatio="4/3" />
      </div>
    </>
  );
}
