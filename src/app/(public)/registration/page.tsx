import { RegistrationForm } from '@/components/registration/registration-form';
import { getActiveCountries } from '@/actions/countries';

export default async function RegistrationPage() {
  const countries = await getActiveCountries();

  return (
    <main
      className={
        'min-h-screen w-screen overflow-auto overflow-x-hidden bg-muted py-6 pt-14'
      }
    >
      <div className="container flex flex-col py-6">
        <RegistrationForm availableCountries={countries} />
      </div>
    </main>
  );
}
