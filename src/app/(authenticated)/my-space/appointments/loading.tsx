import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { PageContainer } from '@/components/layouts/page-container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CardContainer from '@/components/layouts/card-container';

export default function AppointmentsLoading() {
  return (
    <PageContainer
      title="Mes rendez-vous"
      description="Gérez vos rendez-vous consulaires"
      action={<div className="h-10 w-36 animate-pulse rounded-md bg-muted" />}
    >
      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">
            <div className="flex items-center gap-2">À venir</div>
          </TabsTrigger>
          <TabsTrigger value="past">Passés</TabsTrigger>
          <TabsTrigger value="cancelled">Annulés</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          <CardContainer title="Rendez-vous à venir">
            <LoadingSkeleton
              variant="card"
              count={3}
              size="md"
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            />
          </CardContainer>
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          <CardContainer title="Rendez-vous passés">
            <LoadingSkeleton
              variant="card"
              count={3}
              size="md"
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            />
          </CardContainer>
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          <CardContainer title="Rendez-vous annulés">
            <LoadingSkeleton
              variant="card"
              count={2}
              size="md"
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            />
          </CardContainer>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
