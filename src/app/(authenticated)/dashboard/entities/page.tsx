'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import IntelAgentLayout from '@/components/layouts/intel-agent-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Users, 
  Search, 
  Filter, 
  Download,
  RefreshCw,
  Loader2,
  MapPin,
  Calendar,
  Eye,
  AlertTriangle,
  Building2,
  Globe,
  TrendingUp,
  Activity,
  Heart,
  Phone,
  Mail,
  FileText,
  Trophy,
  Scale,
  MessageCircle,
  Theater,
  Briefcase,
  BarChart3,
  Grid3X3,
  List,
  Map,
  Target,
  Shield,
  Megaphone
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import DashboardCompactMap from '@/components/intelligence/dashboard-compact-map';

// Données consolidées représentatives des 129 entités DGSS
const entitiesData = {
  communautaires: Array.from({ length: 20 }, (_, i) => ({
    id: `comm-${String(i + 1).padStart(3, '0')}`,
    name: i === 0 ? 'Association des Gabonais d\'Amiens (AGA)' :
          i === 1 ? 'Cercle des Gabonais de Strasbourg' :
          i === 2 ? 'BANA BA Gabon Metz' :
          `Association Communautaire ${i + 1}`,
    location: { 
      city: ['Amiens', 'Strasbourg', 'Metz', 'Lille', 'Reims', 'Nancy', 'Troyes'][i % 7],
      country: 'France', 
      coordinates: { lat: 48.8 + Math.random() * 2, lng: 2.3 + Math.random() * 4 } 
    },
    zone: i < 7 ? 'Zone 3 : Nord-Est' : i < 14 ? 'Zone 1 : Paris IDF' : 'Zone 4 : Sud-Est',
    members: 25 + Math.floor(Math.random() * 50),
    president: ['MOUNGUENGUI Jean-Pierre', 'TCHIBANGA Marie-Claire', 'OBAME Jean-Claude'][i % 3],
    riskLevel: i < 2 ? 'medium' : 'low',
    surveillanceLevel: i < 2 ? 'active' : 'passive',
    budget: 8000 + Math.floor(Math.random() * 15000),
    lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'communautaires'
  })),
  
  'socio-culturelles': Array.from({ length: 28 }, (_, i) => ({
    id: `socio-${String(i + 1).padStart(3, '0')}`,
    name: i === 0 ? 'Association Culturelle Gabonaise de Lyon' :
          i === 1 ? 'Collectif Artistique Gabon-France' :
          `Organisation Culturelle ${i + 1}`,
    location: { 
      city: ['Lyon', 'Paris', 'Bordeaux', 'Marseille', 'Toulouse', 'Nice'][i % 6],
      country: 'France', 
      coordinates: { lat: 45.7 + Math.random() * 3, lng: 2.1 + Math.random() * 5 } 
    },
    zone: i < 10 ? 'Zone 4 : Sud-Est' : i < 20 ? 'Zone 1 : Paris IDF' : 'Zone 5 : Sud-Ouest',
    members: 30 + Math.floor(Math.random() * 100),
    president: ['MINTSA Sylvie', 'NZOGHE Patrick', 'BOUSSOUGOU Marie'][i % 3],
    riskLevel: 'low',
    surveillanceLevel: 'passive',
    budget: 10000 + Math.floor(Math.random() * 25000),
    lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'socio-culturelles'
  })),
  
  humanitaires: Array.from({ length: 33 }, (_, i) => ({
    id: `hum-${String(i + 1).padStart(3, '0')}`,
    name: i === 0 ? 'Collectif Humanitaire Gabon France' :
          i === 1 ? 'Solidarité Gabon Urgence' :
          `ONG Humanitaire ${i + 1}`,
    location: { 
      city: ['Paris', 'Lyon', 'Bordeaux', 'Marseille', 'Nantes', 'Montpellier'][i % 6],
      country: 'France', 
      coordinates: { lat: 46.2 + Math.random() * 3, lng: 1.5 + Math.random() * 6 } 
    },
    zone: i < 12 ? 'Zone 1 : Paris IDF' : i < 24 ? 'Zone 4 : Sud-Est' : 'Zone 5 : Sud-Ouest',
    members: 40 + Math.floor(Math.random() * 120),
    president: ['NDONG Patricia', 'MOUNGUENGUI Albert', 'TCHIBANGA Marie-Louise'][i % 3],
    riskLevel: 'low',
    surveillanceLevel: 'passive',
    budget: 50000 + Math.floor(Math.random() * 100000),
    lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'humanitaires'
  })),
  
  entrepreneurs: Array.from({ length: 21 }, (_, i) => ({
    id: `ent-${String(i + 1).padStart(3, '0')}`,
    name: i === 0 ? 'Réseau Entrepreneurs Gabonais Europe' :
          i === 1 ? 'Incubateur Gabon Tech' :
          `Réseau Entrepreneurial ${i + 1}`,
    location: { 
      city: ['Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Toulouse'][i % 5],
      country: 'France', 
      coordinates: { lat: 47.2 + Math.random() * 2, lng: 2.0 + Math.random() * 4 } 
    },
    zone: i < 8 ? 'Zone 1 : Paris IDF' : i < 16 ? 'Zone 4 : Sud-Est' : 'Zone 5 : Sud-Ouest',
    members: 50 + Math.floor(Math.random() * 150),
    president: ['ASSARI Ulrich', 'TCHIBANGA Marie', 'OBAME Patrick'][i % 3],
    riskLevel: i < 3 ? 'high' : 'medium',
    surveillanceLevel: i < 3 ? 'active' : 'monitoring',
    budget: 100000 + Math.floor(Math.random() * 200000),
    lastActivity: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'entrepreneurs'
  })),
  
  sportives: Array.from({ length: 10 }, (_, i) => ({
    id: `sport-${String(i + 1).padStart(3, '0')}`,
    name: i === 0 ? 'Club de Football Gabon Paris' :
          i === 1 ? 'Association Basket Gabon Lyon' :
          `Club Sportif ${i + 1}`,
    location: { 
      city: ['Paris', 'Lyon', 'Marseille', 'Bordeaux'][i % 4],
      country: 'France', 
      coordinates: { lat: 47.0 + Math.random() * 2, lng: 2.0 + Math.random() * 3 } 
    },
    zone: i < 4 ? 'Zone 1 : Paris IDF' : i < 8 ? 'Zone 4 : Sud-Est' : 'Zone 5 : Sud-Ouest',
    members: 30 + Math.floor(Math.random() * 70),
    president: ['OBAME Jean-Claude', 'MINTSA Patrick', 'NDONG Albert'][i % 3],
    riskLevel: 'low',
    surveillanceLevel: 'passive',
    budget: 15000 + Math.floor(Math.random() * 20000),
    lastActivity: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'sportives'
  })),
  
  juridiques: [
    {
      id: 'jur-001', name: 'Cabinet Juridique Gabon Conseil', location: { city: 'Paris', country: 'France', coordinates: { lat: 48.8566, lng: 2.3522 } }, zone: 'Zone 1 : Paris IDF', members: 12, president: 'NZOGHE Maître Jean-Baptiste', riskLevel: 'critical', surveillanceLevel: 'high_priority', budget: 180000, lastActivity: '2024-12-19T14:20:00Z', category: 'juridiques'
    },
    {
      id: 'jur-002', name: 'Association Juridique Gabon Droits', location: { city: 'Marseille', country: 'France', coordinates: { lat: 43.2965, lng: 5.3698 } }, zone: 'Zone 4 : Sud-Est', members: 8, president: 'BOUSSOUGOU Maître Françoise', riskLevel: 'critical', surveillanceLevel: 'high_priority', budget: 95000, lastActivity: '2024-12-19T16:45:00Z', category: 'juridiques'
    }
  ],
  
  opinion: [
    {
      id: 'op-001', name: 'Forum Politique Gabonais France', location: { city: 'Paris', country: 'France', coordinates: { lat: 48.8566, lng: 2.3522 } }, zone: 'Zone 1 : Paris IDF', members: 156, president: 'MOUNGUENGUI Albert', riskLevel: 'high', surveillanceLevel: 'high_priority', budget: 245000, lastActivity: '2024-12-19T18:30:00Z', category: 'opinion'
    },
    {
      id: 'op-002', name: 'Collectif Citoyen Gabon Libre', location: { city: 'Lyon', country: 'France', coordinates: { lat: 45.764, lng: 4.8357 } }, zone: 'Zone 4 : Sud-Est', members: 89, president: 'NDONG Marie-Antoinette', riskLevel: 'high', surveillanceLevel: 'high_priority', budget: 78000, lastActivity: '2024-12-19T20:15:00Z', category: 'opinion'
    },
    {
      id: 'op-003', name: 'Mouvement Démocratique Gabonais', location: { city: 'Bordeaux', country: 'France', coordinates: { lat: 44.8378, lng: -0.5792 } }, zone: 'Zone 5 : Sud-Ouest', members: 67, president: 'TCHIBANGA François', riskLevel: 'high', surveillanceLevel: 'high_priority', budget: 125000, lastActivity: '2024-12-18T22:10:00Z', category: 'opinion'
    },
    {
      id: 'op-004', name: 'Collectif Réforme Gabon', location: { city: 'Marseille', country: 'France', coordinates: { lat: 43.2965, lng: 5.3698 } }, zone: 'Zone 4 : Sud-Est', members: 45, president: 'NZOGHE Marie-France', riskLevel: 'high', surveillanceLevel: 'high_priority', budget: 89000, lastActivity: '2024-12-17T15:25:00Z', category: 'opinion'
    }
  ]
};

// Configuration des catégories avec métadonnées
const categoriesConfig = {
  all: { 
    label: 'Toutes', 
    icon: Building2, 
    color: 'blue', 
    count: 0,
    description: 'Vue d\'ensemble de toutes les entités'
  },
  communautaires: { 
    label: 'Communautaires', 
    icon: Users, 
    color: 'green', 
    count: 20,
    riskLevel: 'medium',
    description: 'Associations d\'accueil et d\'intégration'
  },
  'socio-culturelles': { 
    label: 'Socio-Culturelles', 
    icon: Theater, 
    color: 'purple', 
    count: 28,
    riskLevel: 'low',
    description: 'Organisations artistiques et culturelles'
  },
  humanitaires: { 
    label: 'Humanitaires', 
    icon: Heart, 
    color: 'pink', 
    count: 33,
    riskLevel: 'low',
    description: 'ONG et associations d\'aide internationale'
  },
  entrepreneurs: { 
    label: 'Entrepreneurs', 
    icon: Briefcase, 
    color: 'orange', 
    count: 21,
    riskLevel: 'high',
    description: 'Réseaux économiques et incubateurs'
  },
  sportives: { 
    label: 'Sportives', 
    icon: Trophy, 
    color: 'yellow', 
    count: 10,
    riskLevel: 'low',
    description: 'Clubs et associations sportives'
  },
  juridiques: { 
    label: 'Juridiques', 
    icon: Scale, 
    color: 'red', 
    count: 2,
    riskLevel: 'critical',
    description: 'Cabinets juridiques et aide légale'
  },
  opinion: { 
    label: 'D\'Opinion', 
    icon: MessageCircle, 
    color: 'red', 
    count: 4,
    riskLevel: 'high',
    description: 'Groupes politiques et d\'opinion'
  }
};

export default function EntitiesSurveilleesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('all');

  // Gérer les paramètres d'URL pour ouvrir directement un onglet
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'critical') {
      // Afficher seulement les entités critiques
      setSelectedRiskLevel('critical');
      setActiveTab('all');
    } else if (tab && categoriesConfig[tab as keyof typeof categoriesConfig]) {
      setActiveTab(tab);
    }
  }, [searchParams]);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('list');
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('all');
  const [selectedSurveillance, setSelectedSurveillance] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Aplatir toutes les entités pour les calculs globaux
  const allEntities = useMemo(() => {
    return Object.values(entitiesData).flat();
  }, []);

  // Filtrer les entités selon l'onglet actif et les filtres
  const filteredEntities = useMemo(() => {
    let entities = activeTab === 'all' ? allEntities : entitiesData[activeTab as keyof typeof entitiesData] || [];
    
    return entities.filter(entity => {
      const matchesSearch = !searchTerm || 
        entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entity.location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entity.president.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesZone = selectedZone === 'all' || entity.zone === selectedZone;
      const matchesRisk = selectedRiskLevel === 'all' || entity.riskLevel === selectedRiskLevel;
      const matchesSurveillance = selectedSurveillance === 'all' || entity.surveillanceLevel === selectedSurveillance;
      
      return matchesSearch && matchesZone && matchesRisk && matchesSurveillance;
    });
  }, [activeTab, allEntities, searchTerm, selectedZone, selectedRiskLevel, selectedSurveillance]);

  const handleSelectEntity = (entityId: string, checked: boolean) => {
    setSelectedEntities(prev => 
      checked ? [...prev, entityId] : prev.filter(id => id !== entityId)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedEntities(checked ? filteredEntities.map(e => e.id) : []);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Données actualisées', 'Toutes les entités surveillées mises à jour');
    } catch (error) {
      toast.error('Erreur lors de l\'actualisation');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = async () => {
    if (selectedEntities.length === 0) {
      toast.error('Sélection requise', 'Veuillez sélectionner au moins une entité');
      return;
    }
    
    setIsExporting(true);
    try {
      const selectedData = filteredEntities.filter(e => selectedEntities.includes(e.id));
      const csvContent = exportToCSV(selectedData);
      downloadCSV(csvContent, `entites_surveillees_${activeTab}_dgss.csv`);
      
      toast.success('Export réussi', `${selectedEntities.length} entités exportées`);
      setSelectedEntities([]);
    } catch (error) {
      toast.error('Erreur d\'export');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = (data: any[]) => {
    const headers = ['ID', 'Nom', 'Catégorie', 'Ville', 'Zone CGF', 'Président', 'Membres', 'Budget', 'Niveau Risque', 'Surveillance', 'Dernière Activité'];
    const rows = data.map(entity => [
      entity.id,
      entity.name,
      entity.category,
      entity.location.city,
      entity.zone,
      entity.president,
      entity.members,
      entity.budget,
      entity.riskLevel,
      entity.surveillanceLevel,
      new Date(entity.lastActivity).toLocaleDateString()
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
        return { text: '🔴 Élevé', color: 'bg-red-500/20 text-red-500 border-red-500/30' };
      case 'critical':
        return { text: '🚨 Critique', color: 'bg-red-600/30 text-red-600 border-red-600/50' };
      default:
        return { text: 'Non défini', color: 'bg-gray-500/20 text-gray-500 border-gray-500/30' };
    }
  };

  const getSurveillanceBadge = (level: string) => {
    switch (level) {
      case 'passive':
        return { text: '👁️ Passive', color: 'bg-blue-500/20 text-blue-500' };
      case 'active':
        return { text: '🔍 Active', color: 'bg-orange-500/20 text-orange-500' };
      case 'high_priority':
        return { text: '🚨 Prioritaire', color: 'bg-red-500/20 text-red-500' };
      default:
        return { text: 'Standard', color: 'bg-gray-500/20 text-gray-500' };
    }
  };

  const getCategoryIcon = (category: string) => {
    const config = categoriesConfig[category as keyof typeof categoriesConfig];
    return config ? <config.icon className="h-4 w-4" /> : <Building2 className="h-4 w-4" />;
  };

  // Statistiques par catégorie
  const categoryStats = useMemo(() => {
    const stats: Record<string, any> = {};
    
    Object.entries(categoriesConfig).forEach(([key, config]) => {
      if (key === 'all') {
        stats[key] = {
          ...config,
          count: allEntities.length,
          totalMembers: allEntities.reduce((sum, e) => sum + e.members, 0),
          totalBudget: allEntities.reduce((sum, e) => sum + e.budget, 0),
          highRisk: allEntities.filter(e => e.riskLevel === 'high' || e.riskLevel === 'critical').length
        };
      } else {
        const categoryEntities = entitiesData[key as keyof typeof entitiesData] || [];
        stats[key] = {
          ...config,
          count: categoryEntities.length,
          totalMembers: categoryEntities.reduce((sum, e) => sum + e.members, 0),
          totalBudget: categoryEntities.reduce((sum, e) => sum + e.budget, 0),
          highRisk: categoryEntities.filter(e => e.riskLevel === 'high' || e.riskLevel === 'critical').length
        };
      }
    });
    
    return stats;
  }, [allEntities]);

  // Calculer les stats de l'onglet actif
  const activeStats = categoryStats[activeTab];
  const criticalEntities = filteredEntities.filter(e => e.riskLevel === 'critical').length;
  const activeMonitoring = filteredEntities.filter(e => e.surveillanceLevel === 'active' || e.surveillanceLevel === 'high_priority').length;

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      <IntelAgentLayout
        title="Entités Surveillées"
        description="Système unifié de surveillance des 129 entités gabonaises en France"
        currentPage="entities"
        backButton={false}
      >
        <div className="space-y-6">
          {/* Vue d'ensemble - Stats globales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { 
                title: 'Total entités', 
                value: filteredEntities.length, 
                icon: Building2, 
                color: 'blue',
                change: `sur ${allEntities.length}`
              },
              { 
                title: 'Membres totaux', 
                value: filteredEntities.reduce((sum, e) => sum + e.members, 0), 
                icon: Users, 
                color: 'green',
                change: '+12'
              },
              { 
                title: 'Surveillance active', 
                value: activeMonitoring, 
                icon: Eye, 
                color: 'orange',
                change: '+3'
              },
              { 
                title: 'Niveau critique', 
                value: criticalEntities, 
                icon: AlertTriangle, 
                color: 'red',
                change: criticalEntities > 0 ? '🚨' : '✅'
              }
            ].map((stat, index) => (
              <Card 
                key={index}
                className="hover:-translate-y-1 transition-all duration-300"
                style={{
                  background: 'var(--bg-glass-primary)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid var(--border-glass-primary)',
                  boxShadow: 'var(--shadow-glass)',
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div 
                      className="p-2 rounded-lg"
                      style={{
                        background: stat.color === 'blue' ? 'rgba(59, 130, 246, 0.2)' : 
                                   stat.color === 'green' ? 'rgba(16, 185, 129, 0.2)' : 
                                   stat.color === 'orange' ? 'rgba(245, 158, 11, 0.2)' : 
                                   'rgba(239, 68, 68, 0.2)',
                        color: stat.color === 'blue' ? '#3b82f6' : 
                               stat.color === 'green' ? '#10b981' : 
                               stat.color === 'orange' ? '#f59e0b' : '#ef4444'
                      }}
                    >
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {stat.change}
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                    {stat.value}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {stat.title}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filtres globaux */}
          <Card style={{
            background: 'var(--bg-glass-primary)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--border-glass-primary)',
          }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtres Globaux et Actions
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'map' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('map')}
                    >
                      <Map className="h-4 w-4" />
                    </Button>
                  </div>
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
                    Actualiser
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleExport}
                    disabled={isExporting || selectedEntities.length === 0}
                  >
                    {isExporting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Export ({selectedEntities.length})
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Nom, ville, président..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Select value={selectedZone} onValueChange={setSelectedZone}>
                  <SelectTrigger>
                    <SelectValue placeholder="Zone CGF" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes zones</SelectItem>
                    <SelectItem value="Zone 1 : Paris IDF">Zone 1 - Paris IDF</SelectItem>
                    <SelectItem value="Zone 3 : Nord-Est">Zone 3 - Nord-Est</SelectItem>
                    <SelectItem value="Zone 4 : Sud-Est">Zone 4 - Sud-Est</SelectItem>
                    <SelectItem value="Zone 5 : Sud-Ouest">Zone 5 - Sud-Ouest</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={selectedRiskLevel} onValueChange={setSelectedRiskLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Niveau de risque" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous niveaux</SelectItem>
                    <SelectItem value="low">🟢 Faible</SelectItem>
                    <SelectItem value="medium">🟡 Moyen</SelectItem>
                    <SelectItem value="high">🔴 Élevé</SelectItem>
                    <SelectItem value="critical">🚨 Critique</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={selectedSurveillance} onValueChange={setSelectedSurveillance}>
                  <SelectTrigger>
                    <SelectValue placeholder="Surveillance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous types</SelectItem>
                    <SelectItem value="passive">👁️ Passive</SelectItem>
                    <SelectItem value="active">🔍 Active</SelectItem>
                    <SelectItem value="high_priority">🚨 Prioritaire</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Navigation par onglets avec compteurs */}
          <Card style={{
            background: 'var(--bg-glass-primary)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--border-glass-primary)',
          }}>
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 h-auto p-1">
                  {Object.entries(categoriesConfig).map(([key, config]) => {
                    const count = activeTab === key ? filteredEntities.length : config.count;
                    const isActive = activeTab === key;
                    
                    return (
                      <TabsTrigger 
                        key={key} 
                        value={key} 
                        className={`flex flex-col items-center gap-1 p-3 ${
                          isActive ? 'bg-blue-500/20 text-blue-600' : ''
                        } ${config.riskLevel === 'critical' ? 'border-red-500/30' : ''}`}
                      >
                        <div className="flex items-center gap-1">
                          <config.icon className="h-4 w-4" />
                          {config.riskLevel === 'critical' && <AlertTriangle className="h-3 w-3 text-red-500" />}
                        </div>
                        <span className="text-xs font-medium">{config.label}</span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            config.riskLevel === 'critical' ? 'border-red-500 text-red-500' :
                            config.riskLevel === 'high' ? 'border-orange-500 text-orange-500' :
                            'border-blue-500 text-blue-500'
                          }`}
                        >
                          {count}
                        </Badge>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                {/* Contenu des onglets */}
                <div className="p-6">
                  {/* Barre de sélection */}
                  {selectedEntities.length > 0 && (
                    <div className="mb-6 p-4 rounded-lg" style={{ background: 'var(--bg-glass-light)', border: '1px solid var(--border-glass-secondary)' }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            {selectedEntities.length} entité(s) sélectionnée(s)
                          </span>
                          <Badge className="bg-blue-500/20 text-blue-500">
                            {selectedEntities.filter(id => {
                              const entity = filteredEntities.find(e => e.id === id);
                              return entity?.riskLevel === 'high' || entity?.riskLevel === 'critical';
                            }).length} à risque élevé
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setSelectedEntities([])}>
                            Désélectionner
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => {
                              const categories = [...new Set(selectedEntities.map(id => {
                                const entity = filteredEntities.find(e => e.id === id);
                                return entity?.category;
                              }))];
                              toast.info('Analyse groupée', `${categories.length} catégories dans la sélection`);
                            }}
                          >
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Analyser
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Vue carte */}
                  {viewMode === 'map' && (
                    <Card className="mb-6" style={{
                      background: 'var(--bg-glass-secondary)',
                      border: '1px solid var(--border-glass-secondary)',
                    }}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5" />
                          Cartographie des Entités - {activeStats.label}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <DashboardCompactMap 
                          profiles={filteredEntities.map(entity => ({
                            id: entity.id,
                            firstName: entity.name.split(' ')[0],
                            lastName: entity.name.split(' ').slice(1).join(' '),
                            address: { city: entity.location.city, country: entity.location.country },
                            intelligenceNotes: entity.riskLevel !== 'low' ? [{ 
                              type: 'GENERAL', 
                              priority: entity.riskLevel === 'critical' ? 'CRITICAL' : 
                                       entity.riskLevel === 'high' ? 'HIGH' : 'MEDIUM', 
                              createdAt: new Date() 
                            }] : []
                          }))}
                          isLoading={false}
                          className="h-[500px]"
                        />
                      </CardContent>
                    </Card>
                  )}

                  {/* Vue grille */}
                  {viewMode === 'grid' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredEntities.map((entity) => {
                        const riskBadge = getRiskBadge(entity.riskLevel);
                        const surveillanceBadge = getSurveillanceBadge(entity.surveillanceLevel);
                        
                        return (
                          <Card 
                            key={entity.id}
                            className="hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                            style={{
                              background: 'var(--bg-glass-light)',
                              border: '1px solid var(--border-glass-secondary)',
                              borderLeft: `4px solid ${
                                entity.riskLevel === 'critical' ? '#dc2626' :
                                entity.riskLevel === 'high' ? '#ef4444' :
                                entity.riskLevel === 'medium' ? '#f59e0b' : '#10b981'
                              }`
                            }}
                            onClick={() => {
                              router.push(`/dashboard/entities/${entity.category}/${entity.id}`);
                            }}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  {getCategoryIcon(entity.category)}
                                  <h3 className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                                    {entity.name.length > 25 ? entity.name.substring(0, 25) + '...' : entity.name}
                                  </h3>
                                </div>
                                <Checkbox 
                                  checked={selectedEntities.includes(entity.id)}
                                  onCheckedChange={(checked) => handleSelectEntity(entity.id, checked as boolean)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                              
                              <div className="space-y-2 mb-3">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" style={{ color: 'var(--text-muted)' }} />
                                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                    {entity.location.city} • {entity.zone.split(' ')[1]}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="h-3 w-3" style={{ color: 'var(--text-muted)' }} />
                                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                    {entity.members} membres • {(entity.budget / 1000).toFixed(0)}K€
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <Badge className={riskBadge.color}>
                                  {riskBadge.text}
                                </Badge>
                                <Badge className={surveillanceBadge.color}>
                                  {surveillanceBadge.text}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}

                  {/* Vue liste (par défaut) */}
                  {viewMode === 'list' && (
                    <Card style={{
                      background: 'var(--bg-glass-secondary)',
                      border: '1px solid var(--border-glass-secondary)',
                    }}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>
                              {activeStats.label} - {activeStats.description}
                            </CardTitle>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                              {filteredEntities.length} entités affichées
                            </p>
                          </div>
                          {filteredEntities.length > 0 && (
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={selectedEntities.length === filteredEntities.length && filteredEntities.length > 0}
                                onCheckedChange={handleSelectAll}
                              />
                              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                Tout sélectionner
                              </span>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {filteredEntities.map((entity) => {
                            const riskBadge = getRiskBadge(entity.riskLevel);
                            const surveillanceBadge = getSurveillanceBadge(entity.surveillanceLevel);
                            
                            return (
                              <div 
                                key={entity.id}
                                className="flex items-start gap-4 p-4 rounded-lg transition-all duration-200 cursor-pointer group border-l-4"
                                style={{ 
                                  background: 'var(--bg-glass-light)',
                                  borderLeftColor: entity.riskLevel === 'critical' ? '#dc2626' :
                                                  entity.riskLevel === 'high' ? '#ef4444' :
                                                  entity.riskLevel === 'medium' ? '#f59e0b' : '#10b981'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = 'var(--interactive-hover)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'var(--bg-glass-light)';
                                }}
                                onClick={() => {
                                  router.push(`/dashboard/entities/${entity.category}/${entity.id}`);
                                }}
                              >
                                <Checkbox 
                                  checked={selectedEntities.includes(entity.id)}
                                  onCheckedChange={(checked) => handleSelectEntity(entity.id, checked as boolean)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="mt-1"
                                />
                                
                                <div className="flex-1">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      {getCategoryIcon(entity.category)}
                                      <h3 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
                                        {entity.name}
                                      </h3>
                                      <Badge variant="outline" className="text-xs">
                                        {categoriesConfig[entity.category as keyof typeof categoriesConfig]?.label}
                                      </Badge>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                      <Badge className={riskBadge.color}>
                                        {riskBadge.text}
                                      </Badge>
                                      <Badge className={surveillanceBadge.color}>
                                        {surveillanceBadge.text}
                                      </Badge>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                                    <div>
                                      <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                                        📍 Localisation
                                      </p>
                                      <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                                        {entity.location.city}
                                      </p>
                                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                        {entity.zone}
                                      </p>
                                    </div>

                                    <div>
                                      <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                                        👨‍💼 Direction
                                      </p>
                                      <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                                        {entity.president}
                                      </p>
                                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                        {entity.members} membres
                                      </p>
                                    </div>

                                    <div>
                                      <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                                        💰 Budget & Activité
                                      </p>
                                      <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                                        {(entity.budget / 1000).toFixed(0)}K€
                                      </p>
                                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                        Dernière activité: {new Date(entity.lastActivity).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Actions spécifiques selon le niveau de risque */}
                                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="outline" size="sm">
                                      <Eye className="h-4 w-4 mr-2" />
                                      Analyser
                                    </Button>
                                    <Button variant="outline" size="sm">
                                      <FileText className="h-4 w-4 mr-2" />
                                      Rapport
                                    </Button>
                                    {(entity.riskLevel === 'high' || entity.riskLevel === 'critical') && (
                                      <Button variant="outline" size="sm" className="border-red-500/30 text-red-500">
                                        <Shield className="h-4 w-4 mr-2" />
                                        Surveillance
                                      </Button>
                                    )}
                                    <Button variant="outline" size="sm">
                                      <Mail className="h-4 w-4 mr-2" />
                                      Contact
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}

                          {filteredEntities.length === 0 && (
                            <div className="text-center py-12">
                              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
                              <p style={{ color: 'var(--text-muted)' }}>
                                Aucune entité trouvée dans cette catégorie
                              </p>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="mt-4" 
                                onClick={() => {
                                  setSearchTerm('');
                                  setSelectedZone('all');
                                  setSelectedRiskLevel('all');
                                  setSelectedSurveillance('all');
                                }}
                              >
                                Réinitialiser les filtres
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </IntelAgentLayout>
    </div>
  );
}
