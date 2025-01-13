import { getTranslations } from 'next-intl/server'
import { DashboardStats } from '@/app/(authenticated)/manager/_utils/components/dashboard-stats'
import { RequestsQueue } from '@/app/(authenticated)/manager/_utils/components/requests-queue'
import { ImportantAlerts } from '@/app/(authenticated)/manager/_utils/components/important-alerts'

export default async function ManagerDashboard() {
  const t = await getTranslations('manager.dashboard')

  return (
    <div className="container space-y-8">
      <h1 className="text-3xl font-bold">{t('title')}</h1>

      <DashboardStats />

      <div className="grid gap-6 md:grid-cols-2">
        <RequestsQueue />
        <ImportantAlerts />
      </div>
    </div>
  )
}