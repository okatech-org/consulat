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
    <PageContainer
      title="Historique des demandes"
      description="Retrouvez toutes vos demandes passées et en cours"
      action={
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.user.dashboard}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
      }
    >
      <RequestsHistory />
    </PageContainer>
  );
}
