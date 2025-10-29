'use client';

import { useTranslations } from 'next-intl';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  FileText,
  TrendingUp,
  AlertTriangle,
  Building,
  Navigation,
  Plane,
  Phone,
  Target,
} from 'lucide-react';
import { IntelligenceNoteType } from '@/convex/lib/constants';
import { useState } from 'react';

interface DashboardIntelligenceStatsProps {
  period?: 'day' | 'week' | 'month' | 'year';
}

const typeIcons = {
  [IntelligenceNoteType.POLITICAL_OPINION]: <Building className="h-3 w-3" />,
  [IntelligenceNoteType.ORIENTATION]: <Navigation className="h-3 w-3" />,
  [IntelligenceNoteType.ASSOCIATIONS]: <Users className="h-3 w-3" />,
  [IntelligenceNoteType.TRAVEL_PATTERNS]: <Plane className="h-3 w-3" />,
  [IntelligenceNoteType.CONTACTS]: <Phone className="h-3 w-3" />,
  [IntelligenceNoteType.ACTIVITIES]: <Target className="h-3 w-3" />,
  [IntelligenceNoteType.OTHER]: <FileText className="h-3 w-3" />,
};

export function DashboardIntelligenceStats({
  period: initialPeriod = 'month',
}: DashboardIntelligenceStatsProps) {
  const t = useTranslations('intelligence.dashboard.stats');
  const [period, setPeriod] = useState(initialPeriod);

  const stats = useQuery(api.functions.intelligence.getDashboardStats, { period });
  const isLoading = stats === undefined;

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 bg-muted animate-pulse rounded w-24"></div>
              </CardTitle>
              <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted animate-pulse rounded w-16 mb-1"></div>
              <div className="h-3 bg-muted animate-pulse rounded w-20"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Impossible de charger les statistiques.</p>
      </div>
    );
  }

  const statsCards = [
    {
      title: t('totalProfiles'),
      value: stats.totalProfiles.toLocaleString(),
      description: 'Total des profils gabonais',
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: t('profilesWithNotes'),
      value: stats.profilesWithNotes.toLocaleString(),
      description: `${((stats.profilesWithNotes / stats.totalProfiles) * 100).toFixed(1)}% des profils`,
      icon: FileText,
      color: 'text-green-600',
    },
    {
      title: t('notesThisMonth'),
      value: stats.notesThisPeriod.toLocaleString(),
      description: `Notes créées cette ${period === 'day' ? 'jour' : period === 'week' ? 'semaine' : period === 'month' ? 'mois' : 'année'}`,
      icon: TrendingUp,
      color: 'text-orange-600',
    },
    {
      title: 'Taux de couverture',
      value: `${((stats.profilesWithNotes / stats.totalProfiles) * 100).toFixed(1)}%`,
      description: 'Profils avec renseignements',
      icon: AlertTriangle,
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
          Statistiques des Renseignements
        </h2>
        <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Période" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Aujourd&apos;hui</SelectItem>
            <SelectItem value="week">Cette semaine</SelectItem>
            <SelectItem value="month">Ce mois</SelectItem>
            <SelectItem value="year">Cette année</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {stats.recentNotes && stats.recentNotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Notes récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentNotes.map((note, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{typeIcons[note.type]}</span>
                    <div>
                      <p className="text-sm font-medium">{note.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {note.profile.firstName} {note.profile.lastName} •{' '}
                        {note.author.name}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {new Date(note.createdAt).toLocaleDateString('fr-FR')}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
