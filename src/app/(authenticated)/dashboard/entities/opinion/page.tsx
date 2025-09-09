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
  MessageCircle, 
  Search, 
  Download,
  Users,
  MapPin,
  Eye,
  AlertTriangle,
  Megaphone,
  Radio,
  Tv,
  Globe,
  TrendingUp,
  Activity,
  Target,
  Building2,
  Zap
} from 'lucide-react';

// Données des groupes d'opinion (4 selon DGSS - risque élevé)
const opinionData = [
  {
    id: 'op-001',
    name: 'Forum Politique Gabonais France',
    location: { city: 'Paris', country: 'France', coordinates: { lat: 48.8566, lng: 2.3522 } },
    zone: 'Zone 1 : Paris IDF',
    members: 156,
    founded: '2017',
    president: 'MOUNGUENGUI Albert',
    contact: { email: 'forum.politique@gabon-france.org', phone: '+33 1 42 56 78 90' },
    riskLevel: 'high',
    surveillanceLevel: 'high_priority',
    politicalOrientation: 'Opposition modérée',
    mediaPresence: 'very_high',
    activities: [
      'Débats politiques publics',
      'Conférences de presse',
      'Mobilisation communautaire',
      'Lobbying institutionnel'
    ],
    influenceLevel: 87,
    mobilizationCapacity: 'high',
    riskFactors: [
      'Capacité de mobilisation massive',
      'Influence sur opinion publique',
      'Connexions médiatiques étendues',
      'Activité politique intensive'
    ],
    budget: 245000,
    lastActivity: '2024-12-19T18:30:00Z'
  }
];

export default function OpinionPage() {
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEntities = useMemo(() => {
    return opinionData.filter(entity => 
      !searchTerm || entity.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      <IntelAgentLayout
        title="Entités d'Opinion"
        description="4 groupes d'opinion politique - Surveillance critique activée"
        currentPage="opinion"
        backButton={false}
      >
        <div className="space-y-6">
          {/* Alerte surveillance */}
          <Card style={{
            background: 'rgba(239, 68, 68, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(239, 68, 68, 0.3)',
          }}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Megaphone className="h-6 w-6 text-red-500" />
                <div>
                  <h3 className="font-semibold text-red-500">
                    SURVEILLANCE POLITIQUE RENFORCÉE
                  </h3>
                  <p className="text-sm text-red-400">
                    Groupes d'opinion sous surveillance continue - Activité politique significative
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats d'opinion */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Groupes d\'opinion', value: filteredEntities.length, icon: MessageCircle, color: 'blue' },
              { title: 'Membres actifs', value: filteredEntities.reduce((sum, e) => sum + e.members, 0), icon: Users, color: 'green' },
              { title: 'Influence moyenne', value: Math.round(filteredEntities.reduce((sum, e) => sum + e.influenceLevel, 0) / filteredEntities.length), icon: TrendingUp, color: 'orange' },
              { title: 'Budget total (K€)', value: Math.round(filteredEntities.reduce((sum, e) => sum + e.budget, 0) / 1000), icon: Target, color: 'red' }
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

          {/* Groupes d'opinion */}
          <Card style={{
            background: 'var(--bg-glass-primary)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--border-glass-primary)',
          }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Groupes d'Opinion Politique - Surveillance Critique
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {filteredEntities.map((entity) => (
                  <div 
                    key={entity.id}
                    className="p-6 rounded-lg border-l-4 border-red-500"
                    style={{ 
                      background: 'var(--bg-glass-light)',
                      border: '1px solid rgba(239, 68, 68, 0.3)'
                    }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>
                          {entity.name}
                        </h3>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {entity.politicalOrientation} • Dirigé par {entity.president}
                        </p>
                      </div>
                      <Badge className="bg-red-500/20 text-red-500 border-red-500/30">
                        🚨 RISQUE ÉLEVÉ
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 rounded-lg" style={{ background: 'var(--bg-glass-secondary)' }}>
                        <div className="text-xl font-bold" style={{ color: 'var(--accent-intel)' }}>
                          {entity.influenceLevel}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          Niveau d'influence
                        </div>
                      </div>
                      <div className="text-center p-3 rounded-lg" style={{ background: 'var(--bg-glass-secondary)' }}>
                        <div className="text-xl font-bold" style={{ color: 'var(--accent-warning)' }}>
                          {entity.members}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          Membres actifs
                        </div>
                      </div>
                      <div className="text-center p-3 rounded-lg" style={{ background: 'var(--bg-glass-secondary)' }}>
                        <div className="text-xl font-bold" style={{ color: 'var(--accent-danger)' }}>
                          {(entity.budget / 1000).toFixed(0)}K€
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          Budget annuel
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs font-medium mb-2 text-red-500">
                        🚨 Facteurs de risque politique
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {entity.riskFactors.map((factor, idx) => (
                          <div key={idx} className="p-2 rounded text-xs bg-red-500/10 text-red-600 border border-red-500/20">
                            <AlertTriangle className="h-3 w-3 inline mr-1" />
                            {factor}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="border-red-500/30 text-red-500">
                        <Eye className="h-4 w-4 mr-2" />
                        Surveillance
                      </Button>
                      <Button variant="outline" size="sm">
                        <Megaphone className="h-4 w-4 mr-2" />
                        Activité médiatique
                      </Button>
                      <Button variant="outline" size="sm">
                        <Target className="h-4 w-4 mr-2" />
                        Analyse influence
                      </Button>
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