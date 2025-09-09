'use client';

import { useState, useMemo } from 'react';
import IntelAgentLayout from '@/components/layouts/intel-agent-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { 
  Trophy, 
  Search, 
  Download,
  Users,
  MapPin,
  Calendar,
  Eye,
  Target,
  Activity,
  Medal,
  Zap,
  Building2
} from 'lucide-react';
import DashboardCompactMap from '@/components/intelligence/dashboard-compact-map';

// Données des entités sportives (10 selon DGSS)
const sportivesData = [
  {
    id: 'sport-001',
    name: 'Club de Football Gabon Paris',
    location: { city: 'Paris', country: 'France', coordinates: { lat: 48.8566, lng: 2.3522 } },
    zone: 'Zone 1 : Paris IDF',
    members: 89,
    founded: '2016',
    president: 'OBAME Jean-Claude',
    sport: 'Football',
    level: 'Amateur',
    ageGroups: ['U15', 'U18', 'Seniors'],
    riskLevel: 'low',
    youthEngagement: 95,
    competitions: ['Championnat départemental', 'Coupe régionale'],
    budget: 28000,
    lastActivity: '2024-12-18T19:30:00Z'
  },
  {
    id: 'sport-002',
    name: 'Association Basket Gabon Lyon',
    location: { city: 'Lyon', country: 'France', coordinates: { lat: 45.764, lng: 4.8357 } },
    zone: 'Zone 4 : Sud-Est',
    members: 67,
    founded: '2019',
    president: 'MINTSA Patrick',
    sport: 'Basketball',
    level: 'Régional',
    ageGroups: ['U13', 'U16', 'Seniors'],
    riskLevel: 'low',
    youthEngagement: 88,
    competitions: ['Championnat régional', 'Tournoi inter-communautés'],
    budget: 15600,
    lastActivity: '2024-12-17T18:15:00Z'
  }
];

export default function SportivesPage() {
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEntities = useMemo(() => {
    return sportivesData.filter(entity => 
      !searchTerm || entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entity.sport.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      <IntelAgentLayout
        title="Entités Sportives"
        description="10 clubs et associations sportives gabonaises"
        currentPage="sportives"
        backButton={false}
      >
        <div className="space-y-6">
          {/* Stats sportives */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Clubs sportifs', value: filteredEntities.length, icon: Trophy, color: 'blue' },
              { title: 'Sportifs', value: filteredEntities.reduce((sum, e) => sum + e.members, 0), icon: Users, color: 'green' },
              { title: 'Engagement jeunes (%)', value: Math.round(filteredEntities.reduce((sum, e) => sum + e.youthEngagement, 0) / filteredEntities.length), icon: Target, color: 'orange' },
              { title: 'Budget total (K€)', value: Math.round(filteredEntities.reduce((sum, e) => sum + e.budget, 0) / 1000), icon: Medal, color: 'red' }
            ].map((stat, index) => (
              <Card key={index} style={{
                background: 'var(--bg-glass-primary)',
                backdropFilter: 'blur(10px)',
                border: '1px solid var(--border-glass-primary)',
              }}>
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

          {/* Liste des clubs */}
          <Card style={{
            background: 'var(--bg-glass-primary)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--border-glass-primary)',
          }}>
            <CardHeader>
              <CardTitle>Clubs et Associations Sportives</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Rechercher club, sport..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                {filteredEntities.map((entity) => (
                  <div 
                    key={entity.id}
                    className="p-6 rounded-lg"
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
                            <Trophy className="h-3 w-3 mr-1" />
                            {entity.sport}
                          </Badge>
                          <Badge className="bg-blue-500/20 text-blue-500">
                            {entity.level}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                              👥 Organisation
                            </p>
                            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                              {entity.members} membres
                            </p>
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                              Engagement jeunes: {entity.youthEngagement}%
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                              🏆 Compétitions
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {entity.competitions.map((comp, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {comp}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                              📊 Catégories
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {entity.ageGroups.map((age, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {age}
                                </Badge>
                              ))}
                            </div>
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