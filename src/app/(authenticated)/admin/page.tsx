// src/app/(admin)/admin/page.tsx
import { getCurrentUser } from '@/actions/user'
import { DashboardStats } from '@/components/admin/dashboard-stats'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AdminDashboardPage() {
  const current = await getCurrentUser()

  if (!current) {
    return null
  }

  return (
    <div className="container">
      <h1 className="text-3xl font-bold mb-8">
        Tableau de bord administrateur
      </h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardStats />
      </div>

      <div className="grid gap-4 mt-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Liste des activités récentes */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Demandes en attente</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Liste des demandes en attente */}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}