import { BetaBanner } from '@/components/ui/beta-banner';
import { PageContainer } from '@/components/layouts/page-container';
import { SignUp } from '@clerk/nextjs';
import { getCurrentUser } from '@/lib/auth/utils';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';

export default async function SignUpPage() {
  const currentUser = await getCurrentUser();

  if (currentUser) {
    redirect(ROUTES.user.profile_form);
  }

  return (
    <PageContainer className="w-dvw min-h-dvh overflow-x-hidden container py-8 relative bg-background flex items-center justify-center">
      <div className="w-full h-full flex flex-col items-center justify-center max-w-2xl mx-auto space-y-6">
        <SignUp
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'shadow-none w-full !p-6',
            },
          }}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          forceRedirectUrl="/registration"
        />

        <BetaBanner />
      </div>
    </PageContainer>
  );
}
