'use client';

import { useRouter } from 'next/navigation';
import { Button } from './button';
import { PageContainer } from '../layouts/page-container';
import { ArrowLeftIcon } from 'lucide-react';

type Props = {
  title?: string;
  description?: string;
};

export function NotFoundComponent({ title, description }: Props) {
  const router = useRouter();

  return (
    <PageContainer
      title={title ?? 'Ressource non trouvée'}
      className="flex flex-col py-4 items-center justify-center gap-4"
    >
      <p className="text-sm text-muted-foreground">
        {description ?? "La ressource que vous cherchez n'existe pas."}
      </p>
      <Button
        leftIcon={<ArrowLeftIcon className="size-4" />}
        onClick={() => router.back()}
      >
        Retour
      </Button>
    </PageContainer>
  );
}
