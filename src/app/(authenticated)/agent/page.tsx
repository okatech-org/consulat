import { getCurrentUser } from '@/actions/user';
import { getTranslations } from 'next-intl/server';
import { AgentDashboard } from './_utils/components/agent-dashboard';

export default async function AgentPage() {
  const user = await getCurrentUser();
  const t = await getTranslations('agent');

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{t('dashboard.title')}</h1>
        <p className="text-muted-foreground">
          {t('dashboard.welcome', { name: user?.firstName })}
        </p>
      </div>

      <AgentDashboard />
    </div>
  );
}
