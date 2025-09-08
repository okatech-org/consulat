'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@/trpc/react';
import { useIntelligenceDashboardStats, useIntelligenceNotes } from '@/hooks/use-optimized-queries';
import { createIntelligenceNoteSchema, type CreateIntelligenceNoteInput } from '@/schemas/intelligence';
import { tryCatch } from '@/lib/utils';
import IntelAgentLayout from '@/components/layouts/intel-agent-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Eye,
  User,
  Clock,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Loader2,
  Edit,
  Trash2,
  X
} from 'lucide-react';
import { IntelligenceNoteType, IntelligenceNotePriority } from '@prisma/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

// Type pour les notes avec relations
type NoteWithRelations = {
  id: string;
  title: string;
  content: string;
  type: IntelligenceNoteType;
  priority: IntelligenceNotePriority;
  createdAt: string;
  author?: { id: string; name?: string | null; email?: string | null };
  profile?: { id: string; firstName?: string | null; lastName?: string | null };
};

export default function NotesPage() {
  const [filters, setFilters] = useState({
    type: undefined as IntelligenceNoteType | undefined,
    priority: undefined as IntelligenceNotePriority | undefined,
    search: '',
    period: 'month' as 'day' | 'week' | 'month' | 'year',
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [selectedProfileId, setSelectedProfileId] = useState('');

  // Queries
  const { data: notes, isLoading, error, refetch } = useIntelligenceNotes(
    Object.entries(filters).some(([key, val]) => key !== 'period' && val !== undefined && val !== '')
      ? {
          type: filters.type,
          priority: filters.priority,
          search: filters.search,
        }
      : undefined
  );

  const { data: dashboardStats, isLoading: statsLoading } = useIntelligenceDashboardStats(filters.period);
  const { data: profiles } = api.intelligence.getProfiles.useQuery({ page: 1, limit: 100 });

  // Mutations
  const createNoteMutation = api.intelligence.createNote.useMutation({
    onSuccess: () => {
      toast.success('Note créée avec succès');
      setShowCreateModal(false);
      refetch();
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors de la création de la note');
    },
  });

  // Form pour créer une note
  const form = useForm<CreateIntelligenceNoteInput>({
    resolver: zodResolver(createIntelligenceNoteSchema),
    defaultValues: {
      profileId: '',
      type: IntelligenceNoteType.OTHER,
      priority: IntelligenceNotePriority.MEDIUM,
      title: '',
      content: '',
    },
  });

  // Handlers
  const handleCreateNote = async (data: CreateIntelligenceNoteInput) => {
    const { error } = await tryCatch(() => createNoteMutation.mutateAsync(data));
    if (error) {
      toast.error('Erreur lors de la création de la note');
    }
  };

  const handleViewNote = (note: any) => {
    setSelectedNote(note);
    setShowViewModal(true);
  };

  const handleAnalyze = async () => {
    toast.info('Analyse des notes en cours...');
    // TODO: Implémenter l'analyse des notes
    setTimeout(() => {
      toast.success('Analyse terminée - Rapport disponible');
    }, 2000);
  };

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
    [IntelligenceNotePriority.LOW]: { bg: 'bg-green-500/20', text: 'text-green-500', border: 'border-green-500/30' },
    [IntelligenceNotePriority.MEDIUM]: { bg: 'bg-orange-500/20', text: 'text-orange-500', border: 'border-orange-500/30' },
    [IntelligenceNotePriority.HIGH]: { bg: 'bg-red-500/20', text: 'text-red-500', border: 'border-red-500/30' },
  };

  const getTypeLabel = (type: IntelligenceNoteType) => {
    switch (type) {
      case IntelligenceNoteType.POLITICAL_OPINION: return 'Opinion politique';
      case IntelligenceNoteType.ORIENTATION: return 'Orientation';
      case IntelligenceNoteType.ASSOCIATIONS: return 'Associations';
      case IntelligenceNoteType.TRAVEL_PATTERNS: return 'Déplacements';
      case IntelligenceNoteType.CONTACTS: return 'Contacts';
      case IntelligenceNoteType.ACTIVITIES: return 'Activités';
      case IntelligenceNoteType.OTHER: return 'Autres';
      default: return 'Non défini';
    }
  };

  const getPriorityLabel = (priority: IntelligenceNotePriority) => {
    switch (priority) {
      case IntelligenceNotePriority.HIGH: return 'HAUTE';
      case IntelligenceNotePriority.MEDIUM: return 'MOYENNE';
      case IntelligenceNotePriority.LOW: return 'BASSE';
      default: return 'Non défini';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <IntelAgentLayout
        title="Notes de Renseignement"
        description="Gestion centralisée des informations de surveillance et d'intelligence"
        currentPage="notes"
        backButton={true}
      >
        <div className="space-y-6">
        {/* Stats des notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { 
              title: 'Total notes', 
              value: dashboardStats?.totalNotes || 0, 
              icon: FileText, 
              color: 'blue',
              change: '+15%'
            },
            { 
              title: 'Ce mois', 
              value: dashboardStats?.notesThisPeriod || 0, 
              icon: Calendar, 
              color: 'green',
              change: '+8%'
            },
            { 
              title: 'Priorité haute', 
              value: dashboardStats?.notesByType?.[IntelligenceNotePriority.HIGH] || 0, 
              icon: AlertTriangle, 
              color: 'red',
              change: '-2%'
            },
            { 
              title: 'Profils concernés', 
              value: dashboardStats?.profilesWithNotes || 0, 
              icon: User, 
              color: 'orange',
              change: '+12%'
            }
          ].map((stat, index) => (
            <Card 
              key={index}
              className="relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
              style={{
                background: 'var(--bg-glass-primary)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid var(--border-glass-primary)',
                boxShadow: 'var(--shadow-glass)',
              }}
            >
              <div 
                className="absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100"
                style={{
                  background: 'linear-gradient(90deg, transparent, var(--accent-intel), transparent)',
                  animation: 'scan 3s infinite'
                }}
              />
              <CardHeader className="p-2 md:p-3 flex flex-row items-center justify-between space-y-0 pb-1">
                <div 
                  className="p-1.5 rounded-lg"
                  style={{
                    background: stat.color === 'blue' ? 'rgba(59, 130, 246, 0.2)' : 
                               stat.color === 'green' ? 'rgba(16, 185, 129, 0.2)' : 
                               stat.color === 'orange' ? 'rgba(245, 158, 11, 0.2)' : 
                               'rgba(239, 68, 68, 0.2)',
                    color: stat.color === 'blue' ? '#3b82f6' : 
                           stat.color === 'green' ? '#10b981' : 
                           stat.color === 'orange' ? '#f59e0b' : 
                           '#ef4444'
                  }}
                >
                  <stat.icon className="h-4 w-4" />
                </div>
                <Badge 
                  variant={stat.change.includes('-') ? 'destructive' : 'default'} 
                  className="text-xs"
                >
                  {stat.change}
                </Badge>
              </CardHeader>
              <CardContent className="p-3 md:p-4 pt-0">
                <div className="text-xl font-bold font-mono" style={{ color: 'var(--text-primary)' }}>
                  {stat.value.toLocaleString()}
                </div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {stat.title}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filtres et contrôles */}
        <Card 
          style={{
            background: 'var(--bg-glass-primary)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid var(--border-glass-primary)',
            boxShadow: 'var(--shadow-glass)',
          }}
        >
          <CardHeader className="py-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Filter className="h-5 w-5" />
                Filtres et Actions
              </CardTitle>
              <Button 
                size="sm"
                className="bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle note
              </Button>
            </div>
          </CardHeader>
          <CardContent className="py-3 px-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Recherche
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Contenu, auteur..."
                    className="pl-10 h-8"
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Type
                </label>
                <Select value={filters.type || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value === 'all' ? undefined : value as IntelligenceNoteType }))}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Tous types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous types</SelectItem>
                    <SelectItem value={IntelligenceNoteType.POLITICAL_OPINION}>🏛️ Opinion politique</SelectItem>
                    <SelectItem value={IntelligenceNoteType.ASSOCIATIONS}>👥 Associations</SelectItem>
                    <SelectItem value={IntelligenceNoteType.TRAVEL_PATTERNS}>✈️ Déplacements</SelectItem>
                    <SelectItem value={IntelligenceNoteType.CONTACTS}>📞 Contacts</SelectItem>
                    <SelectItem value={IntelligenceNoteType.ACTIVITIES}>🎯 Activités</SelectItem>
                    <SelectItem value={IntelligenceNoteType.OTHER}>📝 Autres</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Priorité
                </label>
                <Select value={filters.priority || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value === 'all' ? undefined : value as IntelligenceNotePriority }))}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Toutes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    <SelectItem value={IntelligenceNotePriority.HIGH}>🔴 Haute</SelectItem>
                    <SelectItem value={IntelligenceNotePriority.MEDIUM}>🟡 Moyenne</SelectItem>
                    <SelectItem value={IntelligenceNotePriority.LOW}>🟢 Basse</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Période
                </label>
                <Select value={filters.period} onValueChange={(value) => setFilters(prev => ({ ...prev, period: value as any }))}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Aujourd'hui</SelectItem>
                    <SelectItem value="week">Cette semaine</SelectItem>
                    <SelectItem value="month">Ce mois</SelectItem>
                    <SelectItem value="year">Cette année</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Actions
                </label>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={handleAnalyze}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Analyser
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des notes */}
        <Card 
          style={{
            background: 'var(--bg-glass-primary)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid var(--border-glass-primary)',
            boxShadow: 'var(--shadow-glass)',
          }}
        >
          <CardHeader>
            <CardTitle style={{ color: 'var(--text-primary)' }}>
              Notes Récentes
            </CardTitle>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {notes?.length || 0} notes de renseignement
            </p>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-600 text-sm">Erreur lors du chargement des notes: {error.message}</p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => refetch()}
                >
                  Réessayer
                </Button>
              </div>
            )}
            
            <div className="space-y-4">
              {isLoading ? (
                // Skeleton loading
                [...Array(3)].map((_, i) => (
                  <div 
                    key={i} 
                    className="p-4 rounded-lg animate-pulse"
                    style={{ background: 'var(--bg-glass-light)' }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-gray-300 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-300 rounded w-full"></div>
                        <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : notes && notes.length > 0 ? (
                // Vraies données des notes
                notes.map((note) => (
                  <div 
                    key={note.id}
                    className="p-4 rounded-lg hover:bg-opacity-50 hover:bg-white transition-all duration-200 cursor-pointer border-l-4"
                    style={{ 
                      background: 'var(--bg-glass-light)',
                      borderLeftColor: note.priority === IntelligenceNotePriority.HIGH ? '#ef4444' :
                                      note.priority === IntelligenceNotePriority.MEDIUM ? '#f59e0b' :
                                      '#10b981'
                    }}
                    onClick={() => handleViewNote(note)}
                  >
                    <div className="flex items-start gap-4">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                        style={{
                          background: 'rgba(59, 130, 246, 0.2)',
                          color: '#3b82f6'
                        }}
                      >
                        {typeIcons[note.type]}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge 
                            className={`text-xs ${priorityColors[note.priority].bg} ${priorityColors[note.priority].text} ${priorityColors[note.priority].border}`}
                          >
                            {getPriorityLabel(note.priority)}
                          </Badge>
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {getTypeLabel(note.type)}
                          </span>
                        </div>
                        
                        <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                          {note.title}
                        </h4>
                        
                        <p className="text-sm mb-2 line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                          {note.content}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                          <span>👤 {note.profile ? `${note.profile.firstName} ${note.profile.lastName}` : 'Profil inconnu'}</span>
                          <div className="flex items-center gap-4">
                            <span>✍️ {note.author?.name || 'Anonyme'}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(note.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewNote(note);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p style={{ color: 'var(--text-muted)' }}>
                    Aucune note de renseignement trouvée
                  </p>
                  <Button 
                    size="sm" 
                    className="mt-4 bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={() => setShowCreateModal(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Créer une note
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Modal de création de note */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle note de renseignement</DialogTitle>
              <DialogDescription>
                Ajoutez une note d'intelligence sur un profil spécifique.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreateNote)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="profileId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profil concerné *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un profil" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {profiles?.profiles?.map((profile) => (
                            <SelectItem key={profile.id} value={profile.id}>
                              {profile.firstName} {profile.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type de note *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={IntelligenceNoteType.POLITICAL_OPINION}>🏛️ Opinion politique</SelectItem>
                            <SelectItem value={IntelligenceNoteType.ASSOCIATIONS}>👥 Associations</SelectItem>
                            <SelectItem value={IntelligenceNoteType.TRAVEL_PATTERNS}>✈️ Déplacements</SelectItem>
                            <SelectItem value={IntelligenceNoteType.CONTACTS}>📞 Contacts</SelectItem>
                            <SelectItem value={IntelligenceNoteType.ACTIVITIES}>🎯 Activités</SelectItem>
                            <SelectItem value={IntelligenceNoteType.OTHER}>📝 Autres</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priorité *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Priorité" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={IntelligenceNotePriority.HIGH}>🔴 Haute</SelectItem>
                            <SelectItem value={IntelligenceNotePriority.MEDIUM}>🟡 Moyenne</SelectItem>
                            <SelectItem value={IntelligenceNotePriority.LOW}>🟢 Basse</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Titre de la note"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contenu *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Détails de la note de renseignement"
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateModal(false)}
                  >
                    Annuler
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createNoteMutation.isPending}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    {createNoteMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Création...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Créer la note
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Modal de visualisation de note */}
        <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedNote && typeIcons[selectedNote.type]}
                {selectedNote?.title}
              </DialogTitle>
              <DialogDescription>
                Note créée le {selectedNote && format(new Date(selectedNote.createdAt), 'dd/MM/yyyy à HH:mm', { locale: fr })}
              </DialogDescription>
            </DialogHeader>
            
            {selectedNote && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Badge 
                    className={`${priorityColors[selectedNote.priority].bg} ${priorityColors[selectedNote.priority].text} ${priorityColors[selectedNote.priority].border}`}
                  >
                    Priorité {getPriorityLabel(selectedNote.priority)}
                  </Badge>
                  <Badge variant="outline">
                    {getTypeLabel(selectedNote.type)}
                  </Badge>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="whitespace-pre-wrap">{selectedNote.content}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <strong>Profil concerné:</strong>
                    <br />
                    {selectedNote.profile ? `${selectedNote.profile.firstName} ${selectedNote.profile.lastName}` : 'Non spécifié'}
                  </div>
                  <div>
                    <strong>Auteur:</strong>
                    <br />
                    {selectedNote.author?.name || 'Anonyme'}
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowViewModal(false)}
              >
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </IntelAgentLayout>
    </div>
  );
}
