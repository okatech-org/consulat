'use client';

import { PageContainer } from '@/components/layouts/page-container';
import { StatsCard } from '@/components/ui/stats-card';
import { useSuperAdminData } from '@/hooks/use-role-data';
import { Building2, Globe, Settings, Users } from 'lucide-react';

export default function SuperAdminDashboard() {
  const data = useSuperAdminData();

  return (
    <PageContainer title="Tableau de bord">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Pays"
          value={data.superAdminStats.totalCountries}
          icon={Globe}
        />
        <StatsCard
          title="Organisations"
          value={data.superAdminStats.totalOrganizations}
          icon={Building2}
        />
        <StatsCard
          title="Services"
          value={data.superAdminStats.totalServices}
          icon={Settings}
        />
        <StatsCard
          title="Utilisateurs"
          value={data.superAdminStats.totalUsers}
          icon={Users}
        />
      </div>
    </PageContainer>
  );
}
