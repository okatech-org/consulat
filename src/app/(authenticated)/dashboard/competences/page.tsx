'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  useSkillsDirectory,
  useProfileCV,
  useSkillsStatistics,
} from '@/hooks/use-competences';
import type { Id } from '@/convex/_generated/dataModel';
import IntelAgentLayout from '@/components/layouts/intel-agent-layout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  BookOpen,
  Search,
  Filter,
  Download,
  RefreshCw,
  Loader2,
  Users,
  TrendingUp,
  Award,
  Building,
  Wrench,
  Briefcase,
  Target,
  BarChart3,
  Eye,
  AlertTriangle,
  FileUser,
  Mail,
  Phone,
  MapPin,
  Zap,
  Grid3x3,
  List,
  UserSearch,
  BriefcaseIcon,
  TrendingDown,
  MessageCircle,
  Palette,
  Globe,
  HelpCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { WorkStatus } from '@/convex/lib/constants';

// Types pour les catégories de compétences
type SkillCategory =
  | 'technique'
  | 'management'
  | 'communication'
  | 'creative'
  | 'analytical'
  | 'language'
  | 'other';
type ExpertiseLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

// Mapping des icônes par catégorie
const categoryIcons: Record<SkillCategory, any> = {
  technique: Wrench,
  management: Briefcase,
  communication: MessageCircle,
  creative: Palette,
  analytical: BarChart3,
  language: Globe,
  other: HelpCircle,
};

// Couleurs par catégorie
const categoryColors: Record<SkillCategory, string> = {
  technique: 'bg-blue-500',
  management: 'bg-purple-500',
  communication: 'bg-green-500',
  creative: 'bg-orange-500',
  analytical: 'bg-yellow-500',
  language: 'bg-red-500',
  other: 'bg-gray-500',
};

// Labels français pour les catégories
const categoryLabels: Record<SkillCategory, string> = {
  technique: 'Technique',
  management: 'Management',
  communication: 'Communication',
  creative: 'Créatif',
  analytical: 'Analytique',
  language: 'Langues',
  other: 'Autre',
};

// Labels français pour les niveaux
const levelLabels: Record<ExpertiseLevel, string> = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Avancé',
  expert: 'Expert',
};

// Labels français pour les statuts
const workStatusLabels: Record<WorkStatus, string> = {
  employee: 'Employé',
  self_employed: 'Travailleur indépendant',
  entrepreneur: 'Entrepreneur',
  student: 'Étudiant',
  retired: 'Retraité',
  unemployed: "Ressortissant gabonais à la recherche d'emploi",
  other: 'Autre',
};

export default function CompetencesDirectoryPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | ''>('');
  const [selectedLevel, setSelectedLevel] = useState<ExpertiseLevel | ''>('');
  const [selectedDemand, setSelectedDemand] = useState<'high' | 'medium' | 'low' | ''>(
    '',
  );
  const [selectedWorkStatus, setSelectedWorkStatus] = useState<WorkStatus | ''>('');
  const [selectedProfiles, setSelectedProfiles] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showOnlyComplete, setShowOnlyComplete] = useState(false);
  const [selectedProfileForCV, setSelectedProfileForCV] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [sortBy] = useState<'name' | 'profession' | 'updatedAt' | 'marketDemand'>(
    'updatedAt',
  );
  const [sortOrder] = useState<'asc' | 'desc'>('desc');
  const [activeTab, setActiveTab] = useState('all');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    debouncedSearchTerm,
    selectedCategory,
    selectedLevel,
    selectedDemand,
    selectedWorkStatus,
    showOnlyComplete,
    activeTab,
  ]);

  // Appliquer les filtres selon l'onglet actif
  useEffect(() => {
    switch (activeTab) {
      case 'jobSeekers':
        setSelectedWorkStatus(WorkStatus.Unemployed);
        break;
      case 'employed':
        // Réinitialiser pour montrer tous sauf UNEMPLOYED
        setSelectedWorkStatus('');
        break;
      case 'highDemand':
        setSelectedDemand('high');
        break;
      case 'all':
      default:
        // Ne pas réinitialiser automatiquement les filtres
        break;
    }
  }, [activeTab]);

  // Récupérer les données avec Convex
  const directoryDataRaw = useSkillsDirectory({
    search: debouncedSearchTerm || undefined,
    category: selectedCategory || undefined,
    level: selectedLevel || undefined,
    marketDemand: selectedDemand || undefined,
    workStatus: selectedWorkStatus || undefined,
    hasCompleteProfile: showOnlyComplete || undefined,
    page: currentPage,
    limit: pageSize,
    sortBy,
    sortOrder,
  });

  const isLoading = directoryDataRaw === undefined;
  const isFetching = false;
  const error = null;
  const refetch = () => {};

  // Adapter les données au format attendu par la page
  const directoryData = useMemo(() => {
    if (!directoryDataRaw) return undefined;

    const profiles = directoryDataRaw.items.map((item) => ({
      id: item.id,
      firstName: item.firstName,
      lastName: item.lastName,
      profession: item.profession,
      employer: item.employer,
      workStatus: item.workStatus,
      email: item.email,
      phoneNumber: item.phoneNumber,
      address: item.address,
      user: undefined,
      skills: {
        category: item.skillCategory,
        experienceLevel: item.expertiseLevel,
        marketDemand: item.marketDemand,
        primarySkills: [],
        cvSummary: `${item.firstName} ${item.lastName} - ${item.profession}`,
      },
    }));

    return {
      profiles,
      total: directoryDataRaw.pagination.total,
      totalPages: directoryDataRaw.pagination.totalPages,
      pagination: directoryDataRaw.pagination,
      statistics: {
        totalProfiles: directoryDataRaw.stats.totalProfiles,
        jobSeekers: 0,
        completionRate: 85,
        totalUniqueSkills: Object.values(directoryDataRaw.stats.byCategory).reduce(
          (a: number, b: number) => a + b,
          0,
        ),
        categoryDistribution: directoryDataRaw.stats.byCategory,
        marketDemandDistribution: directoryDataRaw.stats.byMarketDemand,
        topSkills: [],
      },
    };
  }, [directoryDataRaw]);

  // Récupérer le CV d'un profil sélectionné
  const profileCVData = useProfileCV(selectedProfileForCV as Id<'profiles'> | null);

  // Adapter le CV au format attendu
  const profileCV = useMemo(() => {
    if (!profileCVData) return undefined;

    const age = profileCVData.personal.birthDate
      ? Math.floor(
          (Date.now() - profileCVData.personal.birthDate) / (1000 * 60 * 60 * 24 * 365),
        )
      : undefined;

    return {
      personal: {
        fullName:
          `${profileCVData.personal.firstName || ''} ${profileCVData.personal.lastName || ''}`.trim(),
        age,
        email: profileCVData.contacts.email,
        phone: profileCVData.contacts.phoneNumber,
      },
      summary: profileCVData.cv.summary,
      professional: {
        title: profileCVData.professional.profession,
        employer: profileCVData.professional.employer,
        experienceLevel: profileCVData.skills.level,
      },
      skills: {
        primary: [],
        secondary: [],
        suggested: [],
      },
      indicators: {
        marketDemand: profileCVData.skills.marketDemand,
        profileCompleteness: 85,
      },
    };
  }, [profileCVData]);

  // Récupérer les statistiques pour le Gabon
  const gabonStatsRaw = useSkillsStatistics();
  const gabonStats = useMemo(() => {
    if (!gabonStatsRaw) return undefined;
    return {
      totalJobSeekers: gabonStatsRaw.unemployedCount,
      ...gabonStatsRaw,
    };
  }, [gabonStatsRaw]);

  // Filtrer les profils selon la sélection
  const filteredProfiles = useMemo(() => {
    return directoryData?.profiles || [];
  }, [directoryData]);

  // Calculer les statistiques par onglet
  const tabStats = useMemo(() => {
    if (!directoryData?.statistics)
      return { all: 0, jobSeekers: 0, employed: 0, highDemand: 0 };
    return {
      all: directoryData.total,
      jobSeekers: directoryData.statistics.jobSeekers,
      employed: directoryData.total - directoryData.statistics.jobSeekers,
      highDemand: directoryData.statistics.marketDemandDistribution.high || 0,
    };
  }, [directoryData]);

  // Gérer la sélection des profils
  const handleSelectProfile = (profileId: string) => {
    setSelectedProfiles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(profileId)) {
        newSet.delete(profileId);
      } else {
        newSet.add(profileId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedProfiles.size === filteredProfiles.length) {
      setSelectedProfiles(new Set());
    } else {
      setSelectedProfiles(new Set(filteredProfiles.map((p) => p.id)));
    }
  };

  // Export CSV amélioré
  const handleExportCSV = useCallback(async () => {
    setIsExporting(true);
    try {
      const selectedData =
        selectedProfiles.size > 0
          ? filteredProfiles.filter((p) => selectedProfiles.has(p.id))
          : filteredProfiles;

      if (selectedData.length === 0) {
        toast.warning('Aucun profil à exporter');
        return;
      }

      const csv = [
        [
          'Nom',
          'Prénom',
          'Profession',
          'Employeur',
          'Statut',
          'Catégorie',
          'Niveau',
          'Email',
          'Téléphone',
          'Demande du marché',
        ],
        ...selectedData.map((p) => [
          p?.lastName || '',
          p?.firstName || '',
          p?.profession || '',
          p?.employer || '',
          p?.workStatus ? workStatusLabels[p.workStatus] : '',
          p?.skills?.category ? categoryLabels[p.skills.category as SkillCategory] : '',
          p?.skills?.experienceLevel
            ? levelLabels[p.skills.experienceLevel as ExpertiseLevel]
            : '',
          p?.email || '',
          p?.phoneNumber || '',
          p?.skills?.marketDemand === 'high'
            ? 'Élevée'
            : p?.skills?.marketDemand === 'medium'
              ? 'Moyenne'
              : 'Faible',
        ]),
      ];

      const csvContent =
        '\ufeff' + csv.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `competences-gabon-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      toast.success(`${selectedData.length} profils exportés avec succès`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Erreur lors de l'export des données");
    } finally {
      setIsExporting(false);
    }
  }, [selectedProfiles, filteredProfiles]);

  // Afficher le CV modal
  const handleShowCV = (profileId: string) => {
    setSelectedProfileForCV(profileId);
  };

  if (error) {
    return (
      <IntelAgentLayout title="Annuaire des Compétences DGSS" currentPage="competences">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4">
                <AlertTriangle className="h-12 w-12 text-red-500" />
                <h3 className="text-lg font-semibold">Erreur de chargement</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Impossible de charger l&apos;annuaire des compétences
                </p>
                <Button onClick={() => refetch()} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Réessayer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </IntelAgentLayout>
    );
  }

  return (
    <IntelAgentLayout
      title="Annuaire des Compétences DGSS"
      description="Exploitation des compétences gabonaises pour le développement national"
      currentPage="competences"
      backButton={true}
    >
      <div className="space-y-6">
        {/* Header avec statistiques globales */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-primary" />
              Annuaire des Compétences
            </h1>
            <p className="text-muted-foreground">
              {directoryData?.total || 0} profils professionnels gabonais •{' '}
              {gabonStats?.totalJobSeekers || 0} en recherche d&apos;emploi
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isLoading || isFetching}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            <Button
              onClick={handleExportCSV}
              disabled={isExporting}
              variant={selectedProfiles.size > 0 ? 'default' : 'outline'}
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Exporter {selectedProfiles.size > 0 ? `(${selectedProfiles.size})` : 'tout'}
            </Button>
          </div>
        </div>

        {/* Statistiques */}
        {directoryData?.statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Profils</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {directoryData.statistics.totalProfiles}
                </div>
                <p className="text-xs text-muted-foreground">
                  {Math.round(directoryData.statistics.completionRate)}% complets
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Compétences Uniques</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {directoryData.statistics.totalUniqueSkills}
                </div>
                <p className="text-xs text-muted-foreground">
                  Identifiées automatiquement
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Demande Élevée</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {directoryData.statistics.marketDemandDistribution.high}
                </div>
                <p className="text-xs text-muted-foreground">Profils recherchés</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Top Catégorie</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Object.entries(directoryData.statistics.categoryDistribution).sort(
                    ([, a], [, b]) => b - a,
                  )[0]?.[0] || 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">Secteur dominant</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Onglets de navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Tous ({tabStats.all})
            </TabsTrigger>
            <TabsTrigger value="jobSeekers" className="flex items-center gap-2">
              <UserSearch className="h-4 w-4" />
              Recherche d&apos;emploi ({tabStats.jobSeekers})
            </TabsTrigger>
            <TabsTrigger value="employed" className="flex items-center gap-2">
              <BriefcaseIcon className="h-4 w-4" />
              En poste ({tabStats.employed})
            </TabsTrigger>
            <TabsTrigger value="highDemand" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Forte demande ({tabStats.highDemand})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6 space-y-6">
            {/* Filtres avancés */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtres de recherche
                </CardTitle>
                <CardDescription>
                  Affinez votre recherche pour identifier les talents gabonais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                  <div className="relative lg:col-span-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Nom, profession, employeur..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  <Select
                    value={selectedCategory}
                    onValueChange={(v) =>
                      setSelectedCategory(v === 'all' ? '' : (v as SkillCategory))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes catégories</SelectItem>
                      <Separator className="my-1" />
                      {Object.entries(categoryLabels).map(([key, label]) => {
                        const Icon = categoryIcons[key as SkillCategory];
                        return (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedLevel}
                    onValueChange={(v) =>
                      setSelectedLevel(v === 'all' ? '' : (v as ExpertiseLevel))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Niveau d'expertise" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous niveaux</SelectItem>
                      <Separator className="my-1" />
                      {Object.entries(levelLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedWorkStatus}
                    onValueChange={(v) =>
                      setSelectedWorkStatus(v === 'all' ? '' : (v as WorkStatus))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Statut professionnel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous statuts</SelectItem>
                      <Separator className="my-1" />
                      {Object.entries(workStatusLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedDemand}
                    onValueChange={(v) =>
                      setSelectedDemand(
                        v === 'all' ? '' : (v as 'high' | 'medium' | 'low'),
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Demande marché" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toute demande</SelectItem>
                      <Separator className="my-1" />
                      <SelectItem value="high">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-orange-500" />
                          Forte demande
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-blue-500" />
                          Demande moyenne
                        </div>
                      </SelectItem>
                      <SelectItem value="low">
                        <div className="flex items-center gap-2">
                          <TrendingDown className="h-4 w-4 text-gray-500" />
                          Faible demande
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4 pt-4 border-t">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    >
                      {viewMode === 'grid' ? (
                        <>
                          <List className="h-4 w-4 mr-2" />
                          Vue liste
                        </>
                      ) : (
                        <>
                          <Grid3x3 className="h-4 w-4 mr-2" />
                          Vue grille
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleSelectAll}>
                      {selectedProfiles.size === filteredProfiles.length
                        ? 'Désélectionner'
                        : 'Tout sélectionner'}
                    </Button>
                    <div className="flex items-center gap-2 ml-2">
                      <Checkbox
                        id="complete"
                        checked={showOnlyComplete}
                        onCheckedChange={(checked) =>
                          setShowOnlyComplete(checked as boolean)
                        }
                      />
                      <label htmlFor="complete" className="text-sm cursor-pointer">
                        Profils complets uniquement
                      </label>
                    </div>
                  </div>

                  {selectedProfiles.size > 0 && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      {selectedProfiles.size} profil{selectedProfiles.size > 1 ? 's' : ''}{' '}
                      sélectionné{selectedProfiles.size > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top compétences */}
            {directoryData?.statistics.topSkills &&
              directoryData.statistics.topSkills.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Top 10 Compétences</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {directoryData.statistics.topSkills.map((skill, index) => {
                        const Icon = categoryIcons[skill.category] || Target;
                        const percentage = (skill.count / directoryData.total) * 100;

                        return (
                          <div key={skill.name} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-muted-foreground">
                                  #{index + 1}
                                </span>
                                <Icon className="h-4 w-4" />
                                <span className="font-medium">{skill.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {categoryLabels[skill.category]}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                  {skill.count} profils
                                </span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setSearchTerm(skill.name);
                                    toast.success(
                                      `Recherche de profils avec: ${skill.name}`,
                                    );
                                  }}
                                >
                                  <Search className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

            {/* Liste des profils avec pagination */}
            <div className="space-y-6">
              {/* Indicateur de chargement overlay */}
              {isFetching && !isLoading && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}

              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                    : 'space-y-4'
                }
              >
                {isLoading ? (
                  // Skeleton loading
                  Array.from({ length: pageSize }).map((_, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-3/4" />
                          <div className="flex gap-1">
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-6 w-16" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : filteredProfiles.length === 0 ? (
                  <div className="col-span-full">
                    <Card>
                      <CardContent className="py-12">
                        <div className="text-center text-muted-foreground">
                          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <h3 className="text-lg font-semibold mb-2">
                            Aucun profil trouvé
                          </h3>
                          <p className="text-sm">
                            Modifiez vos critères de recherche pour voir plus de résultats
                          </p>
                          <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => {
                              setSearchTerm('');
                              setSelectedCategory('');
                              setSelectedLevel('');
                              setSelectedDemand('');
                              setSelectedWorkStatus('');
                              setShowOnlyComplete(false);
                            }}
                          >
                            Réinitialiser les filtres
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  filteredProfiles.map((profile) => {
                    const Icon = categoryIcons[profile.skills.category] || Target;
                    const isSelected = selectedProfiles.has(profile.id);

                    return (
                      <Card
                        key={profile.id}
                        className={`relative transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => handleSelectProfile(profile.id)}
                              />
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={profile.user?.image || ''} />
                                <AvatarFallback>
                                  {(profile.firstName?.[0] || '') +
                                    (profile.lastName?.[0] || '')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-semibold">
                                  {profile.firstName} {profile.lastName}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {profile.profession || 'Non renseigné'}
                                </p>
                              </div>
                            </div>
                            <Badge className={categoryColors[profile.skills.category]}>
                              <Icon className="h-3 w-3 mr-1" />
                              {categoryLabels[profile.skills.category]}
                            </Badge>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-3">
                          {/* Résumé CV */}
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {profile.skills.cvSummary}
                          </p>

                          {/* Informations */}
                          <div className="space-y-1 text-sm">
                            {profile.workStatus && profile.workStatus === 'UNEMPLOYED' ? (
                              <div className="flex items-center gap-2 text-orange-600 font-medium">
                                <UserSearch className="h-3 w-3" />
                                <span>
                                  Ressortissant gabonais à la recherche d&apos;emploi
                                </span>
                              </div>
                            ) : profile.employer ? (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Building className="h-3 w-3" />
                                <span>{profile.employer}</span>
                              </div>
                            ) : null}
                            {profile.email && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                <span className="truncate">{profile.email}</span>
                              </div>
                            )}
                            {profile.phoneNumber && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                <span>{profile.phoneNumber}</span>
                              </div>
                            )}
                            {profile.address?.city && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span>{profile.address.city}</span>
                              </div>
                            )}
                          </div>

                          {/* Compétences principales */}
                          <div className="flex flex-wrap gap-1">
                            {profile.skills.primarySkills.slice(0, 3).map((skill) => (
                              <Badge
                                key={skill.name}
                                variant="secondary"
                                className="text-xs"
                              >
                                {skill.name}
                              </Badge>
                            ))}
                            {profile.skills.primarySkills.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{profile.skills.primarySkills.length - 3}
                              </Badge>
                            )}
                          </div>

                          {/* Indicateurs */}
                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {levelLabels[profile.skills.experienceLevel]}
                              </Badge>
                              {profile.skills.marketDemand === 'high' && (
                                <Badge variant="default" className="text-xs">
                                  <Zap className="h-3 w-3 mr-1" />
                                  Forte demande
                                </Badge>
                              )}
                            </div>

                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleShowCV(profile.id)}
                              >
                                <FileUser className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  router.push(`/dashboard/profiles/${profile.id}`)
                                }
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>

              {/* Pagination */}
              {directoryData && directoryData.totalPages > 1 && (
                <Card>
                  <CardContent className="py-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-sm text-muted-foreground">
                        Affichage de {(currentPage - 1) * pageSize + 1} à{' '}
                        {Math.min(currentPage * pageSize, directoryData.total)} sur{' '}
                        {directoryData.total} profils
                      </div>

                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                              className={
                                currentPage === 1
                                  ? 'pointer-events-none opacity-50'
                                  : 'cursor-pointer'
                              }
                            />
                          </PaginationItem>

                          {/* Première page */}
                          {currentPage > 2 && (
                            <>
                              <PaginationItem>
                                <PaginationLink
                                  onClick={() => setCurrentPage(1)}
                                  className="cursor-pointer"
                                >
                                  1
                                </PaginationLink>
                              </PaginationItem>
                              {currentPage > 3 && (
                                <PaginationItem>
                                  <PaginationEllipsis />
                                </PaginationItem>
                              )}
                            </>
                          )}

                          {/* Pages autour de la page courante */}
                          {Array.from(
                            { length: Math.min(5, directoryData.totalPages) },
                            (_, i) => {
                              const pageNum =
                                Math.max(
                                  1,
                                  Math.min(
                                    currentPage - 2 + i,
                                    directoryData.totalPages - 4,
                                  ),
                                ) + i;
                              if (pageNum > 0 && pageNum <= directoryData.totalPages) {
                                return (
                                  <PaginationItem key={pageNum}>
                                    <PaginationLink
                                      onClick={() => setCurrentPage(pageNum)}
                                      isActive={pageNum === currentPage}
                                      className="cursor-pointer"
                                    >
                                      {pageNum}
                                    </PaginationLink>
                                  </PaginationItem>
                                );
                              }
                              return null;
                            },
                          ).filter(Boolean)}

                          {/* Dernière page */}
                          {currentPage < directoryData.totalPages - 1 && (
                            <>
                              {currentPage < directoryData.totalPages - 2 && (
                                <PaginationItem>
                                  <PaginationEllipsis />
                                </PaginationItem>
                              )}
                              <PaginationItem>
                                <PaginationLink
                                  onClick={() => setCurrentPage(directoryData.totalPages)}
                                  className="cursor-pointer"
                                >
                                  {directoryData.totalPages}
                                </PaginationLink>
                              </PaginationItem>
                            </>
                          )}

                          <PaginationItem>
                            <PaginationNext
                              onClick={() =>
                                setCurrentPage(
                                  Math.min(directoryData.totalPages, currentPage + 1),
                                )
                              }
                              className={
                                currentPage === directoryData.totalPages
                                  ? 'pointer-events-none opacity-50'
                                  : 'cursor-pointer'
                              }
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>

                      <Select
                        value={String(pageSize)}
                        onValueChange={(v) => {
                          setPageSize(Number(v));
                          setCurrentPage(1);
                        }}
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12">12 / page</SelectItem>
                          <SelectItem value="24">24 / page</SelectItem>
                          <SelectItem value="48">48 / page</SelectItem>
                          <SelectItem value="96">96 / page</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Modal CV */}
            {selectedProfileForCV && profileCV && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <Card className="max-w-2xl w-full max-h-[90vh] overflow-auto">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>CV Synthétisé</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedProfileForCV(null)}
                      >
                        ✕
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Informations personnelles */}
                    <div>
                      <h3 className="font-semibold mb-2">Informations personnelles</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Nom complet:</span>
                          <p className="font-medium">{profileCV.personal.fullName}</p>
                        </div>
                        {profileCV.personal.age && (
                          <div>
                            <span className="text-muted-foreground">Âge:</span>
                            <p className="font-medium">{profileCV.personal.age} ans</p>
                          </div>
                        )}
                        {profileCV.personal.email && (
                          <div>
                            <span className="text-muted-foreground">Email:</span>
                            <p className="font-medium">{profileCV.personal.email}</p>
                          </div>
                        )}
                        {profileCV.personal.phone && (
                          <div>
                            <span className="text-muted-foreground">Téléphone:</span>
                            <p className="font-medium">{profileCV.personal.phone}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Résumé professionnel */}
                    <div>
                      <h3 className="font-semibold mb-2">Résumé professionnel</h3>
                      <p className="text-sm">{profileCV.summary}</p>
                    </div>

                    {/* Situation actuelle */}
                    <div>
                      <h3 className="font-semibold mb-2">Situation actuelle</h3>
                      <div className="space-y-1 text-sm">
                        {profileCV.professional.title && (
                          <p>
                            <span className="text-muted-foreground">Poste:</span>{' '}
                            {profileCV.professional.title}
                          </p>
                        )}
                        {profileCV.professional.employer && (
                          <p>
                            <span className="text-muted-foreground">Employeur:</span>{' '}
                            {profileCV.professional.employer}
                          </p>
                        )}
                        <p>
                          <span className="text-muted-foreground">Niveau:</span>{' '}
                          <Badge variant="outline">
                            {levelLabels[profileCV.professional.experienceLevel]}
                          </Badge>
                        </p>
                      </div>
                    </div>

                    {/* Compétences */}
                    <div>
                      <h3 className="font-semibold mb-2">Compétences</h3>

                      {profileCV.skills.primary.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm text-muted-foreground mb-1">
                            Compétences principales
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {profileCV.skills.primary.map((skill) => (
                              <Badge
                                key={skill.name}
                                variant="default"
                                className="text-xs"
                              >
                                {skill.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {profileCV.skills.secondary.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm text-muted-foreground mb-1">
                            Compétences secondaires
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {profileCV.skills.secondary.map((skill) => (
                              <Badge
                                key={skill.name}
                                variant="secondary"
                                className="text-xs"
                              >
                                {skill.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {profileCV.skills.suggested.length > 0 && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Compétences suggérées
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {profileCV.skills.suggested.map((skill) => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Indicateurs */}
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              profileCV.indicators.marketDemand === 'high'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            Demande:{' '}
                            {profileCV.indicators.marketDemand === 'high'
                              ? 'Élevée'
                              : profileCV.indicators.marketDemand === 'medium'
                                ? 'Moyenne'
                                : 'Faible'}
                          </Badge>
                          <Badge variant="outline">
                            Complétude: {profileCV.indicators.profileCompleteness}%
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          onClick={() =>
                            router.push(`/dashboard/profiles/${selectedProfileForCV}`)
                          }
                        >
                          Voir le profil complet
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </IntelAgentLayout>
  );
}
