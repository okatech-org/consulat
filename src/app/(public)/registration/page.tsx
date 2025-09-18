import { BetaBanner } from '@/components/ui/beta-banner';
import { PageContainer } from '@/components/layouts/page-container';
import { getCurrentUser } from '@/lib/auth/utils';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';
import { getActiveCountries } from '@/actions/countries';
import { SignUpForm } from '@/app/sign-up/[[...sign-up]]/page';
import CardContainer from '@/components/layouts/card-container';

export default async function RegistrationPage() {
  const currentUser = await getCurrentUser();
  const availableCountries = await getActiveCountries();

  if (currentUser) {
    redirect(ROUTES.user.profile_form);
  }

  return (
    <PageContainer className="w-dvw min-h-dvh overflow-x-hidden container py-8 relative bg-background flex items-center justify-center">
      <div className="w-full h-full flex flex-col items-center justify-center max-w-2xl mx-auto space-y-6">
        <CardContainer>
          <SignUpForm availableCountries={availableCountries} />
        </CardContainer>
        <BetaBanner className="mt-4" />
      </div>
    </PageContainer>
  );
}
