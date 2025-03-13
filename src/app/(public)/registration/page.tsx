import { RegistrationForm } from '@/components/registration/registration-form';
import { getActiveCountries } from '@/actions/countries';
import { checkAuth } from '@/lib/auth/action';
import { tryCatch } from '@/lib/utils';
import { getUserFullProfile } from '@/lib/user/getters';
import { RouteAuthGuard } from '@/components/layouts/route-auth-guard';
import { NewProfileForm } from '@/components/registration/new-profile-form';
export default async function RegistrationPage() {
  const countries = await getActiveCountries();
  const { data: currentUser } = await tryCatch(checkAuth());

  const { data: profile } = await tryCatch(
    getUserFullProfile(currentUser?.user.id ?? ''),
  );

  return (
    <RouteAuthGuard
      user={currentUser?.user}
      fallbackComponent={<NewProfileForm availableCountries={countries} />}
    >
      <div className="container flex flex-col py-6">
        {profile ? (
          <RegistrationForm availableCountries={countries} profile={profile} />
        ) : (
          <NewProfileForm availableCountries={countries} />
        )}
      </div>
    </RouteAuthGuard>
  );
}
