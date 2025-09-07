'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { api } from '@/trpc/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter, FileText } from 'lucide-react';
import { IntelligenceNoteType, IntelligenceNotePriority } from '@prisma/client';
import { IntelligenceNoteCard } from './intelligence-note-card';
import { IntelligenceNoteForm } from './intelligence-note-form';

interface IntelligenceNotesSectionProps {
  profileId: string;
  currentUserId: string;
}

export function IntelligenceNotesSection({
  profileId,
  currentUserId,
}: IntelligenceNotesSectionProps) {
  const t = useTranslations('intelligence.notes');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    type: undefined as IntelligenceNoteType | undefined,
    priority: undefined as IntelligenceNotePriority | undefined,
  });

  const {
    data: notes,
    isLoading,
    refetch,
  } = api.intelligence.getIntelligenceNotes.useQuery({
    profileId,
    filters: Object.keys(filters).some(
      (key) =>
        filters[key as keyof typeof filters] !== undefined &&
        filters[key as keyof typeof filters] !== '',
    )
      ? filters
      : undefined,
  });

  const handleAddSuccess = () => {
    setIsAddingNote(false);
    refetch();
  };

  const handleEditSuccess = () => {
    refetch();
  };

  const handleDeleteSuccess = () => {
    refetch();
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      type: undefined,
      priority: undefined,
    });
  };

  const hasActiveFilters = filters.search || filters.type || filters.priority;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('title')}
          </CardTitle>
          <Button onClick={() => setIsAddingNote(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {t('add')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtres */}
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher dans les notes..."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              className="pl-10"
            />
          </div>

          <Select
            value={filters.type || 'all'}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                type: value === 'all' ? undefined : (value as IntelligenceNoteType),
              }))
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous types</SelectItem>
              <SelectItem value="POLITICAL_OPINION">Opinion politique</SelectItem>
              <SelectItem value="ORIENTATION">Orientation</SelectItem>
              <SelectItem value="ASSOCIATIONS">Associations</SelectItem>
              <SelectItem value="TRAVEL_PATTERNS">Habitudes de voyage</SelectItem>
              <SelectItem value="CONTACTS">Contacts</SelectItem>
              <SelectItem value="ACTIVITIES">Activités</SelectItem>
              <SelectItem value="OTHER">Autre</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.priority || 'all'}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                priority:
                  value === 'all' ? undefined : (value as IntelligenceNotePriority),
              }))
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Priorité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes priorités</SelectItem>
              <SelectItem value="LOW">Faible</SelectItem>
              <SelectItem value="MEDIUM">Moyenne</SelectItem>
              <SelectItem value="HIGH">Élevée</SelectItem>
              <SelectItem value="CRITICAL">Critique</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <Filter className="h-4 w-4 mr-1" />
              Effacer
            </Button>
          )}
        </div>

        {/* Formulaire d'ajout */}
        {isAddingNote && (
          <IntelligenceNoteForm
            profileId={profileId}
            onSuccess={handleAddSuccess}
            onCancel={() => setIsAddingNote(false)}
          />
        )}

        {/* Liste des notes */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : notes && notes.length > 0 ? (
          <div className="space-y-4">
            {notes.map((note) => (
              <IntelligenceNoteCard
                key={note.id}
                note={note}
                onEdit={handleEditSuccess}
                onDelete={handleDeleteSuccess}
                showHistory={true}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Aucune note de renseignement</p>
            <p className="text-sm">
              {hasActiveFilters
                ? 'Aucune note ne correspond aux filtres sélectionnés.'
                : "Aucune note de renseignement n'a été ajoutée à ce profil."}
            </p>
            {!hasActiveFilters && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsAddingNote(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter la première note
              </Button>
            )}
          </div>
        )}

        {/* Statistiques */}
        {notes && notes.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <Badge variant="secondary">
              {notes.length} note{notes.length > 1 ? 's' : ''}
            </Badge>
            {Object.entries(
              notes.reduce(
                (acc, note) => {
                  acc[note.type] = (acc[note.type] || 0) + 1;
                  return acc;
                },
                {} as Record<string, number>,
              ),
            ).map(([type, count]) => (
              <Badge key={type} variant="outline">
                {type === 'POLITICAL_OPINION' && 'Opinion politique'}
                {type === 'ORIENTATION' && 'Orientation'}
                {type === 'ASSOCIATIONS' && 'Associations'}
                {type === 'TRAVEL_PATTERNS' && 'Habitudes de voyage'}
                {type === 'CONTACTS' && 'Contacts'}
                {type === 'ACTIVITIES' && 'Activités'}
                {type === 'OTHER' && 'Autre'}: {count}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
