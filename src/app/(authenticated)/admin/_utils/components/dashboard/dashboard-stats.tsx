import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { FileText, Users, Clock, CheckCircle } from 'lucide-react';

export function DashboardStats() {
  const t = useTranslations('manager.dashboard');

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title={t('stats.pending_requests')}
        value="12"
        icon={<FileText className="size-4 text-muted-foreground" />}
        description={t('stats.pending_description')}
      />

      <StatsCard
        title={t('stats.active_users')}
        value="45"
        icon={<Users className="size-4 text-muted-foreground" />}
        description={t('stats.users_description')}
      />

      <StatsCard
        title={t('stats.processing_time')}
        value="2.5j"
        icon={<Clock className="size-4 text-muted-foreground" />}
        description={t('stats.time_description')}
      />

      <StatsCard
        title={t('stats.completed_requests')}
        value="89"
        icon={<CheckCircle className="size-4 text-muted-foreground" />}
        description={t('stats.completed_description')}
      />
    </div>
  );
}

function StatsCard({
  title,
  value,
  icon,
  description,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
