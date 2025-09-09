'use client';

import { useState, useMemo } from 'react';
import { api } from '@/trpc/react';
import { useIntelligenceDashboardStats } from '@/hooks/use-optimized-queries';
import IntelAgentLayout from '@/components/layouts/intel-agent-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { 
  MapPin, 
  Search, 
  Filter, 
  Download,
  RefreshCw,
  Loader2,
  Building2,
  Users,
  TrendingUp,
  AlertTriangle,
  Eye,
  ExternalLink
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import DashboardCompactMap from '@/components/intelligence/dashboard-compact-map';

// Données simulées des associations basées sur le document DGSS
const associationsData = [
  { 
    id: 'asso-001', 
    name: 'Association des Gabonais d\'Amiens (AGA)', 
    type: 'Communautaires', 
    location: { city: 'Amiens', country: 'France', coordinates: { lat: 49.8942, lng: 2.2957 } },
    zone: 'Zone 3 : Nord-Est',
    members: 45,
    riskLevel: 'medium',
    status: 'active',
    website: 'https://aga-amiens.fr',
    activities: ['Événements culturels', 'Aide aux nouveaux arrivants', 'Promotion de la culture gabonaise']
  },
  { 
    id: 'asso-002', 
    name: 'Cercle des Gabonais de Strasbourg', 
    type: 'Communautaires', 
    location: { city: 'Strasbourg', country: 'France', coordinates: { lat: 48.5734, lng: 7.7521 } },
    zone: 'Zone 3 : Nord-Est',
    members: 32,
    riskLevel: 'low',
    status: 'active',
    activities: ['Rencontres mensuelles', 'Soutien éducatif']
  },
  { 
    id: 'asso-003', 
    name: 'BANA BA Gabon Metz', 
    type: 'Socio-Culturelle', 
    location: { city: 'Metz', country: 'France', coordinates: { lat: 49.1193, lng: 6.1757 } },
    zone: 'Zone 3 : Nord-Est',
    members: 67,
    riskLevel: 'medium',
    status: 'active',
    activities: ['Promotion culturelle', 'Événements artistiques']
  },
  { 
    id: 'asso-004', 
    name: 'Collectif Humanitaire Gabon France', 
    type: 'Social / Humanitaire', 
    location: { city: 'Paris', country: 'France', coordinates: { lat: 48.8566, lng: 2.3522 } },
    zone: 'Zone 1 : Paris IDF',
    members: 89,
    riskLevel: 'low',
    status: 'active',
    activities: ['Aide humanitaire', 'Collecte de fonds', 'Missions au Gabon']
  },
  { 
    id: 'asso-005', 
    name: 'Réseau Entrepreneurs Gabonais Europe', 
    type: 'Education - Réseautage / Entrepreneurs', 
    location: { city: 'Lyon', country: 'France', coordinates: { lat: 45.764, lng: 4.8357 } },
    zone: 'Zone 4 : Sud-Est',
    members: 124,
    riskLevel: 'high',
    status: 'monitored',
    activities: ['Networking professionnel', 'Investissements', 'Partenariats économiques']
  }
];

// Statistiques basées sur les données DGSS
const categoryStats = {
  'Social / Humanitaire': { count: 33, riskLevel: 'low' },
  'Socio-Culturelle': { count: 28, riskLevel: 'low' },
  'Education - Réseautage / Entrepreneurs': { count: 21, riskLevel: 'high' },
  'Communautaires': { count: 20, riskLevel: 'medium' },
  'Sportive': { count: 10, riskLevel: 'low' },
  'Culturelle': { count: 5, riskLevel: 'low' },
  'Social, Services à la personne': { count: 5, riskLevel: 'low' },
  'D\'opinion': { count: 4, riskLevel: 'high' },
  'Juridiques / Droit': { count: 2, riskLevel: 'critical' },
  'Santé, Médical, Paramédical': { count: 1, riskLevel: 'low' }
};

const zoneStats = {
  'Zone 1 : Paris IDF': 38,
  'Zone 5 : Sud-Ouest': 21,
  'Zone 2 : Nord-Ouest': 11,
  'Zone 4 : Sud-Est': 11,
  'Zone 3 : Nord-Est': 8,
  'Autre': 1
};

export default function AssociationsMapPage() {
  const router = useRouter();
  const [selectedAssociations, setSelectedAssociations] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('all');

  // Simulation de données réelles - à remplacer par des appels tRPC
  const [associations] = useState(associationsData);
  const [isLoading, setIsLoading] = useState(false);

  // Filtrer les associations
  const filteredAssociations = useMemo(() => {
    return associations.filter(association => {
      const matchesSearch = !searchTerm || 
        association.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        association.location.city.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || association.type === selectedCategory;
      const matchesZone = selectedZone === 'all' || association.zone === selectedZone;
      const matchesRisk = selectedRiskLevel === 'all' || association.riskLevel === selectedRiskLevel;
      
      return matchesSearch && matchesCategory && matchesZone && matchesRisk;
    });
  }, [associations, searchTerm, selectedCategory, selectedZone, selectedRiskLevel]);

  // Préparer les données pour la carte
  const mapData = useMemo(() => {
    return filteredAssociations.map(association => ({
      id: association.id,
      firstName: association.name.split(' ')[0] || '',
      lastName: association.name.split(' ').slice(1).join(' ') || '',
      address: {
        city: association.location.city,
        country: association.location.country
      },
      intelligenceNotes: association.riskLevel !== 'low' ? [{ 
        type: 'SECURITY', 
        priority: association.riskLevel === 'critical' ? 'CRITICAL' : 'HIGH', 
        createdAt: new Date() 
      }] : []
    }));
  }, [filteredAssociations]);

  const handleSelectAssociation = (associationId: string, checked: boolean) => {
    if (checked) {
      setSelectedAssociations(prev => [...prev, associationId]);
    } else {
      setSelectedAssociations(prev => prev.filter(id => id !== associationId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAssociations(filteredAssociations.map(a => a.id));
    } else {
      setSelectedAssociations([]);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Simulation de rafraîchissement - à remplacer par refetch() tRPC
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Données actualisées avec succès');
    } catch (error) {
      toast.error('Erreur lors de l\'actualisation');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = async () => {
    if (selectedAssociations.length === 0) {
      toast.error('Veuillez sélectionner au moins une association à exporter');
      return;
    }
    
    setIsExporting(true);
    try {
      const selectedData = filteredAssociations.filter(a => selectedAssociations.includes(a.id));
      const csvContent = exportToCSV(selectedData);
      downloadCSV(csvContent, 'associations_dgss.csv');
      
      toast.success(`${selectedAssociations.length} associations exportées avec succès`);
      setSelectedAssociations([]);
    } catch (error) {
      toast.error('Erreur lors de l\'export');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = (data: any[]) => {
    const headers = ['ID', 'Nom', 'Type', 'Ville', 'Zone CGF', 'Membres', 'Niveau Risque', 'Statut', 'Activités'];
    const rows = data.map(association => [
      association.id,
      association.name,
      association.type,
      association.location.city,
      association.zone,
      association.members,
      association.riskLevel,
      association.status,
      association.activities?.join('; ') || ''
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

  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return { text: '🟢 Faible', color: 'bg-green-500/20 text-green-500 border-green-500/30' };
      case 'medium':
        return { text: '🟡 Moyen', color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' };
      case 'high':
        return { text: '🟠 Élevé', color: 'bg-orange-500/20 text-orange-500 border-orange-500/30' };
      case 'critical':
        return { text: '🔴 Critique', color: 'bg-red-500/20 text-red-500 border-red-500/30' };
      default:
        return { text: 'Non défini', color: 'bg-gray-500/20 text-gray-500 border-gray-500/30' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      <IntelAgentLayout
        title="Carte des Associations"
        description="129 entités gabonaises surveillées en France"
        currentPage="associations-map"
        backButton={false}
      >
        <div className="space-y-6">
          {/* Stats rapides des associations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {[
              { 
                title: 'Total entités', 
                value: 129, 
                icon: Building2, 
                color: 'blue',
                change: '+5.2%'
              },
              { 
                title: 'Zones CGF', 
                value: 5, 
                icon: MapPin, 
                color: 'green',
                change: '0%'
              },
              { 
                title: 'Sous surveillance', 
                value: Object.values(categoryStats).filter(cat => cat.riskLevel === 'high' || cat.riskLevel === 'critical').length, 
                icon: Eye, 
                color: 'orange',
                change: '+12.5%'
              },
              { 
                title: 'Alertes actives', 
                value: 3, 
                icon: AlertTriangle, 
                color: 'red',
                change: '+2'
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
                    disabled={isExporting || selectedAssociations.length === 0}
                  >
                    {isExporting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    {isExporting ? 'Export...' : `Export ${selectedAssociations.length > 0 ? `(${selectedAssociations.length})` : ''}`}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="py-3 px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {/* Recherche */}
                <div className="space-y-2">
                  <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Recherche
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Nom, ville..."
                      className="pl-10 h-8 text-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Catégorie */}
                <div className="space-y-2">
                  <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Type d'entité
                  </label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Toutes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      {Object.keys(categoryStats).map(category => (
                        <SelectItem key={category} value={category}>
                          {category} ({categoryStats[category as keyof typeof categoryStats].count})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Zone CGF */}
                <div className="space-y-2">
                  <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Zone CGF
                  </label>
                  <Select value={selectedZone} onValueChange={setSelectedZone}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Toutes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      {Object.keys(zoneStats).map(zone => (
                        <SelectItem key={zone} value={zone}>
                          {zone} ({zoneStats[zone as keyof typeof zoneStats]})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Niveau de risque */}
                <div className="space-y-2">
                  <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Niveau de risque
                  </label>
                  <Select value={selectedRiskLevel} onValueChange={setSelectedRiskLevel}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Tous" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="low">🟢 Faible</SelectItem>
                      <SelectItem value="medium">🟡 Moyen</SelectItem>
                      <SelectItem value="high">🟠 Élevé</SelectItem>
                      <SelectItem value="critical">🔴 Critique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Carte interactive des associations */}
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
                <CardTitle className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Building2 className="h-5 w-5" />
                  Cartographie des Associations DGSS
                </CardTitle>
                <div className="flex items-center gap-4">
                  <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">
                    {filteredAssociations.length} entités affichées
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push('/dashboard/carte')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Vue complète
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DashboardCompactMap 
                profiles={mapData}
                isLoading={isLoading}
                className="h-[600px]"
              />
              
              {/* Légende de la carte */}
              <div className="mt-4 p-4 rounded-lg" style={{ background: 'var(--bg-glass-light)' }}>
                <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                  Légende - Niveaux de risque
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Faible</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Moyen</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Élevé</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Critique</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liste des associations */}
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
                      Associations Surveillées
                    </CardTitle>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {filteredAssociations.length} entités sur {associations.length} au total
                    </p>
                  </div>
                  {filteredAssociations.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedAssociations.length === filteredAssociations.length && filteredAssociations.length > 0}
                        onCheckedChange={handleSelectAll}
                        className="opacity-60"
                      />
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Tout sélectionner
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredAssociations.map((association) => {
                  const riskBadge = getRiskBadge(association.riskLevel);
                  
                  return (
                    <div 
                      key={association.id}
                      className="flex items-start gap-3 md:gap-4 p-4 md:p-6 rounded-lg transition-all duration-200 cursor-pointer border-l-4 group"
                      style={{ 
                        background: 'var(--bg-glass-light)',
                        borderLeftColor: association.riskLevel === 'critical' ? '#ef4444' :
                                        association.riskLevel === 'high' ? '#f59e0b' :
                                        association.riskLevel === 'medium' ? '#eab308' : '#10b981'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--interactive-hover)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--bg-glass-light)';
                      }}
                      onClick={() => {
                        // Navigation vers détail association
                        toast.info(`Détails de ${association.name}`, 'Fonctionnalité en développement');
                      }}
                    >
                      <Checkbox 
                        className="transition-opacity mt-1" 
                        checked={selectedAssociations.includes(association.id)}
                        onCheckedChange={(checked) => handleSelectAssociation(association.id, checked as boolean)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      
                      <div className="flex-1">
                        {/* Header avec nom et badges */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
                                  {association.name}
                                </p>
                                <Badge className={`text-xs ${riskBadge.color}`}>
                                  {riskBadge.text}
                                </Badge>
                              </div>
                              <p className="text-xs font-mono mt-1" style={{ color: 'var(--text-muted)' }}>
                                ID: {association.id.toUpperCase()}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Informations détaillées */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                          {/* Localisation */}
                          <div className="space-y-1">
                            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                              🌍 Localisation
                            </p>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" style={{ color: 'var(--text-muted)' }} />
                              <p className="text-xs" style={{ color: 'var(--text-primary)' }}>
                                {association.location.city}
                              </p>
                            </div>
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                              {association.zone}
                            </p>
                          </div>

                          {/* Informations organisation */}
                          <div className="space-y-1">
                            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                              🏢 Organisation
                            </p>
                            <p className="text-xs" style={{ color: 'var(--text-primary)' }}>
                              Type: {association.type}
                            </p>
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" style={{ color: 'var(--text-muted)' }} />
                              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                {association.members} membres
                              </p>
                            </div>
                          </div>

                          {/* Surveillance */}
                          <div className="space-y-1">
                            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                              🕵️ Surveillance
                            </p>
                            <p className="text-xs" style={{ color: 'var(--text-primary)' }}>
                              Statut: {association.status === 'active' ? 'Actif' : 
                                      association.status === 'monitored' ? 'Surveillé' : 'Inactif'}
                            </p>
                            {association.website && (
                              <div className="flex items-center gap-1">
                                <ExternalLink className="h-3 w-3" style={{ color: 'var(--text-muted)' }} />
                                <a 
                                  href={association.website} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs hover:underline" 
                                  style={{ color: 'var(--accent-intel)' }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Site web
                                </a>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Activités */}
                        {association.activities && association.activities.length > 0 && (
                          <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border-glass-secondary)' }}>
                            <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                              📋 Activités principales
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {association.activities.slice(0, 3).map((activity, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {activity}
                                </Badge>
                              ))}
                              {association.activities.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{association.activities.length - 3} autres
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {filteredAssociations.length === 0 && (
                  <div className="text-center py-12">
                    <Building2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p style={{ color: 'var(--text-muted)' }}>
                      Aucune association trouvée avec ces critères
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4" 
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('all');
                        setSelectedZone('all');
                        setSelectedRiskLevel('all');
                      }}
                    >
                      Réinitialiser les filtres
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </IntelAgentLayout>
    </div>
  );
}
