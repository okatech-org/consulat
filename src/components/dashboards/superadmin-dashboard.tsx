'use client';

import { PageContainer } from '@/components/layouts/page-container';
import { StatsCard } from '@/components/ui/stats-card';
import { useDashboard } from '@/hooks/use-dashboard';
import type { SuperAdminStats } from '@/server/api/routers/dashboard/types';
import { Building2, Globe, Settings, Users } from 'lucide-react';

export default function SuperAdminDashboard() {
  const { data: superAdminStats } = useDashboard<SuperAdminStats>();

  return (
    <PageContainer title="Tableau de bord">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Pays"
          value={superAdminStats?.totalCountries || 0}
          icon={Globe}
        />
        <StatsCard
          title="Organisations"
          value={superAdminStats?.totalOrganizations || 0}
          icon={Building2}
        />
        <StatsCard
          title="Services"
          value={superAdminStats?.totalServices || 0}
          icon={Settings}
        />
        <StatsCard
          title="Utilisateurs"
          value={superAdminStats?.totalUsers || 0}
          icon={Users}
        />
      </div>
    </PageContainer>
  );
}
