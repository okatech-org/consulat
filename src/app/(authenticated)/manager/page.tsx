import { Suspense } from 'react'
import { getCurrentUser } from '@/actions/user'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import { getTranslations } from 'next-intl/server'
import { DashboardStats } from '@/app/(authenticated)/manager/_utils/components/dashboard/dashboard-stats'
import { PendingRequests } from '@/app/(authenticated)/manager/_utils/components/dashboard/pending-requests'
import { RecentActivity } from '@/app/(authenticated)/manager/_utils/components/dashboard/recent-activity'

export default async function ManagerDashboardPage() {
  const t = await getTranslations('manager.dashboard')
  const user = await getCurrentUser()

  if (!user) return null

  return (
    <div className="container space-y-8 py-8">
      <div>
        <h1 className="text-3xl font-bold">
          {t('welcome', { name: user.name })}
        </h1>
        <p className="text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <DashboardStats />
      </Suspense>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <PendingRequests />
        <RecentActivity />
      </div>
    </div>
  )
}