import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { ROUTES } from '@/schemas/routes';
import { ArrowLeft } from 'lucide-react';
import React from 'react';
import { LogoutButton } from '@/components/ui/logout-button';

export function Unauthorized() {
  return (
    <div className={'flex size-full flex-col items-center justify-center gap-4'}>
      <h1>Accès refusé</h1>
      <p>{"Vous n'êtes pas autorisé à accéder à cette page."}</p>
      <Link
        className={
          buttonVariants({
            variant: 'default',
          }) + 'px-0 gap-2 flex items-center !justify-start w-max'
        }
        href={ROUTES.base}
      >
        <ArrowLeft className="mr-2 size-5" />
        <span>{"Retour à l'accueil"}</span>
      </Link>
      <LogoutButton />
    </div>
  );
}
