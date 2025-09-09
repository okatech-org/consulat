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
  Music,
  Palette,
  BookOpen,
  Camera,
  Mic,
  Theater,
  Award,
  Globe,
  TrendingUp,
  Activity
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import DashboardCompactMap from '@/components/intelligence/dashboard-compact-map';

// Données des entités socio-culturelles
const socioCulturellesData = [
  {
    id: 'socio-001',
    name: 'Association Culturelle Gabonaise de Lyon',
    location: { city: 'Lyon', country: 'France', coordinates: { lat: 45.764, lng: 4.8357 } },
    zone: 'Zone 4 : Sud-Est',
    members: 89,
    founded: '2013',
    president: 'MINTSA Sylvie',
    contact: { email: 'culture.gabon.lyon@gmail.com', phone: '+33 6 78 90 12 34' },
    riskLevel: 'low',
    surveillanceLevel: 'passive',
    culturalFocus: ['Musique traditionnelle', 'Danse gabonaise', 'Arts visuels'],
    activities: [
      'Festivals culturels',
      'Cours de danse traditionnelle', 
      'Expositions d\'art gabonais',
      'Concerts de musique africaine'
    ],
    events: [
      { date: '2024-12-14', type: 'Concert de fin d\'année', participants: 156, venue: 'Salle des fêtes Lyon' },
      { date: '2024-11-28', type: 'Exposition peinture', participants: 89, venue: 'Galerie municipale' },
      { date: '2024-11-10', type: 'Atelier danse enfants', participants: 24, venue: 'Centre culturel' }
    ],
    budget: 18500,
    funding: ['Subventions culturelles', 'Billetterie événements', 'Mécénat'],
    partnerships: ['Maison des cultures du monde', 'Conservatoire de Lyon', 'Institut français'],
    mediaPresence: 'moderate',
    socialImpact: 'high',
    youthEngagement: 85,
    lastActivity: '2024-12-18T20:15:00Z'
  },
  {
    id: 'socio-002',
    name: 'Collectif Artistique Gabon-France',
    location: { city: 'Paris', country: 'France', coordinates: { lat: 48.8566, lng: 2.3522 } },
    zone: 'Zone 1 : Paris IDF',
    members: 124,
    founded: '2016',
    president: 'NZOGHE Patrick',
    contact: { email: 'collectif.artistique.gf@hotmail.com', phone: '+33 1 42 56 78 90' },
    riskLevel: 'low',
    surveillanceLevel: 'passive',
    culturalFocus: ['Théâtre', 'Littérature', 'Cinéma', 'Arts numériques'],
    activities: [
      'Productions théâtrales',
      'Ateliers d\'écriture',
      'Projections documentaires',
      'Résidences d\'artistes'
    ],
    events: [
      { date: '2024-12-16', type: 'Pièce de théâtre', participants: 234, venue: 'Théâtre de la Ville' },
      { date: '2024-12-01', type: 'Soirée littéraire', participants: 67, venue: 'Librairie Présence Africaine' },
      { date: '2024-11-18', type: 'Atelier cinéma', participants: 32, venue: 'Centre Pompidou' }
    ],
    budget: 34200,
    funding: ['Subventions DRAC', 'Mécénat privé', 'Ventes spectacles'],
    partnerships: ['Théâtre de la Ville', 'Centre Pompidou', 'Présence Africaine'],
    mediaPresence: 'high',
    socialImpact: 'very_high',
    youthEngagement: 92,
    lastActivity: '2024-12-19T10:30:00Z'
  },
  {
    id: 'socio-003',
    name: 'Ensemble Musical Mbolo',
    location: { city: 'Bordeaux', country: 'France', coordinates: { lat: 44.8378, lng: -0.5792 } },
    zone: 'Zone 5 : Sud-Ouest',
    members: 28,
    founded: '2019',
    president: 'BOUSSOUGOU Marie-Antoinette',
    contact: { email: 'mbolo.bordeaux@free.fr', phone: '+33 5 67 89 01 23' },
    riskLevel: 'low',
    surveillanceLevel: 'passive',
    culturalFocus: ['Musique traditionnelle', 'Instruments gabonais', 'Chants sacrés'],
    activities: [
      'Concerts de musique traditionnelle',
      'Ateliers d\'instruments',
      'Enregistrements musicaux',
      'Transmission aux jeunes'
    ],
    events: [
      { date: '2024-12-08', type: 'Concert traditionnel', participants: 89, venue: 'Opéra de Bordeaux' },
      { date: '2024-11-22', type: 'Atelier balafon', participants: 16, venue: 'Conservatoire' },
      { date: '2024-11-05', type: 'Enregistrement album', participants: 12, venue: 'Studio privé' }
    ],
    budget: 9800,
    funding: ['Subventions ville', 'Ventes albums', 'Concerts'],
    partnerships: ['Opéra de Bordeaux', 'Conservatoire régional', 'Radio Afrique'],
    mediaPresence: 'moderate',
    socialImpact: 'medium',
    youthEngagement: 78,
    lastActivity: '2024-12-15T18:45:00Z'
  }
];

export default function SocioCulturellesPage() {
  const router = useRouter();
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedFocus, setSelectedFocus] = useState<string>('all');
  const [selectedImpact, setSelectedImpact] = useState<string>('all');

  const filteredEntities = useMemo(() => {
    return socioCulturellesData.filter(entity => {
      const matchesSearch = !searchTerm || 
        entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entity.location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entity.culturalFocus.some(focus => focus.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesZone = selectedZone === 'all' || entity.zone === selectedZone;
      const matchesFocus = selectedFocus === 'all' || entity.culturalFocus.includes(selectedFocus);
      const matchesImpact = selectedImpact === 'all' || entity.socialImpact === selectedImpact;
      
      return matchesSearch && matchesZone && matchesFocus && matchesImpact;
    });
  }, [searchTerm, selectedZone, selectedFocus, selectedImpact]);

  const handleSelectEntity = (entityId: string, checked: boolean) => {
    setSelectedEntities(prev => 
      checked ? [...prev, entityId] : prev.filter(id => id !== entityId)
    );
  };

  const handleExport = () => {
    if (selectedEntities.length === 0) {
      toast.error('Veuillez sélectionner des entités');
      return;
    }
    toast.success(`${selectedEntities.length} entités socio-culturelles exportées`);
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'very_high':
        return { text: '🔥 Très élevé', color: 'bg-red-500/20 text-red-500' };
      case 'high':
        return { text: '⚡ Élevé', color: 'bg-orange-500/20 text-orange-500' };
      case 'medium':
        return { text: '📊 Moyen', color: 'bg-yellow-500/20 text-yellow-500' };
      case 'low':
        return { text: '📉 Faible', color: 'bg-gray-500/20 text-gray-500' };
      default:
        return { text: 'Non défini', color: 'bg-gray-500/20 text-gray-500' };
    }
  };

  const getCulturalIcon = (focus: string) => {
    switch (focus) {
      case 'Musique traditionnelle': return <Music className="h-3 w-3" />;
      case 'Danse gabonaise': return <Activity className="h-3 w-3" />;
      case 'Arts visuels': return <Palette className="h-3 w-3" />;
      case 'Théâtre': return <Theater className="h-3 w-3" />;
      case 'Littérature': return <BookOpen className="h-3 w-3" />;
      case 'Cinéma': return <Camera className="h-3 w-3" />;
      default: return <Award className="h-3 w-3" />;
    }
  };

  const totalMembers = filteredEntities.reduce((sum, e) => sum + e.members, 0);
  const totalBudget = filteredEntities.reduce((sum, e) => sum + e.budget, 0);
  const avgYouthEngagement = filteredEntities.reduce((sum, e) => sum + e.youthEngagement, 0) / filteredEntities.length || 0;
  const recentEvents = filteredEntities.reduce((sum, e) => sum + e.events.filter(event => 
    new Date(event.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ).length, 0);

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      <IntelAgentLayout
        title="Entités Socio-Culturelles"
        description="28 organisations culturelles gabonaises - Promotion et préservation du patrimoine"
        currentPage="socio-culturelles"
        backButton={false}
      >
        <div className="space-y-6">
          {/* Stats culturelles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Organisations', value: filteredEntities.length, icon: Theater, color: 'blue' },
              { title: 'Artistes/Membres', value: totalMembers, icon: Users, color: 'green' },
              { title: 'Budget culturel (K€)', value: Math.round(totalBudget / 1000), icon: TrendingUp, color: 'orange' },
              { title: 'Engagement jeunes (%)', value: Math.round(avgYouthEngagement), icon: Award, color: 'red' }
            ].map((stat, index) => (
              <Card key={index} className="hover:-translate-y-1 transition-all duration-300"
                style={{
                  background: 'var(--bg-glass-primary)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid var(--border-glass-primary)',
                  boxShadow: 'var(--shadow-glass)',
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{
                      background: `rgba(${stat.color === 'blue' ? '59, 130, 246' : 
                                         stat.color === 'green' ? '16, 185, 129' : 
                                         stat.color === 'orange' ? '245, 158, 11' : '239, 68, 68'}, 0.2)`
                    }}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        {stat.value}
                      </div>
                      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {stat.title}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filtres spécialisés culture */}
          <Card style={{
            background: 'var(--bg-glass-primary)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--border-glass-primary)',
          }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtres Culturels et Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Nom, domaine artistique..."
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
                
                <Select value={selectedFocus} onValueChange={setSelectedFocus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Domaine artistique" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous domaines</SelectItem>
                    <SelectItem value="Musique traditionnelle">🎵 Musique</SelectItem>
                    <SelectItem value="Danse gabonaise">💃 Danse</SelectItem>
                    <SelectItem value="Arts visuels">🎨 Arts visuels</SelectItem>
                    <SelectItem value="Théâtre">🎭 Théâtre</SelectItem>
                    <SelectItem value="Littérature">📚 Littérature</SelectItem>
                    <SelectItem value="Cinéma">🎬 Cinéma</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={selectedImpact} onValueChange={setSelectedImpact}>
                  <SelectTrigger>
                    <SelectValue placeholder="Impact social" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous impacts</SelectItem>
                    <SelectItem value="very_high">🔥 Très élevé</SelectItem>
                    <SelectItem value="high">⚡ Élevé</SelectItem>
                    <SelectItem value="medium">📊 Moyen</SelectItem>
                    <SelectItem value="low">📉 Faible</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedEntities.length > 0 && (
                <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'var(--bg-glass-light)' }}>
                  <span className="text-sm">{selectedEntities.length} sélectionnées</span>
                  <Button size="sm" onClick={handleExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Exporter
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    const totalEvents = selectedEntities.reduce((sum, id) => {
                      const entity = socioCulturellesData.find(e => e.id === id);
                      return sum + (entity?.events.length || 0);
                    }, 0);
                    toast.info('Analyse culturelle', `${totalEvents} événements dans la sélection`);
                  }}>
                    <Music className="h-4 w-4 mr-2" />
                    Analyser
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Carte culturelle */}
          <Card style={{
            background: 'var(--bg-glass-primary)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--border-glass-primary)',
          }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Cartographie des Entités Culturelles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DashboardCompactMap 
                profiles={filteredEntities.map(entity => ({
                  id: entity.id,
                  firstName: entity.name.split(' ')[0],
                  lastName: entity.name.split(' ').slice(1).join(' '),
                  address: { city: entity.location.city, country: entity.location.country },
                  intelligenceNotes: []
                }))}
                isLoading={false}
                className="h-[400px]"
              />
            </CardContent>
          </Card>

          {/* Liste des entités */}
          <Card style={{
            background: 'var(--bg-glass-primary)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--border-glass-primary)',
          }}>
            <CardHeader>
              <CardTitle>Organisations Socio-Culturelles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredEntities.map((entity) => {
                  const impactBadge = getImpactBadge(entity.socialImpact);
                  
                  return (
                    <div 
                      key={entity.id}
                      className="p-6 rounded-lg cursor-pointer transition-all duration-200 group"
                      style={{ 
                        background: 'var(--bg-glass-light)',
                        border: '1px solid var(--border-glass-secondary)'
                      }}
                      onClick={() => toast.info(`${entity.name}`, 'Analyse culturelle détaillée')}
                    >
                      <div className="flex items-start gap-4">
                        <Checkbox 
                          checked={selectedEntities.includes(entity.id)}
                          onCheckedChange={(checked) => handleSelectEntity(entity.id, checked as boolean)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
                              {entity.name}
                            </h3>
                            <Badge className={impactBadge.color}>
                              {impactBadge.text}
                            </Badge>
                            <Badge className="bg-purple-500/20 text-purple-500">
                              <Award className="h-3 w-3 mr-1" />
                              {entity.youthEngagement}% jeunes
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                                🎨 Domaines artistiques
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {entity.culturalFocus.slice(0, 2).map((focus, idx) => (
                                  <div key={idx} className="flex items-center gap-1">
                                    {getCulturalIcon(focus)}
                                    <Badge variant="outline" className="text-xs">
                                      {focus}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                                📍 Localisation & Budget
                              </p>
                              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                                {entity.location.city} • {entity.zone}
                              </p>
                              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                Budget: {(entity.budget / 1000).toFixed(1)}K€ • {entity.members} membres
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
                                Fondée en {entity.founded}
                              </p>
                            </div>
                          </div>

                          <div className="mb-4">
                            <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                              📅 Événements récents ({entity.events.length})
                            </p>
                            <div className="space-y-1">
                              {entity.events.slice(0, 2).map((event, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs">
                                  <Calendar className="h-3 w-3" style={{ color: 'var(--text-muted)' }} />
                                  <span style={{ color: 'var(--text-primary)' }}>
                                    {new Date(event.date).toLocaleDateString()}
                                  </span>
                                  <span style={{ color: 'var(--text-secondary)' }}>
                                    {event.type} • {event.participants} participants • {event.venue}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              Analyser
                            </Button>
                            <Button variant="outline" size="sm">
                              <Calendar className="h-4 w-4 mr-2" />
                              Événements
                            </Button>
                            <Button variant="outline" size="sm">
                              <Users className="h-4 w-4 mr-2" />
                              Membres
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </IntelAgentLayout>
    </div>
  );
}
