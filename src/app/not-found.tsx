'use client';

import { PageContainer } from '@/components/layouts/page-container';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <PageContainer>
      <div className="flex flex-col items-center justify-center h-screen w-screen gap-4">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-lg text-center">
          La page à laquelle vous essayez d&apos;accéder n&apos;existe pas. <br />
          Vous pouvez revenir à la page précédente ou retourner à l&apos;accueil.
        </p>
        <Button
          variant="outline"
          onClick={() => {
            router.back();
          }}
        >
          Revenir à la page précédente
        </Button>
      </div>
    </PageContainer>
  );
}
