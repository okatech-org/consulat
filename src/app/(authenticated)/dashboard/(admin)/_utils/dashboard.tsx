import { getTranslations } from 'next-intl/server';
import { StatsCard } from '@/components/ui/stats-card';
import { FileText, Users, CheckCircle, Clock } from 'lucide-react';
import { getAdminStats } from './actions/dashboard';
import { tryCatch } from '@/lib/utils';
export default async function AdminDashboard() {
  const t = await getTranslations('admin.dashboard');

  const { data: stats } = await tryCatch(getAdminStats());

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title={t('stats.completed_requests')}
        value={stats?.completedRequests ?? 0}
        icon={CheckCircle}
      />
      <StatsCard
        title={t('stats.processing_requests')}
        value={stats?.processingRequests ?? 0}
        icon={Clock}
      />
      <StatsCard
        title={t('stats.validated_profiles')}
        value={stats?.validatedProfiles ?? 0}
        icon={Users}
      />
      <StatsCard
        title={t('stats.pending_profiles')}
        value={stats?.pendingProfiles ?? 0}
        icon={FileText}
      />
    </div>
  );
}
