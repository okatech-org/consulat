import { useTranslations } from 'next-intl'
import { DashboardStats } from '@/actions/admin/dashboard'
import { StatsCard } from './stats-card'
import { Users, FileText, AlertCircle, CheckCircle } from 'lucide-react'

interface DashboardStatsProps {
  stats: DashboardStats
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const t = useTranslations('admin.dashboard')

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title={t('stats.total_profiles')}
        value={stats.totalProfiles}
        icon={Users}
        description={t('stats.active_profiles', { count: stats.activeProfiles })}
      />
      <StatsCard
        title={t('stats.pending_reviews')}
        value={stats.pendingReviews}
        icon={FileText}
        trend={{
          value: stats.reviewsTrend,
          isPositive: stats.reviewsTrend < 0
        }}
      />
      <StatsCard
        title={t('stats.expired_documents')}
        value={stats.expiredDocuments}
        icon={AlertCircle}
        description={t('stats.expiring_soon', { count: stats.expiringSoon })}
      />
      <StatsCard
        title={t('stats.validated_profiles')}
        value={stats.validatedProfiles}
        icon={CheckCircle}
        trend={{
          value: stats.validationTrend,
          isPositive: stats.validationTrend > 0
        }}
      />
    </div>
  )
}