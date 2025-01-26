import { getTranslations } from 'next-intl/server';

export default async function ManagerDashboard() {
  const t = await getTranslations('user.dashboard');

  return (
    <div className="container space-y-8">
      <h1 className="text-3xl font-bold">{t('title')}</h1>
    </div>
  );
}
