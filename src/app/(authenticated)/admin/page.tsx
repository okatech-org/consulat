import { getTranslations } from 'next-intl/server';
import { StatsCard } from '@/components/ui/stats-card';
import { FileText, Users, CheckCircle, Clock } from 'lucide-react';
import { getAdminStats } from '@/app/(authenticated)/admin/_utils/actions/dashboard';

export default async function AdminDashboard() {
  const t = await getTranslations('admin.dashboard');

  const stats = await getAdminStats();
  if (!stats) return <p>Error loading data</p>;

  return (
    <div className="container space-y-6">
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t('stats.completed_requests')}
          value={stats.completedRequests}
          icon={CheckCircle}
        />
        <StatsCard
          title={t('stats.processing_requests')}
          value={stats.processingRequests}
          icon={Clock}
        />
        <StatsCard
          title={t('stats.validated_profiles')}
          value={stats.validatedProfiles}
          icon={Users}
        />
        <StatsCard
          title={t('stats.pending_profiles')}
          value={stats.pendingProfiles}
          icon={FileText}
        />
      </div>
    </div>
  );
}
