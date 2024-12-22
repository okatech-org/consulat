import { Suspense } from 'react'
import { getCurrentUser } from '@/actions/user'
import { DashboardStats } from '@/components/admin/dashboard/dashboard-stats'
import { RecentActivity } from '@/components/admin/dashboard/recent-activity'
import { PendingTasks } from '@/components/admin/dashboard/pending-tasks'
import { getTranslations } from 'next-intl/server'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import { getDashboardStats } from '@/actions/admin/dashboard'

export default async function AdminDashboardPage() {
  const t = await getTranslations('admin.dashboard')
  const [current, stats] = await Promise.all([
    getCurrentUser(),
    getDashboardStats()
  ])

  if (!current) {
    return null
  }

  return (
    <div className="container space-y-8 py-8">
      <div>
        <h1 className="text-3xl font-bold">
          {t('welcome', { name: current.name })}
        </h1>
        <p className="text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <DashboardStats stats={stats} />
      </Suspense>

      <div className="grid grid-cols-2 gap-4">
        <RecentActivity activities={[]} />

        <PendingTasks tasks={[]} />
      </div>
    </div>
  )
}