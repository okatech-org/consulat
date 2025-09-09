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
  Heart, 
  Search, 
  Filter, 
  Download,
  RefreshCw,
  Users,
  MapPin,
  Calendar,
  Eye,
  Globe,
  TrendingUp,
  Activity,
  HandHeart,
  Package,
  Plane,
  DollarSign,
  Target,
  Building2
} from 'lucide-react';
import DashboardCompactMap from '@/components/intelligence/dashboard-compact-map';

// Données des entités humanitaires (33 selon DGSS)
const humanitairesData = [
  {
    id: 'hum-001',
    name: 'Collectif Humanitaire Gabon France',
    location: { city: 'Paris', country: 'France', coordinates: { lat: 48.8566, lng: 2.3522 } },
    zone: 'Zone 1 : Paris IDF',
    members: 156,
    founded: '2011',
    president: 'NDONG Patricia',
    contact: { email: 'humanitaire.gabon@gmail.com', phone: '+33 1 45 67 89 01' },
    riskLevel: 'low',
    surveillanceLevel: 'passive',
    missionType: 'Aide internationale',
    targetPopulation: 'Familles vulnérables',
    activities: [
      'Collecte de fonds pour le Gabon',
      'Aide aux réfugiés gabonais',
      'Missions médicales',
      'Soutien éducatif'
    ],
    missions: [
      { date: '2024-11-15', destination: 'Libreville', type: 'Mission médicale', budget: 25000, beneficiaries: 450 },
      { date: '2024-09-20', destination: 'Port-Gentil', type: 'Aide alimentaire', budget: 15000, beneficiaries: 320 },
      { date: '2024-07-10', destination: 'Franceville', type: 'Matériel scolaire', budget: 8500, beneficiaries: 180 }
    ],
    budget: 125000,
    funding: ['Dons privés', 'Subventions UE', 'Partenariats ONG'],
    partnerships: ['Médecins Sans Frontières', 'UNICEF', 'Croix-Rouge'],
    internationalReach: true,
    transparency: 'high',
    efficiency: 94.2,
    lastActivity: '2024-12-18T15:30:00Z'
  },
  {
    id: 'hum-002',
    name: 'Solidarité Gabon Urgence',
    location: { city: 'Lyon', country: 'France', coordinates: { lat: 45.764, lng: 4.8357 } },
    zone: 'Zone 4 : Sud-Est',
    members: 67,
    founded: '2017',
    president: 'MOUNGUENGUI Albert',
    contact: { email: 'solidarite.urgence@outlook.fr', phone: '+33 4 78 90 12 34' },
    riskLevel: 'low',
    surveillanceLevel: 'passive',
    missionType: 'Aide d\'urgence',
    targetPopulation: 'Victimes de catastrophes',
    activities: [
      'Interventions d\'urgence',
      'Aide aux sinistrés',
      'Collecte matériel médical',
      'Formation premiers secours'
    ],
    missions: [
      { date: '2024-10-30', destination: 'Lambaréné', type: 'Aide post-inondation', budget: 18000, beneficiaries: 280 },
      { date: '2024-08-15', destination: 'Oyem', type: 'Matériel médical', budget: 12000, beneficiaries: 150 },
      { date: '2024-06-20', destination: 'Mouila', type: 'Formation secours', budget: 5000, beneficiaries: 45 }
    ],
    budget: 78000,
    funding: ['Dons urgence', 'Crowdfunding', 'Subventions régionales'],
    partnerships: ['Pompiers de Lyon', 'Protection Civile', 'Secours Populaire'],
    internationalReach: true,
    transparency: 'high',
    efficiency: 91.8,
    lastActivity: '2024-12-17T12:20:00Z'
  },
  {
    id: 'hum-003',
    name: 'Aide Éducative Gabon Enfance',
    location: { city: 'Bordeaux', country: 'France', coordinates: { lat: 44.8378, lng: -0.5792 } },
    zone: 'Zone 5 : Sud-Ouest',
    members: 89,
    founded: '2014',
    president: 'TCHIBANGA Marie-Louise',
    contact: { email: 'education.gabon@free.fr', phone: '+33 5 56 78 90 12' },
    riskLevel: 'low',
    surveillanceLevel: 'passive',
    missionType: 'Éducation',
    targetPopulation: 'Enfants défavorisés',
    activities: [
      'Financement de bourses scolaires',
      'Construction d\'écoles',
      'Formation des enseignants',
      'Fournitures scolaires'
    ],
    missions: [
      { date: '2024-09-01', destination: 'Tchibanga', type: 'Rentrée scolaire', budget: 22000, beneficiaries: 380 },
      { date: '2024-06-15', destination: 'Gamba', type: 'Formation enseignants', budget: 15000, beneficiaries: 25 },
      { date: '2024-03-20', destination: 'Mayumba', type: 'Construction école', budget: 45000, beneficiaries: 500 }
    ],
    budget: 156000,
    funding: ['Dons éducation', 'Partenariats écoles', 'Subventions ministère'],
    partnerships: ['Éducation Sans Frontières', 'UNESCO', 'Rectorat Bordeaux'],
    internationalReach: true,
    transparency: 'very_high',
    efficiency: 96.7,
    lastActivity: '2024-12-19T09:15:00Z'
  }
];

export default function HumanitairesPage() {
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMissionType, setSelectedMissionType] = useState<string>('all');
  const [selectedTransparency, setSelectedTransparency] = useState<string>('all');

  const filteredEntities = useMemo(() => {
    return humanitairesData.filter(entity => {
      const matchesSearch = !searchTerm || 
        entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entity.missionType.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMission = selectedMissionType === 'all' || entity.missionType === selectedMissionType;
      const matchesTransparency = selectedTransparency === 'all' || entity.transparency === selectedTransparency;
      return matchesSearch && matchesMission && matchesTransparency;
    });
  }, [searchTerm, selectedMissionType, selectedTransparency]);

  const totalBeneficiaries = filteredEntities.reduce((sum, e) => 
    sum + e.missions.reduce((mSum, m) => mSum + m.beneficiaries, 0), 0
  );
  const totalMissionBudget = filteredEntities.reduce((sum, e) => 
    sum + e.missions.reduce((mSum, m) => mSum + m.budget, 0), 0
  );

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      <IntelAgentLayout
        title="Entités Humanitaires"
        description="33 organisations humanitaires - Aide internationale et solidarité"
        currentPage="humanitaires"
        backButton={false}
      >
        <div className="space-y-6">
          {/* Stats humanitaires */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'ONG/Associations', value: filteredEntities.length, icon: Heart, color: 'blue' },
              { title: 'Bénéficiaires', value: totalBeneficiaries, icon: Users, color: 'green' },
              { title: 'Budget missions (K€)', value: Math.round(totalMissionBudget / 1000), icon: DollarSign, color: 'orange' },
              { title: 'Efficacité moyenne (%)', value: Math.round(filteredEntities.reduce((sum, e) => sum + e.efficiency, 0) / filteredEntities.length), icon: Target, color: 'red' }
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

          {/* Liste des entités humanitaires */}
          <Card style={{
            background: 'var(--bg-glass-primary)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--border-glass-primary)',
          }}>
            <CardHeader>
              <CardTitle>Organisations Humanitaires</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredEntities.map((entity) => (
                  <div 
                    key={entity.id}
                    className="p-6 rounded-lg cursor-pointer"
                    style={{ 
                      background: 'var(--bg-glass-light)',
                      border: '1px solid var(--border-glass-secondary)'
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <Checkbox 
                        checked={selectedEntities.includes(entity.id)}
                        onCheckedChange={(checked) => {
                          setSelectedEntities(prev => 
                            checked ? [...prev, entity.id] : prev.filter(id => id !== entity.id)
                          );
                        }}
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
                            {entity.name}
                          </h3>
                          <Badge className="bg-green-500/20 text-green-500">
                            <Heart className="h-3 w-3 mr-1" />
                            {entity.efficiency.toFixed(1)}% efficace
                          </Badge>
                          <Badge className="bg-blue-500/20 text-blue-500">
                            {entity.transparency}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                              🎯 Mission
                            </p>
                            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                              {entity.missionType}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                              Cible: {entity.targetPopulation}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                              📊 Impact
                            </p>
                            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                              {entity.missions.reduce((sum, m) => sum + m.beneficiaries, 0)} bénéficiaires
                            </p>
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                              {entity.missions.length} missions • {(entity.budget / 1000).toFixed(0)}K€
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                              🤝 Partenariats
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {entity.partnerships.slice(0, 2).map((partner, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {partner}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                            🌍 Dernières missions
                          </p>
                          <div className="space-y-1">
                            {entity.missions.slice(0, 2).map((mission, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-xs">
                                <Plane className="h-3 w-3" style={{ color: 'var(--text-muted)' }} />
                                <span style={{ color: 'var(--text-primary)' }}>
                                  {mission.destination}
                                </span>
                                <span style={{ color: 'var(--text-secondary)' }}>
                                  {mission.type} • {mission.beneficiaries} bénéf. • {(mission.budget / 1000).toFixed(0)}K€
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </IntelAgentLayout>
    </div>
  );
}
