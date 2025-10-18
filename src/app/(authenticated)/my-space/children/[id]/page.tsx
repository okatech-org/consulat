'use client';

import { PageContainer } from '@/components/layouts/page-container';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';

export default function ChildProfilePageClient() {
  return (
    <PageContainer>
      <div className="flex flex-col items-center justify-center p-8 gap-4">
        <h2 className="text-xl font-semibold">Page en cours de migration</h2>
        <p className="text-muted-foreground">Cette page sera bientôt disponible avec Convex</p>
        <Button asChild>
          <Link href={ROUTES.user.children}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux profils enfants
          </Link>
        </Button>
      </div>
    </PageContainer>
  );
}
