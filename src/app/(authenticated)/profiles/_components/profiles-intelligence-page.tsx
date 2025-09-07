'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { api } from '@/trpc/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import { Search, Users, FileText, Eye, Filter } from 'lucide-react';
import { IntelligenceNoteType, IntelligenceNotePriority } from '@prisma/client';
import { type ColumnDef } from '@tanstack/react-table';

interface ProfileWithIntelligence {
  id: string;
  firstName: string | null;
  lastName: string | null;
  birthDate: Date | null;
  birthCountry: string | null;
  nationality: string | null;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  intelligenceNotes: Array<{
    id: string;
    type: IntelligenceNoteType;
    priority: IntelligenceNotePriority;
    title: string;
    createdAt: Date;
  }>;
  _count: {
    intelligenceNotes: number;
  };
}

const typeIcons = {
  [IntelligenceNoteType.POLITICAL_OPINION]: '🏛️',
  [IntelligenceNoteType.ORIENTATION]: '🧭',
  [IntelligenceNoteType.ASSOCIATIONS]: '👥',
  [IntelligenceNoteType.TRAVEL_PATTERNS]: '✈️',
  [IntelligenceNoteType.CONTACTS]: '📞',
  [IntelligenceNoteType.ACTIVITIES]: '🎯',
  [IntelligenceNoteType.OTHER]: '📝',
};

const priorityColors = {
  [IntelligenceNotePriority.LOW]: 'bg-green-100 text-green-800',
  [IntelligenceNotePriority.MEDIUM]: 'bg-yellow-100 text-yellow-800',
  [IntelligenceNotePriority.HIGH]: 'bg-orange-100 text-orange-800',
  [IntelligenceNotePriority.CRITICAL]: 'bg-red-100 text-red-800',
};

export function ProfilesIntelligencePage() {
  const t = useTranslations('intelligence.profiles');
  const router = useRouter();
  const [filters, setFilters] = useState({
    search: '',
    hasNotes: undefined as boolean | undefined,
    nationality: '',
    birthCountry: '',
  });

  const { data, isLoading } = api.intelligence.getProfiles.useQuery({
    page: 1,
    limit: 50,
    filters: Object.keys(filters).some(
      (key) =>
        filters[key as keyof typeof filters] !== undefined &&
        filters[key as keyof typeof filters] !== '',
    )
      ? filters
      : undefined,
  });

  const clearFilters = () => {
    setFilters({
      search: '',
      hasNotes: undefined,
      nationality: '',
      birthCountry: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== '',
  );

  const columns: ColumnDef<ProfileWithIntelligence>[] = [
    {
      accessorKey: 'name',
      header: 'Nom',
      cell: ({ row }) => {
        const profile = row.original;
        return (
          <div className="flex items-center gap-2">
            <div>
              <div className="font-medium">
                {profile.firstName} {profile.lastName}
              </div>
              {profile.user?.email && (
                <div className="text-sm text-muted-foreground">{profile.user.email}</div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'birthDate',
      header: 'Date de naissance',
      cell: ({ row }) => {
        const date = row.original.birthDate;
        return date ? new Date(date).toLocaleDateString('fr-FR') : '-';
      },
    },
    {
      accessorKey: 'birthCountry',
      header: 'Pays de naissance',
      cell: ({ row }) => row.original.birthCountry || '-',
    },
    {
      accessorKey: 'nationality',
      header: 'Nationalité',
      cell: ({ row }) => row.original.nationality || '-',
    },
    {
      accessorKey: 'intelligenceNotes',
      header: 'Notes de renseignement',
      cell: ({ row }) => {
        const notes = row.original.intelligenceNotes;
        const count = row.original._count.intelligenceNotes;

        if (count === 0) {
          return <Badge variant="outline">Aucune note</Badge>;
        }

        return (
          <div className="space-y-1">
            <Badge variant="secondary">
              {count} note{count > 1 ? 's' : ''}
            </Badge>
            {notes.slice(0, 2).map((note) => (
              <div key={note.id} className="flex items-center gap-1 text-xs">
                <span>{typeIcons[note.type]}</span>
                <Badge className={priorityColors[note.priority]} variant="outline">
                  {note.priority === 'LOW' && 'Faible'}
                  {note.priority === 'MEDIUM' && 'Moyenne'}
                  {note.priority === 'HIGH' && 'Élevée'}
                  {note.priority === 'CRITICAL' && 'Critique'}
                </Badge>
              </div>
            ))}
            {count > 2 && (
              <div className="text-xs text-muted-foreground">
                +{count - 2} autre{count - 2 > 1 ? 's' : ''}
              </div>
            )}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const profile = row.original;
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/profiles/${profile.id}`)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Consulter
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">
            Consultation des profils gabonais et gestion des notes de renseignement
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {data?.pagination.total || 0} profils
          </span>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des profils</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.pagination.total || 0}</div>
            <p className="text-xs text-muted-foreground">Profils gabonais</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profils avec notes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.profiles.filter((p) => p._count.intelligenceNotes > 0).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Avec notes de renseignement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de couverture</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.pagination.total
                ? (
                    (data.profiles.filter((p) => p._count.intelligenceNotes > 0).length /
                      data.pagination.total) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Taux de couverture</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Recherche</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nom, prénom..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes de renseignement</label>
              <Select
                value={filters.hasNotes?.toString() || 'all'}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    hasNotes: value === 'all' ? undefined : value === 'true',
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les profils</SelectItem>
                  <SelectItem value="true">{t('hasNotes')}</SelectItem>
                  <SelectItem value="false">{t('noNotes')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Nationalité</label>
              <Input
                placeholder="Ex: GA"
                value={filters.nationality}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, nationality: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Pays de naissance</label>
              <Input
                placeholder="Ex: Gabon"
                value={filters.birthCountry}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, birthCountry: e.target.value }))
                }
              />
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={clearFilters}>
                Effacer les filtres
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tableau des profils */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des profils</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Chargement des profils...</div>
            </div>
          ) : data?.profiles && data.profiles.length > 0 ? (
            <DataTable
              columns={columns}
              data={data.profiles}
              toolbar={<DataTableToolbar table={undefined as any} />}
              pagination={<DataTablePagination table={undefined as any} />}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Aucun profil trouvé</p>
              <p className="text-sm">
                {hasActiveFilters
                  ? 'Aucun profil ne correspond aux filtres sélectionnés.'
                  : "Aucun profil n'est disponible."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
