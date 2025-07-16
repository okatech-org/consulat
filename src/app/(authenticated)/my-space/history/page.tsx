import { PageContainer } from '@/components/layouts/page-container';
import { RequestsHistory } from '../_components/requests-history';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';

export const metadata = {
  title: 'Historique des demandes - Mon Espace Consulaire',
  description: "Consultez l'historique complet de vos demandes consulaires",
};

export default function HistoryPage() {
  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={ROUTES.user.dashboard}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Historique des demandes</h1>
            <p className="text-muted-foreground">
              Retrouvez toutes vos demandes passées et en cours
            </p>
          </div>
        </div>

        <RequestsHistory />
      </div>
    </PageContainer>
  );
}
