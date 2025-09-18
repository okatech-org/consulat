'use client';

import { ROUTES } from '@/schemas/routes';
import { api } from '@/trpc/react';
import { useUser } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';

export default function SyncPage() {
  const router = useRouter();
  const { user } = useUser();
  const { mutate: syncUser } = api.auth.handleNewUser.useMutation({
    onSuccess: () => {
      router.push(ROUTES.user.profile_form);
    },
  });

  useEffect(() => {
    if (user) {
      syncUser({ clerkId: user.id });
    }
  }, [user, syncUser]);

  return (
    <div className="w-dvw bg-background h-dvh pt-8 p-6 md:pt-6 min-h-max overflow-x-hidden md:overflow-hidden flex items-center justify-center md:grid md:grid-cols-2">
      <div className="w-full h-full min-h-max overflow-y-auto flex flex-col items-center justify-center">
        <div className="max-w-lg p-2 space-y-8">
          <header className="w-full border-b border-border pb-2">
            <div className="flex mb-4 h-max w-max items-center justify-center rounded-lg bg-gradient-to-r from-blue-600/10 to-indigo-600/10 text-white">
              <Image
                src={process.env.NEXT_PUBLIC_ORG_LOGO || ''}
                width={200}
                height={200}
                alt={'Consulat.ga'}
                className="relative h-20 w-20 rounded-md transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <h1 className="text-2xl mb-2 font-bold">{'Consulat.ga'}</h1>
          </header>
          <div className="w-full flex flex-col justify-center gap-4 items-center">
            <Loader2 className="h-10 w-10 animate-spin" />
            <p className="text-lg text-muted-foreground">
              {'Votre espace consulaire est en cours de création'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
