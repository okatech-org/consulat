import { StatsCard } from '@/components/ui/stats-card'
import { Building2, Globe, Settings, Users } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { auth } from '@/auth'

export default async function SuperAdminDashboard() {
  const session = await auth()
  const t = await getTranslations('superadmin')

  return (
    <div className="container space-y-8 py-8">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">
          {t('welcome', { name: session?.user.name })}
        </h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Pays"
            value={12}
            icon={Globe}
          />
          <StatsCard
            title="Organisations"
            value={45}
            icon={Building2}
          />
          <StatsCard
            title="Services"
            value={89}
            icon={Settings}
          />
          <StatsCard
            title="Utilisateurs"
            value={234}
            icon={Users}
          />
        </div>
      </div>
    </div>
  )
}