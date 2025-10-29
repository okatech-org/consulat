'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
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
import { Search, Filter, FileText } from 'lucide-react';
import { IntelligenceNoteType, IntelligenceNotePriority } from '@/convex/lib/constants';
import { IntelligenceNoteCard } from './intelligence-note-card';
import { IntelligenceNoteForm } from './intelligence-note-form';

interface IntelligenceNotesSectionProps {
  profileId: string;
  currentUserId: string;
  allowDelete?: boolean;
}

export function IntelligenceNotesSection({
  profileId,
  currentUserId,
  allowDelete = false,
}: IntelligenceNotesSectionProps) {
  const t = useTranslations('intelligence.notes');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    type: undefined as IntelligenceNoteType | undefined,
    priority: undefined as IntelligenceNotePriority | undefined,
  });

  // Écouter l'événement personnalisé pour ouvrir le formulaire d'ajout
  useEffect(() => {
    const handleAddNote = (event: CustomEvent) => {
      if (event.detail?.profileId === profileId) {
        setIsAddingNote(true);
      }
    };

    window.addEventListener('addIntelligenceNote', handleAddNote as EventListener);
    return () => {
      window.removeEventListener('addIntelligenceNote', handleAddNote as EventListener);
    };
  }, [profileId]);

  const notes = useQuery(api.functions.intelligence.getIntelligenceNotes, {
    filters: {
      profileId: profileId as any,
      ...(Object.keys(filters).some(
        (key) =>
          filters[key as keyof typeof filters] !== undefined &&
          filters[key as keyof typeof filters] !== '',
      )
        ? {
            type: filters.type,
            priority: filters.priority,
            search: filters.search,
          }
        : {}),
    },
  });
  const isLoading = notes === undefined;

  const handleAddSuccess = () => {
    setIsAddingNote(false);
  };

  const handleEditSuccess = () => {
    // Convex auto-refetches
  };

  const handleDeleteSuccess = () => {
    // Convex auto-refetches
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
    <div className="space-y-4 h-full flex flex-col" data-section="renseignements">
      {/* Filtres */}
      <div className="space-y-3">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
            style={{ color: 'var(--text-muted)' }}
          />
          <Input
            placeholder={t('filters.search')}
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            className="pl-10"
            style={{
              background: 'var(--bg-glass-light)',
              border: '1px solid var(--border-glass-secondary)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Select
            value={filters.type || 'all'}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                type: value === 'all' ? undefined : (value as IntelligenceNoteType),
              }))
            }
          >
            <SelectTrigger
              className="w-full sm:w-[180px]"
              style={{
                background: 'var(--bg-glass-light)',
                border: '1px solid var(--border-glass-secondary)',
                color: 'var(--text-primary)',
              }}
            >
              <SelectValue placeholder={t('filters.type')} />
            </SelectTrigger>
            <SelectContent
              style={{
                background: 'var(--bg-glass-primary)',
                border: '1px solid var(--border-glass-primary)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}
            >
              <SelectItem value="all">{t('filters.allTypes')}</SelectItem>
              <SelectItem value="POLITICAL_OPINION">
                {t('types.political_opinion')}
              </SelectItem>
              <SelectItem value="ORIENTATION">{t('types.orientation')}</SelectItem>
              <SelectItem value="ASSOCIATIONS">{t('types.associations')}</SelectItem>
              <SelectItem value="TRAVEL_PATTERNS">
                {t('types.travel_patterns')}
              </SelectItem>
              <SelectItem value="CONTACTS">{t('types.contacts')}</SelectItem>
              <SelectItem value="ACTIVITIES">{t('types.activities')}</SelectItem>
              <SelectItem value="OTHER">{t('types.other')}</SelectItem>
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
            <SelectTrigger
              className="w-full sm:w-[180px]"
              style={{
                background: 'var(--bg-glass-light)',
                border: '1px solid var(--border-glass-secondary)',
                color: 'var(--text-primary)',
              }}
            >
              <SelectValue placeholder={t('filters.priority')} />
            </SelectTrigger>
            <SelectContent
              style={{
                background: 'var(--bg-glass-primary)',
                border: '1px solid var(--border-glass-primary)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}
            >
              <SelectItem value="all">{t('filters.allPriorities')}</SelectItem>
              <SelectItem value="LOW">{t('priorities.low')}</SelectItem>
              <SelectItem value="MEDIUM">{t('priorities.medium')}</SelectItem>
              <SelectItem value="HIGH">{t('priorities.high')}</SelectItem>
              <SelectItem value="CRITICAL">{t('priorities.critical')}</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="w-full sm:w-auto"
            >
              <Filter className="h-4 w-4 mr-1" />
              {t('filters.clear')}
            </Button>
          )}
        </div>
      </div>

      {/* Formulaire d'ajout */}
      {isAddingNote && (
        <IntelligenceNoteForm
          profileId={profileId}
          onSuccess={handleAddSuccess}
          onCancel={() => setIsAddingNote(false)}
        />
      )}

      {/* Liste des notes - Prend l'espace disponible */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse p-4 rounded-xl"
                style={{
                  background: 'var(--bg-glass-light)',
                  border: '1px solid var(--border-glass-secondary)',
                }}
              >
                <div
                  className="h-4 rounded w-3/4 mb-2"
                  style={{ background: 'var(--border-glass-secondary)' }}
                ></div>
                <div
                  className="h-3 rounded w-1/2 mb-3"
                  style={{ background: 'var(--border-glass-secondary)' }}
                ></div>
                <div
                  className="h-8 rounded"
                  style={{ background: 'var(--border-glass-secondary)' }}
                ></div>
              </div>
            ))}
          </div>
        ) : notes && notes.length > 0 ? (
          <div className="space-y-1">
            {notes.map((note) => (
              <IntelligenceNoteCard
                key={note.id}
                note={note}
                onEdit={handleEditSuccess}
                onDelete={handleDeleteSuccess}
                showHistory={true}
                currentUserId={currentUserId}
                allowDelete={allowDelete}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">{t('emptyTitle')}</p>
            <p className="text-sm">
              {hasActiveFilters ? t('emptyFiltered') : t('emptyDescription')}
            </p>
          </div>
        )}
      </div>

      {/* Statistiques */}
      {notes && notes.length > 0 && (
        <div
          className="flex flex-wrap gap-2 pt-4"
          style={{ borderTop: '1px solid var(--border-glass-secondary)' }}
        >
          <Badge variant="secondary">{t('count', { count: notes.length })}</Badge>
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
              {t(`types.${type.toLowerCase()}`)}: {count}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
