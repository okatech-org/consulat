import { BetaBanner } from '@/components/ui/beta-banner';
import { PageContainer } from '@/components/layouts/page-container';
import { getCurrentUser } from '@/lib/auth/utils';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';
import { SignUp } from '@clerk/nextjs';

export default async function RegistrationPage() {
  const currentUser = await getCurrentUser();

  if (currentUser) {
    redirect(ROUTES.auth.register_sync);
  }

  return (
    <PageContainer className="w-dvw min-h-dvh overflow-x-hidden container py-8 relative bg-background flex items-center justify-center">
      <div className="w-full h-full flex flex-col items-center justify-center max-w-2xl mx-auto space-y-6">
        <SignUp fallbackRedirectUrl={ROUTES.auth.register_sync} />
        <BetaBanner className="mt-4" />
      </div>
    </PageContainer>
  );
}
