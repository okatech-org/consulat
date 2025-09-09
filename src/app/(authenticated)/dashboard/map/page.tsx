'use client';

import { useState, useMemo, useEffect } from 'react';
import { api } from '@/trpc/react';
import { useIntelligenceDashboardStats, useIntelligenceProfilesMap, useIntelligenceNotes } from '@/hooks/use-optimized-queries';
import IntelAgentLayout from '@/components/layouts/intel-agent-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  MapPin, 
  Users, 
  Filter, 
  Eye,
  Search,
  Layers,
  Zap,
  Target,
  RefreshCw,
  AlertCircle,
  Clock,
  TrendingUp,
  Globe
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import SmartInteractiveMap from '@/components/intelligence/dynamic-smart-map';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce';
import { IntelligenceNotePriority } from '@prisma/client';
import { getLocationCoordinates } from '@/lib/services/geocoding-service';

export default function CartePage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [showLayers, setShowLayers] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    hasNotes: undefined as boolean | undefined,
    priority: undefined as IntelligenceNotePriority | undefined,
    region: '',
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Effet pour synchroniser la recherche avec les filtres
  useEffect(() => {
    setFilters(prev => ({ ...prev, search: debouncedSearchTerm }));
  }, [debouncedSearchTerm]);

  // Données de la carte
  const { data: profilesMap, isLoading: isLoadingProfiles, error: errorProfiles, refetch: refetchProfiles } = useIntelligenceProfilesMap(
    Object.values(filters).some(value => value !== undefined && value !== '') ? filters : undefined
  );

  // Notes récentes pour l'activité
  const { data: recentNotes, isLoading: isLoadingNotes, error: errorNotes } = useIntelligenceNotes(
    { filters: { search: filters.search || undefined } }
  );

  // Statistiques générales
  const { data: dashboardStats, isLoading: isLoadingStats } = useIntelligenceDashboardStats('day');

  // Calculer les statistiques de la carte basées sur la RÉSIDENCE (adresse)
  const stats = useMemo(() => {
    if (!profilesMap) return { totalProfiles: 0, countries: 0, cities: 0, withNotes: 0 };
    
    // Filtrer uniquement les profils avec une adresse de résidence valide
    const profilesWithAddress = profilesMap.filter(p => p.address?.city && p.address?.country);
    
    return {
      totalProfiles: profilesWithAddress.length,
      countries: new Set(profilesWithAddress.map(p => p.address.country)).size,
      cities: new Set(profilesWithAddress.map(p => p.address.city)).size,
      withNotes: profilesWithAddress.filter(p => p.intelligenceNotes && p.intelligenceNotes.length > 0).length
    };
  }, [profilesMap]);

  // Données d'activité récente basées sur la RÉSIDENCE
  const recentActivity = useMemo(() => {
    if (!recentNotes || !profilesMap) return [];
    
    return recentNotes.slice(0, 4).map(note => {
      const profile = profilesMap.find(p => p.id === note.profileId);
      if (!profile || !profile.address?.city || !profile.address?.country) return null;
      
      const timeAgo = new Date(note.createdAt);
      const now = new Date();
      const diffHours = Math.floor((now.getTime() - timeAgo.getTime()) / (1000 * 60 * 60));
      
      return {
        id: profile.id,
        name: `${profile.firstName} ${profile.lastName.charAt(0)}.`,
        location: `${profile.address.city}, ${profile.address.country}`, // Adresse de résidence
        time: diffHours < 24 ? `${diffHours}h` : `${Math.floor(diffHours / 24)}j`,
        hasNotes: true,
        noteType: note.type,
        priority: note.priority
      };
    }).filter(Boolean);
  }, [recentNotes, profilesMap]);

  // Zones surveillées avec données réelles (basé sur la RÉSIDENCE)
  const surveilledZones = useMemo(() => {
    if (!profilesMap) return [];
    
    const zoneStats = new Map();
    
    // Filtrer uniquement les profils avec adresse de résidence valide
    profilesMap.filter(profile => profile.address?.city && profile.address?.country)
      .forEach(profile => {
        const key = `${profile.address.city}, ${profile.address.country}`;
        const current = zoneStats.get(key) || { 
          zone: profile.address.city, 
          country: profile.address.country,
          count: 0, 
          withNotes: 0 
        };
        
        current.count++;
        if (profile.intelligenceNotes && profile.intelligenceNotes.length > 0) {
          current.withNotes++;
        }
        
        zoneStats.set(key, current);
      });
    
    return Array.from(zoneStats.values())
      .sort((a, b) => b.withNotes - a.withNotes)
      .slice(0, 4)
      .map(zone => ({
        zone: `${zone.zone} (${zone.country})`,
        count: zone.count,
        level: zone.withNotes > zone.count * 0.5 ? 'Élevé' :
               zone.withNotes > zone.count * 0.2 ? 'Moyen' : 
               zone.withNotes > 0 ? 'Surveillé' : 'Normal',
        color: zone.withNotes > zone.count * 0.5 ? 'red' :
               zone.withNotes > zone.count * 0.2 ? 'orange' :
               zone.withNotes > 0 ? 'blue' : 'green'
      }));
  }, [profilesMap]);

  // Gestionnaires d'événements
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleCountryFilter = (value: string) => {
    setFilters(prev => ({ 
      ...prev, 
      region: value === 'all' ? '' : value 
    }));
  };

  const handleNotesFilter = (value: string) => {
    setFilters(prev => ({ 
      ...prev, 
      hasNotes: value === 'all' ? undefined : value === 'with-notes' 
    }));
  };

  const handleLayersToggle = () => {
    setShowLayers(!showLayers);
  };

  const handleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
    if (!autoRefresh) {
      // Démarrer le rafraîchissement automatique
      const interval = setInterval(() => {
        refetchProfiles();
      }, 30000); // Toutes les 30 secondes
      
      // Nettoyer à la fermeture
      return () => clearInterval(interval);
    }
  };

  const handleProfileClick = (profileId: string) => {
    router.push(`/dashboard/profiles/${profileId}`);
  };

  const handleRefreshData = () => {
    refetchProfiles();
  };

  // États d'erreur et de chargement
  const hasErrors = errorProfiles || errorNotes;
  const isLoading = isLoadingProfiles || isLoadingNotes || isLoadingStats;

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      <IntelAgentLayout
        title="Carte Intelligente • Résidence"
        description={`${stats.totalProfiles.toLocaleString()} profils géolocalisés par adresse de résidence • La majorité des Gabonais résident en France`}
        currentPage="carte"
        backButton={false}
      >
        <div className="space-y-6">
          {/* Gestion d'erreurs */}
          {hasErrors && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Erreur lors du chargement des données. 
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={handleRefreshData}
                  className="ml-2 p-0 h-auto"
                >
                  Réessayer
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Contrôles rapides optimisés */}
          <Card 
            className="border-0 shadow-sm"
            style={{
              background: 'var(--bg-glass-primary)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid var(--border-glass-primary)',
              boxShadow: 'var(--shadow-glass)',
            }}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    Filtres Rapides
                  </span>
                  {autoRefresh && (
                    <Badge className="bg-green-500/20 text-green-500 border-green-500/30 text-xs">
                      <Zap className="h-2 w-2 mr-1" />
                      Auto
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                    <Input 
                      placeholder="Rechercher profil..."
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pl-7 h-8 text-xs w-48"
                      disabled={isLoading}
                    />
                  </div>
                  
                  <Select 
                    value={filters.hasNotes === undefined ? 'all' : filters.hasNotes ? 'with-notes' : 'without-notes'} 
                    onValueChange={handleNotesFilter}
                  >
                    <SelectTrigger className="h-8 text-xs w-32">
                      <SelectValue placeholder="Intelligence" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les profils</SelectItem>
                      <SelectItem value="with-notes">Avec renseignements</SelectItem>
                      <SelectItem value="without-notes">Standards uniquement</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    variant={autoRefresh ? "default" : "outline"} 
                    size="sm" 
                    onClick={handleAutoRefresh}
                    className="h-8 px-3 text-xs"
                  >
                    <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                    {autoRefresh ? 'Auto' : 'Manuel'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>


          {/* Carte principale avec informations contextuelles */}
          <Card 
            className="relative overflow-hidden"
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
                <CardTitle style={{ color: 'var(--text-primary)' }}>
                  Répartition par Résidence • {stats.totalProfiles.toLocaleString()} Profils
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Temps réel
                  </Badge>
                  {autoRefresh && (
                    <Badge variant="secondary" className="text-xs bg-yellow-500/20 text-yellow-600">
                      Auto-refresh: ON
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Carte interactive intelligente - Pleine largeur */}
              <div className="h-[600px] md:h-[700px] lg:h-[800px] relative">
                {isLoadingProfiles ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-3">
                      <Skeleton className="w-full h-full" />
                      <div className="text-center">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Chargement de la carte...</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <SmartInteractiveMap 
                    profiles={profilesMap?.filter(profile => {
                      // SEULS les profils avec ADRESSE DE RÉSIDENCE valide
                      const hasValidResidenceAddress = profile.address && 
                        profile.address.city && 
                        profile.address.city.trim() !== '' &&
                        profile.address.country && 
                        profile.address.country.trim() !== '';
                      
                      return hasValidResidenceAddress;
                    }).map(profile => {
                      // Utiliser UNIQUEMENT l'adresse de RÉSIDENCE 
                      const coordinates = getLocationCoordinates(
                        profile.address.city,    // ← Ville de RÉSIDENCE
                        profile.address.country  // ← Pays de RÉSIDENCE
                      );
                      
                      return {
                        id: profile.id,
                        name: `${profile.firstName} ${profile.lastName}`,
                        latitude: coordinates.latitude,
                        longitude: coordinates.longitude,
                        city: profile.address.city,          // ← Ville de résidence
                        country: profile.address.country,    // ← Pays de résidence
                        hasNotes: profile.intelligenceNotes && profile.intelligenceNotes.length > 0,
                        notesCount: profile.intelligenceNotes?.length || 0,
                      };
                    }) || []}
                    onProfileClick={handleProfileClick}
                    className="w-full h-full"
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Statistiques de la carte */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Profils géolocalisés', value: stats.totalProfiles, icon: Users, color: 'blue' },
              { title: 'Pays couverts', value: stats.countries, icon: MapPin, color: 'green' },
              { title: 'Villes surveillées', value: stats.cities, icon: Target, color: 'orange' },
              { title: 'Avec renseignements', value: stats.withNotes, icon: Eye, color: 'red' }
            ].map((stat, index) => (
              <Card 
                key={index}
                className="relative overflow-hidden group hover:shadow-lg transition-all duration-200"
                style={{
                  background: 'var(--bg-glass-primary)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid var(--border-glass-primary)',
                  boxShadow: 'var(--shadow-glass)',
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold font-mono mb-1" style={{ color: 'var(--text-primary)' }}>
                        {stat.value.toLocaleString()}
                      </div>
                      <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                        {stat.title}
                      </div>
                    </div>
                    <div 
                      className="p-3 rounded-lg group-hover:scale-110 transition-transform"
                      style={{
                        background: stat.color === 'blue' ? 'rgba(59, 130, 246, 0.15)' : 
                                   stat.color === 'green' ? 'rgba(16, 185, 129, 0.15)' : 
                                   stat.color === 'orange' ? 'rgba(245, 158, 11, 0.15)' : 
                                   'rgba(239, 68, 68, 0.15)',
                        color: stat.color === 'blue' ? '#3b82f6' : 
                               stat.color === 'green' ? '#10b981' : 
                               stat.color === 'orange' ? '#f59e0b' : 
                               '#ef4444'
                      }}
                    >
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
                  
                  {/* Indicateur de rafraîchissement */}
                  {autoRefresh && (
                    <div className="absolute top-2 right-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Widgets d'information sous la carte - Layout optimisé */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Activité Récente - Zone principale */}
            <div className="lg:col-span-2">
              <Card 
                className="border-0 shadow-sm"
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
                    <CardTitle className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <Clock className="h-5 w-5 text-blue-500" />
                      Activité Récente
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {recentActivity.length} événements
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {isLoadingNotes ? (
                      // États de chargement
                      Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 rounded-lg">
                          <Skeleton className="w-10 h-10 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </div>
                      ))
                    ) : recentActivity.length > 0 ? (
                      recentActivity.slice(0, 6).map((activity, index) => (
                        <div 
                          key={index} 
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-all cursor-pointer group border border-transparent hover:border-blue-500/30"
                          onClick={() => handleProfileClick(activity.id)}
                        >
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                            style={{
                              background: activity.priority === 'HIGH' 
                                ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                                : activity.priority === 'MEDIUM'
                                ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                                : 'linear-gradient(135deg, #3b82f6, #2563eb)'
                            }}
                          >
                            {activity.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium truncate group-hover:text-blue-400 transition-colors" style={{ color: 'var(--text-primary)' }}>
                                {activity.name}
                              </span>
                              <Eye className="h-4 w-4 text-blue-500 flex-shrink-0" />
                            </div>
                            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                              <span className="truncate">📍 {activity.location}</span>
                              <span>•</span>
                              <Clock className="h-3 w-3" />
                              <span>{activity.time}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-8 text-muted-foreground">
                        <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Aucune activité récente</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Distribution Mondiale - Widget compact */}
            <div className="lg:col-span-1">
              <Card 
                className="border-0 shadow-sm"
                style={{
                  background: 'var(--bg-glass-primary)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid var(--border-glass-primary)',
                  boxShadow: 'var(--shadow-glass)',
                }}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg" style={{ color: 'var(--text-primary)' }}>
                    <Globe className="h-5 w-5 text-green-500" />
                    Distribution Mondiale
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Zones Stratégiques */}
                    <div>
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <Target className="h-4 w-4 text-orange-500" />
                        Zones Surveillées
                      </h4>
                      <div className="space-y-2">
                        {isLoadingProfiles ? (
                          Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="flex items-center justify-between p-2 rounded">
                              <Skeleton className="h-4 w-20" />
                              <Skeleton className="h-5 w-16" />
                            </div>
                          ))
                        ) : surveilledZones.length > 0 ? (
                          surveilledZones.map((zone, index) => (
                            <div 
                              key={index}
                              className="flex items-center justify-between p-3 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group"
                              style={{ background: 'var(--bg-glass-light)' }}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium group-hover:text-blue-400 transition-colors" style={{ color: 'var(--text-primary)' }}>
                                  {zone.zone}
                                </div>
                                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                  {zone.count.toLocaleString()} profils
                                </div>
                              </div>
                              <Badge 
                                className={`text-xs px-2 py-1 ${
                                  zone.color === 'red' ? 'bg-red-500/20 text-red-500 border-red-500/30' :
                                  zone.color === 'orange' ? 'bg-orange-500/20 text-orange-500 border-orange-500/30' :
                                  zone.color === 'blue' ? 'bg-blue-500/20 text-blue-500 border-blue-500/30' :
                                  'bg-green-500/20 text-green-500 border-green-500/30'
                                }`}
                              >
                                {zone.level}
                              </Badge>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4 text-xs text-muted-foreground">
                            <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>Aucune zone surveillée</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>

          {/* Panneau des couches (affiché conditionnellement) */}
          {showLayers && (
            <Card 
              className="border-0 shadow-sm"
              style={{
                background: 'var(--bg-glass-primary)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid var(--border-glass-primary)',
                boxShadow: 'var(--shadow-glass)',
              }}
            >
              <CardHeader>
                <CardTitle className="text-sm" style={{ color: 'var(--text-primary)' }}>
                  Options d'affichage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Afficher les profils sans notes
                    </span>
                    <Button variant="outline" size="sm">
                      {filters.hasNotes === false ? 'Activé' : 'Désactivé'}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Grouper par pays
                    </span>
                    <Button variant="outline" size="sm">
                      Désactivé
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Afficher les zones de chaleur
                    </span>
                    <Button variant="outline" size="sm">
                      Désactivé
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </IntelAgentLayout>
    </div>
  );
}
