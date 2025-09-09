'use client';

import { useState, useMemo } from 'react';
import IntelAgentLayout from '@/components/layouts/intel-agent-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
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
  UserPlus,
  Phone,
  Mail,
  ExternalLink,
  FileText
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import DashboardCompactMap from '@/components/intelligence/dashboard-compact-map';

// Données des associations communautaires basées sur DGSS
const communautairesData = [
  {
    id: 'comm-001',
    name: 'Association des Gabonais d\'Amiens (AGA)',
    location: { city: 'Amiens', country: 'France', coordinates: { lat: 49.8942, lng: 2.2957 } },
    zone: 'Zone 3 : Nord-Est',
    members: 45,
    founded: '2015',
    president: 'MOUNGUENGUI Jean-Pierre',
    contact: { email: 'aga.amiens@gmail.com', phone: '+33 6 12 34 56 78' },
    riskLevel: 'medium',
    surveillanceLevel: 'active',
    activities: [
      'Accueil des nouveaux arrivants',
      'Événements culturels gabonais', 
      'Aide à l\'intégration',
      'Soutien administratif'
    ],
    events: [
      { date: '2024-12-15', type: 'Assemblée générale', participants: 32 },
      { date: '2024-11-20', type: 'Fête nationale gabonaise', participants: 78 },
      { date: '2024-10-10', type: 'Accueil nouveaux membres', participants: 15 }
    ],
    financialHealth: 'stable',
    budget: 12500,
    funding: ['Cotisations membres', 'Subventions municipales'],
    partnerships: ['Mairie d\'Amiens', 'Centre social du quartier'],
    lastActivity: '2024-12-18T14:30:00Z'
  },
  {
    id: 'comm-002',
    name: 'Cercle des Gabonais de Strasbourg',
    location: { city: 'Strasbourg', country: 'France', coordinates: { lat: 48.5734, lng: 7.7521 } },
    zone: 'Zone 3 : Nord-Est',
    members: 32,
    founded: '2018',
    president: 'TCHIBANGA Marie-Claire',
    contact: { email: 'gabon.strasbourg@outlook.fr', phone: '+33 7 89 12 34 56' },
    riskLevel: 'low',
    surveillanceLevel: 'passive',
    activities: [
      'Rencontres mensuelles',
      'Soutien éducatif aux enfants',
      'Aide aux familles en difficulté',
      'Promotion de la culture gabonaise'
    ],
    events: [
      { date: '2024-12-10', type: 'Réunion mensuelle', participants: 28 },
      { date: '2024-11-25', type: 'Soutien scolaire', participants: 12 },
      { date: '2024-11-05', type: 'Collecte alimentaire', participants: 20 }
    ],
    financialHealth: 'growing',
    budget: 8900,
    funding: ['Cotisations', 'Dons privés'],
    partnerships: ['Université de Strasbourg', 'Association franco-africaine'],
    lastActivity: '2024-12-16T16:45:00Z'
  },
  {
    id: 'comm-003',
    name: 'BANA BA Gabon Metz',
    location: { city: 'Metz', country: 'France', coordinates: { lat: 49.1193, lng: 6.1757 } },
    zone: 'Zone 3 : Nord-Est',
    members: 67,
    founded: '2012',
    president: 'OBAME Jean-Claude',
    contact: { email: 'banaba.metz@yahoo.fr', phone: '+33 6 45 67 89 01' },
    riskLevel: 'medium',
    surveillanceLevel: 'monitoring',
    activities: [
      'Préservation des traditions',
      'Enseignement des langues gabonaises',
      'Événements culturels',
      'Solidarité communautaire'
    ],
    events: [
      { date: '2024-12-12', type: 'Festival culturel', participants: 156 },
      { date: '2024-11-30', type: 'Cours de langue fang', participants: 24 },
      { date: '2024-11-15', type: 'Collecte pour le Gabon', participants: 45 }
    ],
    financialHealth: 'stable',
    budget: 15600,
    funding: ['Cotisations', 'Subventions régionales', 'Ventes événements'],
    partnerships: ['Consulat du Gabon', 'Maison des associations Metz'],
    lastActivity: '2024-12-17T19:20:00Z'
  }
];

const surveillanceLevels = {
  passive: { label: '👁️ Passive', color: 'bg-blue-500/20 text-blue-500', description: 'Surveillance de routine' },
  active: { label: '🔍 Active', color: 'bg-orange-500/20 text-orange-500', description: 'Surveillance renforcée' },
  monitoring: { label: '📊 Monitoring', color: 'bg-yellow-500/20 text-yellow-500', description: 'Suivi continu' },
  high_priority: { label: '🚨 Prioritaire', color: 'bg-red-500/20 text-red-500', description: 'Surveillance prioritaire' }
};

export default function CommunautairesPage() {
  const router = useRouter();
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('all');
  const [selectedSurveillance, setSelectedSurveillance] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const filteredEntities = useMemo(() => {
    return communautairesData.filter(entity => {
      const matchesSearch = !searchTerm || 
        entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entity.location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entity.president.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesZone = selectedZone === 'all' || entity.zone === selectedZone;
      const matchesRisk = selectedRiskLevel === 'all' || entity.riskLevel === selectedRiskLevel;
      const matchesSurveillance = selectedSurveillance === 'all' || entity.surveillanceLevel === selectedSurveillance;
      
      return matchesSearch && matchesZone && matchesRisk && matchesSurveillance;
    });
  }, [searchTerm, selectedZone, selectedRiskLevel, selectedSurveillance]);

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
      toast.success('Données actualisées', 'Informations des entités communautaires mises à jour');
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
      downloadCSV(csvContent, 'entites_communautaires_dgss.csv');
      
      toast.success('Export réussi', `${selectedEntities.length} entités exportées`);
      setSelectedEntities([]);
    } catch (error) {
      toast.error('Erreur d\'export');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = (data: any[]) => {
    const headers = ['ID', 'Nom', 'Ville', 'Zone CGF', 'Président', 'Membres', 'Budget', 'Niveau Risque', 'Surveillance', 'Dernière Activité'];
    const rows = data.map(entity => [
      entity.id,
      entity.name,
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
      default:
        return { text: 'Non défini', color: 'bg-gray-500/20 text-gray-500 border-gray-500/30' };
    }
  };

  const getFinancialBadge = (health: string) => {
    switch (health) {
      case 'growing':
        return { text: '📈 Croissance', color: 'bg-green-500/20 text-green-500' };
      case 'stable':
        return { text: '📊 Stable', color: 'bg-blue-500/20 text-blue-500' };
      case 'declining':
        return { text: '📉 Déclin', color: 'bg-red-500/20 text-red-500' };
      default:
        return { text: 'Non défini', color: 'bg-gray-500/20 text-gray-500' };
    }
  };

  // Statistiques
  const totalMembers = filteredEntities.reduce((sum, e) => sum + e.members, 0);
  const totalBudget = filteredEntities.reduce((sum, e) => sum + e.budget, 0);
  const activeEntities = filteredEntities.filter(e => e.surveillanceLevel === 'active').length;
  const recentEvents = filteredEntities.reduce((sum, e) => sum + e.events.filter(event => 
    new Date(event.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ).length, 0);

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      <IntelAgentLayout
        title="Entités Communautaires"
        description="20 associations communautaires gabonaises sous surveillance"
        currentPage="communautaires"
        backButton={false}
      >
        <div className="space-y-6">
          {/* Stats des entités communautaires */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { 
                title: 'Associations', 
                value: filteredEntities.length, 
                icon: Building2, 
                color: 'blue',
                change: '+2'
              },
              { 
                title: 'Membres totaux', 
                value: totalMembers, 
                icon: Users, 
                color: 'green',
                change: '+12'
              },
              { 
                title: 'Budget total (K€)', 
                value: Math.round(totalBudget / 1000), 
                icon: TrendingUp, 
                color: 'orange',
                change: '+8%'
              },
              { 
                title: 'Surveillance active', 
                value: activeEntities, 
                icon: Eye, 
                color: 'red',
                change: '+1'
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
                    <Badge variant={stat.change.includes('-') ? 'destructive' : 'default'} className="text-xs">
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

          {/* Filtres et contrôles */}
          <Card style={{
            background: 'var(--bg-glass-primary)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--border-glass-primary)',
          }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtres et Actions Communautaires
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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
                  </SelectContent>
                </Select>
                
                <Select value={selectedSurveillance} onValueChange={setSelectedSurveillance}>
                  <SelectTrigger>
                    <SelectValue placeholder="Niveau surveillance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous niveaux</SelectItem>
                    <SelectItem value="passive">👁️ Passive</SelectItem>
                    <SelectItem value="active">🔍 Active</SelectItem>
                    <SelectItem value="monitoring">📊 Monitoring</SelectItem>
                    <SelectItem value="high_priority">🚨 Prioritaire</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Actions groupées */}
              {selectedEntities.length > 0 && (
                <div className="p-4 rounded-lg mb-4" style={{ background: 'var(--bg-glass-light)', border: '1px solid var(--border-glass-secondary)' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {selectedEntities.length} entité(s) sélectionnée(s)
                      </span>
                      <Badge className="bg-blue-500/20 text-blue-500">
                        {selectedEntities.filter(id => {
                          const entity = communautairesData.find(e => e.id === id);
                          return entity?.riskLevel === 'medium' || entity?.riskLevel === 'high';
                        }).length} à surveiller
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setSelectedEntities([])}>
                        Désélectionner
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => {
                          const totalMembersSelected = selectedEntities.reduce((sum, id) => {
                            const entity = communautairesData.find(e => e.id === id);
                            return sum + (entity?.members || 0);
                          }, 0);
                          toast.info('Analyse groupée', `${totalMembersSelected} membres dans la sélection`);
                        }}
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Analyser
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Carte des entités communautaires */}
          <Card style={{
            background: 'var(--bg-glass-primary)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--border-glass-primary)',
          }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Répartition Géographique des Entités Communautaires
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
                    priority: entity.riskLevel === 'high' ? 'HIGH' : 'MEDIUM', 
                    createdAt: new Date() 
                  }] : []
                }))}
                isLoading={false}
                className="h-[400px]"
              />
            </CardContent>
          </Card>

          {/* Liste détaillée des entités */}
          <Card style={{
            background: 'var(--bg-glass-primary)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--border-glass-primary)',
          }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Entités Communautaires Surveillées</CardTitle>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {filteredEntities.length} entités sur {communautairesData.length} au total
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
              <div className="space-y-4">
                {filteredEntities.map((entity) => {
                  const riskBadge = getRiskBadge(entity.riskLevel);
                  const financialBadge = getFinancialBadge(entity.financialHealth);
                  const surveillanceBadge = surveillanceLevels[entity.surveillanceLevel as keyof typeof surveillanceLevels];
                  
                  return (
                    <div 
                      key={entity.id}
                      className="p-6 rounded-lg transition-all duration-200 cursor-pointer group border-l-4"
                      style={{ 
                        background: 'var(--bg-glass-light)',
                        borderLeftColor: entity.riskLevel === 'high' ? '#ef4444' :
                                        entity.riskLevel === 'medium' ? '#f59e0b' : '#10b981'
                      }}
                      onClick={() => {
                        toast.info(`Entité ${entity.name}`, 'Analyse détaillée en développement');
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <Checkbox 
                          checked={selectedEntities.includes(entity.id)}
                          onCheckedChange={(checked) => handleSelectEntity(entity.id, checked as boolean)}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1"
                        />
                        
                        <div className="flex-1">
                          {/* Header de l'entité */}
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>
                                {entity.name}
                              </h3>
                              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                Fondée en {entity.founded} • Président: {entity.president}
                              </p>
                            </div>
                            <div className="flex flex-col gap-1">
                              <Badge className={riskBadge.color}>
                                {riskBadge.text}
                              </Badge>
                              <Badge className={surveillanceBadge.color}>
                                {surveillanceBadge.label}
                              </Badge>
                            </div>
                          </div>

                          {/* Informations principales */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                                📍 Localisation
                              </p>
                              <div className="flex items-center gap-1 mb-1">
                                <MapPin className="h-3 w-3" style={{ color: 'var(--text-muted)' }} />
                                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                                  {entity.location.city}
                                </span>
                              </div>
                              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                {entity.zone}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                                👥 Organisation
                              </p>
                              <div className="flex items-center gap-1 mb-1">
                                <Users className="h-3 w-3" style={{ color: 'var(--text-muted)' }} />
                                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                                  {entity.members} membres
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={financialBadge.color}>
                                  {financialBadge.text}
                                </Badge>
                                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                  {(entity.budget / 1000).toFixed(1)}K€
                                </span>
                              </div>
                            </div>

                            <div>
                              <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                                📞 Contact
                              </p>
                              <div className="flex items-center gap-1 mb-1">
                                <Mail className="h-3 w-3" style={{ color: 'var(--text-muted)' }} />
                                <span className="text-xs" style={{ color: 'var(--text-primary)' }}>
                                  {entity.contact.email}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" style={{ color: 'var(--text-muted)' }} />
                                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                  {entity.contact.phone}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Activités principales */}
                          <div className="mb-4">
                            <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                              🎯 Activités principales
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {entity.activities.map((activity, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {activity}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Événements récents */}
                          <div className="mb-4">
                            <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                              📅 Événements récents
                            </p>
                            <div className="space-y-2">
                              {entity.events.slice(0, 2).map((event, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs">
                                  <Calendar className="h-3 w-3" style={{ color: 'var(--text-muted)' }} />
                                  <span style={{ color: 'var(--text-primary)' }}>
                                    {new Date(event.date).toLocaleDateString()}
                                  </span>
                                  <span style={{ color: 'var(--text-secondary)' }}>
                                    {event.type} ({event.participants} participants)
                                  </span>
                                </div>
                              ))}
                              {entity.events.length > 2 && (
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                  +{entity.events.length - 2} autres événements
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Partenariats */}
                          <div className="mb-4">
                            <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                              🤝 Partenariats
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {entity.partnerships.map((partner, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs bg-blue-500/10 text-blue-600">
                                  {partner}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Actions de l'entité */}
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity pt-2" style={{ borderTop: '1px solid var(--border-glass-secondary)' }}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              Analyser
                            </Button>
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4 mr-2" />
                              Rapport
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                toast.info('Surveillance', `Modifier le niveau de surveillance de ${entity.name}`);
                              }}
                            >
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              Surveillance
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(`mailto:${entity.contact.email}`, '_blank');
                              }}
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              Contact
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredEntities.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p style={{ color: 'var(--text-muted)' }}>
                      Aucune entité communautaire trouvée
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
        </div>
      </IntelAgentLayout>
    </div>
  );
}
