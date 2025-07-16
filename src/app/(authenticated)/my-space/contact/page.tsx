import { PageContainer } from '@/components/layouts/page-container';
import { ContactMethods } from '../_components/contact-methods';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';

export const metadata = {
  title: 'Nous contacter - Mon Espace Consulaire',
  description: 'Contactez notre équipe pour toute assistance consulaire',
};

export default function ContactPage() {
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
            <h1 className="text-2xl font-bold">Nous contacter</h1>
            <p className="text-muted-foreground">
              Choisissez le moyen de contact qui vous convient le mieux
            </p>
          </div>
        </div>

        <ContactMethods />
      </div>
    </PageContainer>
  );
}
