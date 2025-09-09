'use client';

import { useState, useMemo, useEffect } from 'react';
import { api } from '@/trpc/react';
import { useIntelligenceDashboardStats } from '@/hooks/use-optimized-queries';
import IntelAgentLayout from '@/components/layouts/intel-agent-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { createIntelligenceNote } from '@/actions/intelligence';
import { IntelligenceNoteType, IntelligenceNotePriority } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import {
  Users, 
  Search, 
  Filter, 
  Eye,
  MapPin,
  Calendar,
  FileText,
  AlertTriangle,
  User,
  Phone,
  Mail,
  Flag,
  Download,
  RefreshCw,
  Edit,
  MoreHorizontal
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { ProfileCategory, Gender, RequestStatus } from '@prisma/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { ProfilesArrayItem, ProfilesFilters } from '@/components/profile/types';
import { useTableSearchParams } from '@/hooks/use-table-search-params';
import { useCurrentUser } from '@/hooks/use-role-data';
import { AdvancedPagination, PaginationInfo, usePaginationInfo } from '@/components/ui/advanced-pagination';
import { AdvancedFilters, type IntelligenceFilters } from '@/components/intelligence/advanced-filters';

function adaptSearchParams(searchParams: URLSearchParams): ProfilesFilters {
  const params = {
    ...(searchParams.get('search') && { search: searchParams.get('search') }),
    ...(searchParams.get('status') && {
      status: searchParams.get('status')?.split(',').filter(Boolean) as
        | RequestStatus[]
        | undefined,
    }),
    ...(searchParams.get('category') && {
      category: searchParams.get('category')?.split(',').filter(Boolean) as
        | ProfileCategory[]
        | undefined,
    }),
    ...(searchParams.get('gender') && {
      gender: searchParams.get('gender')?.split(',').filter(Boolean) as
        | Gender[]
        | undefined,
    }),
    ...(searchParams.get('organizationId') && {
      organizationId: searchParams.get('organizationId')?.split(',').filter(Boolean) as
        | string[]
        | undefined,
    }),
  } as ProfilesFilters;

  return params;
}

export default function ProfilesPage() {
  const t = useTranslations();
  const router = useRouter();
  const { user } = useCurrentUser();
  
  // États pour les interactions utilisateur
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [selectedProfileForNote, setSelectedProfileForNote] = useState<string | null>(null);
  const [newNote, setNewNote] = useState({ title: '', content: '', type: 'GENERAL' as IntelligenceNoteType, priority: 'MEDIUM' as IntelligenceNotePriority });
  
  // État pour les filtres avancés
  const [intelligenceFilters, setIntelligenceFilters] = useState<IntelligenceFilters>({});
  
  // État local pour pagination sécurisée
  const [localPagination, setLocalPagination] = useState({
    pageIndex: 0,
    pageSize: 15
  });
  
  const {
    params,
    pagination,
    sorting,
    handleParamsChange,
    handlePaginationChange,
    handleSortingChange,
  } = useTableSearchParams<ProfilesArrayItem, ProfilesFilters>(adaptSearchParams);

  // Utiliser la pagination locale si celle du hook est invalide
  const safePagination = {
    pageIndex: !isNaN(pagination?.pageIndex || 0) ? (pagination?.pageIndex || 0) : localPagination.pageIndex,
    pageSize: !isNaN(pagination?.pageSize || 0) && (pagination?.pageSize || 0) > 0 ? (pagination?.pageSize || 15) : localPagination.pageSize
  };
  
  // Adapter les filtres intelligence aux filtres API
  const adaptIntelligenceFilters = (filters: IntelligenceFilters): ProfilesFilters => {
    const apiFilters: any = {
      search: filters.search,
      category: filters.category,
      status: filters.status,
      gender: filters.gender,
      // Ajouter d'autres mappings selon les capacités de l'API
      ...(filters.hasNotes && { hasIntelligenceNotes: true }),
      ...(filters.hasChildren && { hasChildren: true }),
    };
    
    // Gérer les filtres d'âge
    if (filters.minorOnly) {
      apiFilters.ageMax = 17; // Moins de 18 ans
    }
    if (filters.adultOnly) {
      apiFilters.ageMin = 18; // 18 ans et plus
      apiFilters.ageMax = 59; // Moins de 60 ans
    }
    if (filters.ageGroups?.includes('senior')) {
      apiFilters.ageMin = 60; // 60 ans et plus
    }
    if (filters.ageRange) {
      apiFilters.ageMin = filters.ageRange[0];
      apiFilters.ageMax = filters.ageRange[1];
    }
    
    // Gérer les filtres de nationalité
    // Note: dualNationality n'est pas supporté dans le schéma actuel
    // if (filters.dualNationality) {
    //   apiFilters.hasDualNationality = true;
    // }
    if (filters.nationality) {
      apiFilters.nationality = filters.nationality;
    }
    
    // Gérer les filtres de surveillance
    if (filters.riskLevel) {
      apiFilters.riskLevel = filters.riskLevel;
    }
    if (filters.surveillanceStatus) {
      apiFilters.surveillanceStatus = filters.surveillanceStatus;
    }
    if (filters.flagged) {
      apiFilters.flagged = true;
    }
    if (filters.vip) {
      apiFilters.vip = true;
    }
    if (filters.sensitive) {
      apiFilters.sensitive = true;
    }
    
    // Gérer les filtres de localisation
    if (filters.city) {
      apiFilters.city = filters.city;
    }
    if (filters.region) {
      apiFilters.region = filters.region;
    }
    if (filters.hasCoordinates) {
      apiFilters.hasCoordinates = true;
    }
    
    // Gérer le nombre d'enfants
    if (filters.childrenCount) {
      apiFilters.childrenCountMin = filters.childrenCount.min;
      apiFilters.childrenCountMax = filters.childrenCount.max;
    }
    
    return apiFilters;
  };
  
  // Combiner les filtres des params URL et les filtres intelligence
  const combinedFilters = {
    ...params,
    ...adaptIntelligenceFilters(intelligenceFilters)
  };

  // Récupérer les données avec les paramètres de recherche
  const { data: profilesResponse, isLoading, error, refetch } = api.profile.getList.useQuery({
    page: Math.max(1, safePagination.pageIndex + 1),
    limit: safePagination.pageSize,
    sort: sorting && sorting.length > 0 ? {
      field: sorting[0]?.id as any,
      order: sorting[0]?.desc ? 'desc' : 'asc',
    } : { field: 'createdAt', order: 'desc' },
    search: combinedFilters?.search || undefined,
    status: combinedFilters?.status || undefined,
    category: combinedFilters?.category || undefined,
    gender: combinedFilters?.gender || undefined,
    organizationId: combinedFilters?.organizationId || undefined,
  });
  
  // Mutation pour créer une note d'intelligence
  const createNoteMutation = api.intelligence.createNote?.useMutation?.({
    onSuccess: () => {
      toast.success('Note d\'intelligence ajoutée avec succès');
      setNoteDialogOpen(false);
      setNewNote({ title: '', content: '', type: 'GENERAL', priority: 'MEDIUM' });
      setSelectedProfileForNote(null);
      refetch(); // Rafraîchir les données
    },
    onError: (error) => {
      toast.error('Erreur lors de l\'ajout de la note: ' + error.message);
    },
  }) || null;

  const { data: dashboardStats } = useIntelligenceDashboardStats('month');

  // Fonction pour calculer l'âge à partir de la date de naissance
  const calculateAge = (birthDate: Date | string | null | undefined): number | null => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) return null;
    
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };
  
  // Filtrer les profils côté client pour s'assurer de la cohérence des âges
  const filteredProfiles = useMemo(() => {
    let items = profilesResponse?.items || [];
    
    // Appliquer le filtre d'âge côté client si nécessaire
    if (intelligenceFilters.minorOnly) {
      items = items.filter(profile => {
        const age = calculateAge(profile.birthDate);
        return age !== null && age < 18;
      });
    }
    
    if (intelligenceFilters.adultOnly) {
      items = items.filter(profile => {
        const age = calculateAge(profile.birthDate);
        return age !== null && age >= 18 && age < 60;
      });
    }
    
    if (intelligenceFilters.ageGroups?.includes('senior')) {
      items = items.filter(profile => {
        const age = calculateAge(profile.birthDate);
        return age !== null && age >= 60;
      });
    }
    
    if (intelligenceFilters.ageRange) {
      const [minAge, maxAge] = intelligenceFilters.ageRange;
      items = items.filter(profile => {
        const age = calculateAge(profile.birthDate);
        return age !== null && age >= minAge && age <= maxAge;
      });
    }
    
    return items;
  }, [profilesResponse?.items, intelligenceFilters]);
  
  const profiles = filteredProfiles;
  const total = profilesResponse?.total || 0;
  
  // Calculer les informations de pagination
  const currentPage = safePagination.pageIndex + 1;
  const itemsPerPage = safePagination.pageSize;
  const paginationInfo = usePaginationInfo(currentPage, itemsPerPage, total, profiles.length);

  const hasIntelligenceNotes = (profile: any) => {
    return profile.intelligenceNotes && profile.intelligenceNotes.length > 0;
  };
  
  // Fonctions utilitaires
  const handleSelectProfile = (profileId: string, checked: boolean) => {
    if (checked) {
      setSelectedProfiles(prev => [...prev, profileId]);
    } else {
      setSelectedProfiles(prev => prev.filter(id => id !== profileId));
    }
  };
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProfiles(profiles.map(p => p.id));
    } else {
      setSelectedProfiles([]);
    }
  };
  
  // Fonction de rafraîchissement
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success('Données actualisées avec succès');
    } catch (error) {
      toast.error('Erreur lors de l\'actualisation');
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Fonction d'export
  const handleExport = async () => {
    if (selectedProfiles.length === 0) {
      toast.error('Veuillez sélectionner au moins un profil à exporter');
      return;
    }
    
    setIsExporting(true);
    try {
      // Simuler l'export - à remplacer par la vraie logique
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Créer le CSV
      const selectedData = profiles.filter(p => selectedProfiles.includes(p.id));
      const csvContent = exportToCSV(selectedData);
      downloadCSV(csvContent, 'profils_intelligence.csv');
      
      toast.success(`${selectedProfiles.length} profils exportés avec succès`);
      setSelectedProfiles([]);
    } catch (error) {
      toast.error('Erreur lors de l\'export');
    } finally {
      setIsExporting(false);
    }
  };
  
  // Fonction pour ouvrir le dialog d'ajout de note
  const handleAddNote = (profileId: string) => {
    setSelectedProfileForNote(profileId);
    setNoteDialogOpen(true);
  };
  
  // Fonction pour soumettre la note
  const handleSubmitNote = async () => {
    if (!selectedProfileForNote || !newNote.title.trim() || !newNote.content.trim()) {
      toast.error('Veuillez remplir tous les champs requis');
      return;
    }
    
    setIsAddingNote(true);
    try {
      if (createNoteMutation) {
        await createNoteMutation.mutateAsync({
          profileId: selectedProfileForNote,
          title: newNote.title,
          content: newNote.content,
          type: newNote.type,
          priority: newNote.priority,
        });
      } else {
        // Fallback à l'action serveur si la mutation n'est pas disponible
        await createIntelligenceNote({
          profileId: selectedProfileForNote,
          title: newNote.title,
          content: newNote.content,
          type: newNote.type,
          priority: newNote.priority,
        });
        toast.success('Note d\'intelligence ajoutée avec succès');
        setNoteDialogOpen(false);
        setNewNote({ title: '', content: '', type: 'GENERAL', priority: 'MEDIUM' });
        setSelectedProfileForNote(null);
        refetch();
      }
    } catch (error: any) {
      toast.error('Erreur lors de l\'ajout de la note: ' + (error.message || 'Erreur inconnue'));
    } finally {
      setIsAddingNote(false);
    }
  };
  
  // Fonctions utilitaires pour l'export CSV
  const exportToCSV = (data: any[]) => {
    const headers = ['ID', 'Prénom', 'Nom', 'Email', 'Téléphone', 'Catégorie', 'Statut', 'Pays', 'Ville', 'Notes Intelligence'];
    const rows = data.map(profile => [
      profile.cardNumber || profile.id.substring(0, 8),
      profile.firstName || '',
      profile.lastName || '',
      profile.user?.email || '',
      profile.phoneNumber || '',
      profile.category || '',
      profile.status || '',
      profile.address?.country || '',
      profile.address?.city || '',
      profile.intelligenceNotes?.length || 0
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };
  
  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Fonction pour gérer le changement de page
  const handlePageChange = (page: number) => {
    const newPageIndex = page - 1; // Convertir en index 0-based
    setLocalPagination(prev => ({ ...prev, pageIndex: newPageIndex }));
    handlePaginationChange && handlePaginationChange({ pageIndex: newPageIndex });
    
    // Défiler vers le haut pour une meilleure UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const profilesWithNotes = profiles.filter(p => hasIntelligenceNotes(p));
  const newProfilesThisMonth = profiles.filter(p => {
    const createdAt = new Date(p.createdAt);
    const now = new Date();
    return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
  });

  const getCategoryBadge = (category: ProfileCategory) => {
    switch (category) {
      case ProfileCategory.CITIZEN:
        return { text: 'Citoyen', color: 'bg-blue-500/20 text-blue-500 border-blue-500/30' };
      case ProfileCategory.RESIDENT:
        return { text: 'Résident', color: 'bg-green-500/20 text-green-500 border-green-500/30' };
      case ProfileCategory.VISITOR:
        return { text: 'Visiteur', color: 'bg-orange-500/20 text-orange-500 border-orange-500/30' };
      default:
        return { text: 'Non défini', color: 'bg-gray-500/20 text-gray-500 border-gray-500/30' };
    }
  };

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.SUBMITTED:
        return { text: 'Soumis', color: 'bg-blue-500/20 text-blue-500' };
      case RequestStatus.PENDING:
        return { text: 'En attente', color: 'bg-orange-500/20 text-orange-500' };
      case RequestStatus.VALIDATED:
        return { text: 'Validé', color: 'bg-green-500/20 text-green-500' };
      case RequestStatus.REJECTED:
        return { text: 'Rejeté', color: 'bg-red-500/20 text-red-500' };
      case RequestStatus.COMPLETED:
        return { text: 'Terminé', color: 'bg-green-500/20 text-green-500' };
      default:
        return { text: 'Inconnu', color: 'bg-gray-500/20 text-gray-500' };
    }
  };

          return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      <IntelAgentLayout
        title="Profils Intelligence"
        description="Base de données complète des profils sous surveillance"
        currentPage="profiles"
        backButton={false}
      >
        <div className="space-y-6">
        {/* Stats rapides */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {[
            { 
              title: 'Total profils', 
              value: total, 
              icon: Users, 
              color: 'blue',
              change: '+5.2%'
            },
            { 
              title: 'Avec renseignements', 
              value: profilesWithNotes.length, 
              icon: FileText, 
              color: 'green',
              change: '+12.8%'
            },
            { 
              title: 'Nouveaux ce mois', 
              value: newProfilesThisMonth.length, 
              icon: Calendar, 
              color: 'orange',
              change: '+8.4%'
            },
            { 
              title: 'Surveillance active', 
              value: dashboardStats?.profilesWithNotes || profilesWithNotes.length, 
              icon: Eye, 
              color: 'red',
              change: '+15.1%'
            }
          ].map((stat, index) => (
            <Card 
              key={index}
              className="relative overflow-hidden group hover:-translate-y-1 transition-all duration-300"
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
                Recherche et Filtres
              </CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  {isRefreshing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  {isRefreshing ? 'Actualisation...' : 'Actualiser'}
                </Button>
                <Button 
                  size="sm" 
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={handleExport}
                  disabled={isExporting || selectedProfiles.length === 0}
                >
                  {isExporting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  {isExporting ? 'Export...' : `Export ${selectedProfiles.length > 0 ? `(${selectedProfiles.length})` : ''}`}
                </Button>
                </div>
            </div>
          </CardHeader>
          <CardContent className="py-3 px-4">
            {/* Barre de sélection si des profils sont sélectionnés */}
            {selectedProfiles.length > 0 && (
              <div className="mb-4 p-3 rounded-lg" style={{ background: 'var(--bg-glass-light)', border: '1px solid var(--border-glass-secondary)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {selectedProfiles.length} profil(s) sélectionné(s)
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setSelectedProfiles([])}>
                      Désélectionner tout
                    </Button>
                    <Button 
                      size="sm" 
                      disabled={selectedProfiles.length !== 1}
                      onClick={() => {
                        if (selectedProfiles.length === 1) {
                          handleAddNote(selectedProfiles[0]);
                        }
                      }}
                    >
                      Ajouter note
                    </Button>
                  </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <span>Modification rapide</span>
                </TooltipContent>
              </Tooltip>

              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{t('common.actions.edit')}</DialogTitle>
                </DialogHeader>
                <QuickEditForm profile={row.original} onSuccess={() => refetch()} />
              </DialogContent>
            </Dialog>
          </div>
        ),
      },
    ];

    // Pour les agents de renseignement, on ne garde que certaines colonnes
    if (isIntelAgent) {
      return baseColumns
        .filter((column) => {
          const columnId = column.id || (column as any).accessorKey;
          return [
            'id',
            'cardNumber',
            'IDPicture',
            'lastName',
            'firstName',
            'category',
            'status',
            'email',
            'cardPin',
            'gender',
            'cardIssuedAt',
            'cardExpiresAt',
            'actions',
          ].includes(columnId);
        })
        .map((column) => {
          // Modifier la colonne actions pour les agents de renseignement
          if (column.id === 'actions') {
            return {
              ...column,
              cell: ({ row }: { row: { original: ProfilesArrayItem } }) => (
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="w-full sm:w-auto"
                      >
                        <Link href={ROUTES.dashboard.profile(row.original.id)}>
                          <Eye className="size-icon" />
                          <span className="hidden sm:inline ml-2">Voir le profil</span>
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span>Voir le profil</span>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            )}
            
            {/* Filtres avancés de renseignement */}
            <AdvancedFilters
              filters={intelligenceFilters}
              onFiltersChange={(newFilters) => {
                setIntelligenceFilters(newFilters);
                // Synchroniser avec les params URL pour certains filtres
                if (newFilters.search !== intelligenceFilters.search) {
                  handleParamsChange({ search: newFilters.search });
                }
                if (newFilters.category !== intelligenceFilters.category) {
                  handleParamsChange({ category: newFilters.category });
                }
                if (newFilters.gender !== intelligenceFilters.gender) {
                  handleParamsChange({ gender: newFilters.gender });
                }
                if (newFilters.status !== intelligenceFilters.status) {
                  handleParamsChange({ status: newFilters.status });
                }
                // Réinitialiser la pagination lors du changement de filtres
                setLocalPagination(prev => ({ ...prev, pageIndex: 0 }));
              }}
              totalProfiles={total}
              className="mb-4"
            />
          </CardContent>
        </Card>

        {/* Liste des profils avec design glass */}
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <CardTitle style={{ color: 'var(--text-primary)' }}>
                    Profils Surveillés
                  </CardTitle>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {total.toLocaleString()} profils au total
                  </p>
                </div>
                {profiles.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedProfiles.length === profiles.length && profiles.length > 0}
                      onCheckedChange={handleSelectAll}
                      className="opacity-60"
                    />
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Tout sélectionner
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  Avec notes: {profilesWithNotes.length}
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Nouveaux: {newProfilesThisMonth.length}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              // Skeleton loading avec glass effect - Format cartes
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(9)].map((_, i) => (
                  <Card
                    key={i} 
                    className="animate-pulse border-l-4"
                    style={{ 
                      background: 'var(--bg-glass-primary)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      border: '1px solid var(--border-glass-primary)',
                      borderLeftColor: 'var(--border-glass-secondary)'
                    }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded mt-1"></div>
                        <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <div className="h-5 w-16 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                        <div className="h-5 w-14 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                      </div>
                      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-3 gap-2">
                          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {profiles.map((profile, index) => {
                  const categoryStyle = getCategoryBadge(profile.category);
                  const statusStyle = getStatusBadge(profile.status);
                  const hasNotes = hasIntelligenceNotes(profile);
                  const isNewThisMonth = newProfilesThisMonth.some(p => p.id === profile.id);
                  
                  return (
                    <Card 
                      key={profile.id}
                      className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border-l-4"
                      style={{ 
                        background: 'var(--bg-glass-primary)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        border: '1px solid var(--border-glass-primary)',
                        boxShadow: 'var(--shadow-glass)',
                        borderLeftColor: hasNotes ? '#3b82f6' : 
                                        isNewThisMonth ? '#10b981' :
                                        'var(--border-glass-primary)'
                      }}
                    >
                      {/* Barre de scan animée */}
                      <div 
                        className="absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100"
                        style={{
                          background: 'linear-gradient(90deg, transparent, var(--accent-intel), transparent)',
                          animation: 'scan 3s infinite'
                        }}
                      />
                      
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <Checkbox 
                              checked={selectedProfiles.includes(profile.id)}
                              onCheckedChange={(checked) => handleSelectProfile(profile.id, checked as boolean)}
                              onClick={(e) => e.stopPropagation()}
                              className="mt-1"
                            />
                            <Avatar className="w-12 h-12">
                              {profile.IDPictureUrl ? (
                                <AvatarImage src={profile.IDPictureUrl} alt={`${profile.firstName} ${profile.lastName}`} />
                              ) : (
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-amber-500 text-white font-semibold">
                                  {profile.firstName?.[0]}{profile.lastName?.[0]}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                                  {profile.firstName} {profile.lastName}
                                </h3>
                                {isNewThisMonth && (
                                  <Badge className="text-xs bg-green-500/20 text-green-500 border-green-500/30">
                                    NOUVEAU
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                                ID: {profile.cardNumber || profile.id.substring(0, 8).toUpperCase()}
                                {profile.birthDate && (
                                  <span className="ml-2 font-sans">
                                    • {calculateAge(profile.birthDate)} ans
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          
                          {hasNotes && (
                            <Badge className="text-xs bg-orange-500/20 text-orange-500 border-orange-500/30">
                              <AlertTriangle className="h-3 w-3" />
                            </Badge>
                          )}
                        </div>
                        
                        {/* Badges statut et catégorie */}
                        <div className="flex items-center gap-2 mt-3">
                          <Badge className={`text-xs ${categoryStyle.color}`}>
                            {categoryStyle.text}
                          </Badge>
                          <Badge className={`text-xs ${statusStyle.color}`}>
                            {statusStyle.text}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Informations de contact */}
                        <div className="space-y-2">
                          {profile.user?.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3" style={{ color: 'var(--text-muted)' }} />
                              <p className="text-xs truncate" style={{ color: 'var(--text-primary)' }}>
                                {profile.user.email}
                              </p>
                            </div>
                          )}
                          {profile.phoneNumber && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3" style={{ color: 'var(--text-muted)' }} />
                              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                {profile.phoneNumber}
                              </p>
                            </div>
                          )}
                          {profile.address && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3" style={{ color: 'var(--text-muted)' }} />
                              <p className="text-xs" style={{ color: 'var(--text-primary)' }}>
                                {profile.address.city}, {profile.address.country}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Informations de surveillance */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" style={{ color: 'var(--text-muted)' }} />
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                              Inscrit le {format(new Date(profile.createdAt), 'dd/MM/yyyy', { locale: fr })}
                            </p>
                          </div>
                          
                          {hasNotes ? (
                            <div className="flex items-center gap-2">
                              <Eye className="h-3 w-3" style={{ color: 'var(--text-muted)' }} />
                              <Badge className="text-xs bg-blue-500/20 text-blue-500 border-blue-500/30">
                                {profile.intelligenceNotes?.length || 0} note(s) de surveillance
                              </Badge>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Eye className="h-3 w-3" style={{ color: 'var(--text-muted)' }} />
                              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                Aucune note de surveillance
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Actions principales - Bien visibles */}
                        <div className="pt-3 border-t" style={{ borderColor: 'var(--border-glass-secondary)' }}>
                          <div className="grid grid-cols-3 gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-8 bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20 text-blue-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/dashboard/profiles/${profile.id}`);
                              }}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Voir
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-8 bg-green-500/10 border-green-500/30 hover:bg-green-500/20 text-green-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddNote(profile.id);
                              }}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Note
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-8 bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20 text-orange-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProfiles([profile.id]);
                                handleExport();
                              }}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Export
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
          )}

            {!isLoading && profiles.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p style={{ color: 'var(--text-muted)' }}>
                  Aucun profil trouvé avec ces critères
                </p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => handleParamsChange({})}>
                  Réinitialiser les filtres
                </Button>
              </div>
            )}
            
            {/* Gestion des erreurs */}
            {error && (
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                <p className="text-red-500 mb-4">
                  Erreur lors du chargement des profils
                </p>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Réessayer
                </Button>
              </div>
            )}

            {/* Indicateurs de chargement supplémentaire */}
            {!isLoading && profiles.length > 0 && total > profiles.length && (
              <div className="text-center py-6">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const newPageIndex = safePagination.pageIndex + 1;
                    setLocalPagination({ pageIndex: newPageIndex, pageSize: safePagination.pageSize });
                    handlePaginationChange && handlePaginationChange({ pageIndex: newPageIndex });
                  }}
                  className="bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Charger plus de profils ({total - profiles.length} restants)
                </Button>
            </div>
          )}

            {/* Pagination avancée */}
            {total > 0 && paginationInfo.totalPages > 1 && (
              <div className="mt-6 pt-6 space-y-4" style={{ borderTop: '1px solid var(--border-glass-secondary)' }}>
                {/* Informations de pagination */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <PaginationInfo
                      currentPage={currentPage}
                      totalPages={paginationInfo.totalPages}
                      totalItems={total}
                      itemsPerPage={itemsPerPage}
                      currentItemsCount={profiles.length}
                      className="text-sm text-muted-foreground"
                    />
                    
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <span style={{ color: 'var(--text-muted)' }}>
                          Surveillance: {profilesWithNotes.length}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span style={{ color: 'var(--text-muted)' }}>
                          Nouveaux: {newProfilesThisMonth.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contrôles de pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                    <span>Affichage:</span>
                    <select 
                      value={itemsPerPage}
                      onChange={(e) => {
                        const newPageSize = parseInt(e.target.value);
                        setLocalPagination(prev => ({ ...prev, pageSize: newPageSize, pageIndex: 0 }));
                        handlePaginationChange && handlePaginationChange({ pageSize: newPageSize, pageIndex: 0 });
                      }}
                      className="px-2 py-1 rounded border text-sm"
                      style={{
                        background: 'var(--bg-glass-light)',
                        border: '1px solid var(--border-glass-secondary)',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span>par page</span>
                  </div>

                  <AdvancedPagination
                    currentPage={currentPage}
                    totalPages={paginationInfo.totalPages}
                    onPageChange={handlePageChange}
                    maxVisiblePages={7}
                    size="sm"
                    disabled={isLoading}
                    className="flex-shrink-0"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
        
        {/* Dialog pour ajouter une note d'intelligence */}
        <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Ajouter une note d'intelligence</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Titre de la note</label>
                <Input
                  placeholder="Titre de la note..."
                  value={newNote.title}
                  onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <Select 
                    value={newNote.type} 
                    onValueChange={(value) => setNewNote(prev => ({ ...prev, type: value as IntelligenceNoteType }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GENERAL">Général</SelectItem>
                      <SelectItem value="SECURITY">Sécurité</SelectItem>
                      <SelectItem value="FINANCIAL">Financier</SelectItem>
                      <SelectItem value="TRAVEL">Voyage</SelectItem>
                      <SelectItem value="CONTACT">Contact</SelectItem>
                      <SelectItem value="FAMILY">Famille</SelectItem>
                      <SelectItem value="PROFESSIONAL">Professionnel</SelectItem>
                      <SelectItem value="BEHAVIORAL">Comportemental</SelectItem>
                      <SelectItem value="OTHER">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priorité</label>
                  <Select 
                    value={newNote.priority} 
                    onValueChange={(value) => setNewNote(prev => ({ ...prev, priority: value as IntelligenceNotePriority }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">🟢 Faible</SelectItem>
                      <SelectItem value="MEDIUM">🟡 Moyenne</SelectItem>
                      <SelectItem value="HIGH">🟠 Élevée</SelectItem>
                      <SelectItem value="CRITICAL">🔴 Critique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Contenu de la note</label>
                <Textarea
                  placeholder="Détails de la note d'intelligence..."
                  value={newNote.content}
                  onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                  rows={6}
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setNoteDialogOpen(false)}
                  disabled={isAddingNote}
                >
                  Annuler
                </Button>
                <Button 
                  onClick={handleSubmitNote}
                  disabled={isAddingNote || !newNote.title.trim() || !newNote.content.trim()}
                >
                  {isAddingNote ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Ajout en cours...
                    </>
                  ) : (
                    'Ajouter la note'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </IntelAgentLayout>
    </div>
  );
}
