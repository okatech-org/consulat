'use client';

import { useState, useMemo, useEffect } from 'react';
import { api } from '@/trpc/react';
import { useIntelligenceDashboardStats } from '@/hooks/use-optimized-queries';
import IntelAgentLayout from '@/components/layouts/intel-agent-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
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
  Stethoscope,
  Scale,
  GraduationCap,
  Target,
  BarChart3,
  Eye,
  AlertTriangle,
  FileUser,
  Mail,
  Phone,
  MapPin,
  Zap,
  User
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SkillCategory, ExpertiseLevel, WorkStatus } from '@prisma/client';

// Mapping des icônes par catégorie
const categoryIcons: Record<SkillCategory, any> = {
  technique: Wrench,
  management: Briefcase,
  commercial: TrendingUp,
  administratif: Building,
  artisanal: Award,
  medical: Stethoscope,
  juridique: Scale,
  education: GraduationCap,
  transport: Target,
  securite: Target,
  agriculture: Target,
  restauration: Target,
  finance: BarChart3,
};

// Couleurs par catégorie
const categoryColors: Record<SkillCategory, string> = {
  technique: 'bg-blue-500',
  management: 'bg-purple-500',
  commercial: 'bg-green-500',
  administratif: 'bg-gray-500',
  artisanal: 'bg-orange-500',
  medical: 'bg-red-500',
  juridique: 'bg-indigo-500',
  education: 'bg-yellow-500',
  transport: 'bg-cyan-500',
  securite: 'bg-rose-500',
  agriculture: 'bg-lime-500',
  restauration: 'bg-amber-500',
  finance: 'bg-emerald-500',
};

// Labels français pour les catégories
const categoryLabels: Record<SkillCategory, string> = {
  technique: 'Technique',
  management: 'Management',
  commercial: 'Commercial',
  administratif: 'Administratif',
  artisanal: 'Artisanal',
  medical: 'Médical',
  juridique: 'Juridique',
  education: 'Éducation',
  transport: 'Transport',
  securite: 'Sécurité',
  agriculture: 'Agriculture',
  restauration: 'Restauration',
  finance: 'Finance',
};

// Labels français pour les niveaux
const levelLabels: Record<ExpertiseLevel, string> = {
  junior: 'Junior',
  intermediaire: 'Intermédiaire',
  senior: 'Senior',
  expert: 'Expert',
};

// Labels français pour les statuts
const workStatusLabels: Record<WorkStatus, string> = {
  EMPLOYEE: 'Employé',
  SELF_EMPLOYED: 'Indépendant',
  STUDENT: 'Étudiant',
  RETIRED: 'Retraité',
  UNEMPLOYED: 'Sans emploi',
  OTHER: 'Autre',
};

export default function CompetencesDirectoryPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | ''>('');
  const [selectedLevel, setSelectedLevel] = useState<ExpertiseLevel | ''>('');
  const [selectedDemand, setSelectedDemand] = useState<'high' | 'medium' | 'low' | ''>('');
  const [selectedProfiles, setSelectedProfiles] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showOnlyComplete, setShowOnlyComplete] = useState(false);
  const [selectedProfileForCV, setSelectedProfileForCV] = useState<string | null>(null);

  // Récupérer les données réelles via tRPC
  const { data: directoryData, isLoading, error, refetch } = api.skillsDirectory.getDirectory.useQuery({
    search: searchTerm || undefined,
    category: selectedCategory || undefined,
    level: selectedLevel || undefined,
    marketDemand: selectedDemand || undefined,
    hasCompleteProfile: showOnlyComplete || undefined,
  }, {
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Récupérer le CV d'un profil sélectionné
  const { data: profileCV } = api.skillsDirectory.getProfileCV.useQuery(
    { profileId: selectedProfileForCV! },
    { 
      enabled: !!selectedProfileForCV,
      staleTime: 5 * 60 * 1000,
    }
  );

  // Recherche de profils par compétence
  const searchBySkillMutation = api.skillsDirectory.searchBySkill.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.total} profils trouvés avec cette compétence`);
      // Rediriger vers la page des profils avec les résultats
      router.push(`/dashboard/profiles?skill=${encodeURIComponent(data.profiles[0]?.matchingSkill?.name || '')}`);
    },
    onError: () => {
      toast.error('Erreur lors de la recherche');
    },
  });

  // Statistiques du dashboard
  const { data: dashboardStats } = useIntelligenceDashboardStats('month');

  // Filtrer les profils selon la sélection
  const filteredProfiles = useMemo(() => {
    return directoryData?.profiles || [];
  }, [directoryData]);

  // Gérer la sélection des profils
  const handleSelectProfile = (profileId: string) => {
    setSelectedProfiles(prev => {
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
      setSelectedProfiles(new Set(filteredProfiles.map(p => p.id)));
    }
  };

  // Export CSV
  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const selectedData = filteredProfiles.filter(p => selectedProfiles.has(p.id));
      
      const csv = [
        ['Nom', 'Prénom', 'Profession', 'Employeur', 'Statut', 'Catégorie', 'Niveau', 'Compétences principales', 'Email', 'Téléphone', 'Ville'],
        ...selectedData.map(p => [
          p.lastName || '',
          p.firstName || '',
          p.profession || '',
          p.employer || '',
          p.workStatus ? workStatusLabels[p.workStatus] : '',
          categoryLabels[p.skills.category],
          levelLabels[p.skills.experienceLevel],
          p.skills.primarySkills.map(s => s.name).join('; '),
          p.email || '',
          p.phoneNumber || '',
          p.address?.city || '',
        ])
      ];

      const csvContent = csv.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `annuaire-competences-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      toast.success(`${selectedData.length} profils exportés`);
    } catch (error) {
      toast.error('Erreur lors de l\'export');
    } finally {
      setIsExporting(false);
    }
  };

  // Afficher le CV modal
  const handleShowCV = (profileId: string) => {
    setSelectedProfileForCV(profileId);
  };

  if (error) {
    return (
      <IntelAgentLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4">
                <AlertTriangle className="h-12 w-12 text-red-500" />
                <h3 className="text-lg font-semibold">Erreur de chargement</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Impossible de charger l'annuaire des compétences
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
    <IntelAgentLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Annuaire des Compétences</h1>
            <p className="text-muted-foreground">
              Analyse intelligente de {directoryData?.total || 0} profils professionnels
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            <Button
              onClick={handleExportCSV}
              disabled={selectedProfiles.size === 0 || isExporting}
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Exporter ({selectedProfiles.size})
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
                <div className="text-2xl font-bold">{directoryData.statistics.totalProfiles}</div>
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
                <div className="text-2xl font-bold">{directoryData.statistics.totalUniqueSkills}</div>
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
                <p className="text-xs text-muted-foreground">
                  Profils recherchés
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Top Catégorie</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Object.entries(directoryData.statistics.categoryDistribution)
                    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Secteur dominant
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtres */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtres de recherche</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v === 'all' ? '' : v as SkillCategory)}>
                <SelectTrigger>
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedLevel} onValueChange={(v) => setSelectedLevel(v === 'all' ? '' : v as ExpertiseLevel)}>
                <SelectTrigger>
                  <SelectValue placeholder="Niveau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  {Object.entries(levelLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedDemand} onValueChange={(v) => setSelectedDemand(v === 'all' ? '' : v as 'high' | 'medium' | 'low')}>
                <SelectTrigger>
                  <SelectValue placeholder="Demande" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="high">Élevée</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="low">Faible</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center gap-2">
                <Checkbox
                  id="complete"
                  checked={showOnlyComplete}
                  onCheckedChange={(checked) => setShowOnlyComplete(checked as boolean)}
                />
                <label htmlFor="complete" className="text-sm">
                  Profils complets uniquement
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                >
                  {viewMode === 'grid' ? 'Vue liste' : 'Vue grille'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedProfiles.size === filteredProfiles.length ? 'Désélectionner tout' : 'Sélectionner tout'}
                </Button>
              </div>
              
              {selectedProfiles.size > 0 && (
                <Badge variant="secondary">
                  {selectedProfiles.size} sélectionné(s)
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top compétences */}
        {directoryData?.statistics.topSkills && directoryData.statistics.topSkills.length > 0 && (
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
                            onClick={() => searchBySkillMutation.mutate({ skillName: skill.name })}
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

        {/* Liste des profils */}
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
          {isLoading ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun profil trouvé avec ces critères</p>
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
                            {(profile.firstName?.[0] || '') + (profile.lastName?.[0] || '')}
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
                      {profile.employer && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Building className="h-3 w-3" />
                          <span>{profile.employer}</span>
                        </div>
                      )}
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
                        <Badge key={skill.name} variant="secondary" className="text-xs">
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
                          onClick={() => router.push(`/dashboard/profiles/${profile.id}`)}
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
                      <p><span className="text-muted-foreground">Poste:</span> {profileCV.professional.title}</p>
                    )}
                    {profileCV.professional.employer && (
                      <p><span className="text-muted-foreground">Employeur:</span> {profileCV.professional.employer}</p>
                    )}
                    <p>
                      <span className="text-muted-foreground">Niveau:</span>{' '}
                      <Badge variant="outline">{levelLabels[profileCV.professional.experienceLevel]}</Badge>
                    </p>
                  </div>
                </div>

                {/* Compétences */}
                <div>
                  <h3 className="font-semibold mb-2">Compétences</h3>
                  
                  {profileCV.skills.primary.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm text-muted-foreground mb-1">Compétences principales</p>
                      <div className="flex flex-wrap gap-1">
                        {profileCV.skills.primary.map((skill) => (
                          <Badge key={skill.name} variant="default" className="text-xs">
                            {skill.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {profileCV.skills.secondary.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm text-muted-foreground mb-1">Compétences secondaires</p>
                      <div className="flex flex-wrap gap-1">
                        {profileCV.skills.secondary.map((skill) => (
                          <Badge key={skill.name} variant="secondary" className="text-xs">
                            {skill.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {profileCV.skills.suggested.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Compétences suggérées</p>
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
                      <Badge variant={profileCV.indicators.marketDemand === 'high' ? 'default' : 'secondary'}>
                        Demande: {profileCV.indicators.marketDemand === 'high' ? 'Élevée' : profileCV.indicators.marketDemand === 'medium' ? 'Moyenne' : 'Faible'}
                      </Badge>
                      <Badge variant="outline">
                        Complétude: {profileCV.indicators.profileCompleteness}%
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => router.push(`/dashboard/profiles/${selectedProfileForCV}`)}
                    >
                      Voir le profil complet
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </IntelAgentLayout>
  );
}