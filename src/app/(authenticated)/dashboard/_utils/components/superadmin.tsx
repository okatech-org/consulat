import { StatsCard } from '@/components/ui/stats-card';
import { Building2, Globe, Settings, Users } from 'lucide-react';
import React from 'react';

export default async function SuperAdminDashboard() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard title="Pays" value={12} icon={Globe} />
      <StatsCard title="Organisations" value={45} icon={Building2} />
      <StatsCard title="Services" value={89} icon={Settings} />
      <StatsCard title="Utilisateurs" value={234} icon={Users} />
    </div>
  );
}
