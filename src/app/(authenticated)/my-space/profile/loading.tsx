import { PageContainer } from '@/components/layouts/page-container';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

export default function Loading() {
  return (
    <PageContainer>
      <LoadingSkeleton variant="grid" aspectRatio="4/3" columns={2} rows={2} />
    </PageContainer>
  );
}
