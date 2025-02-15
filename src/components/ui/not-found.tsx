'use client';

import { useRouter } from 'next/navigation';
import { Button } from './button';

type Props = {
  title?: string;
  description?: string;
};

export function NotFoundComponent({ title, description }: Props) {
  const router = useRouter();

  return (
    <div className="flex flex-col py-4 items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">{title ?? 'Ressource non trouvée'}</h1>
      <p className="text-sm text-gray-500">
        {description ?? "La ressource que vous cherchez n'existe pas."}
      </p>
      <Button onClick={() => router.back()}>Retour</Button>
    </div>
  );
}
