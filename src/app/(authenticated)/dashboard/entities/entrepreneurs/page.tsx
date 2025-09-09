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
  Briefcase, 
  Search, 
  Filter, 
  Download,
  Users,
  MapPin,
  TrendingUp,
  DollarSign,
  Globe,
  Building2,
  Target,
  BarChart3,
  Zap,
  Eye,
  Network,
  AlertTriangle
} from 'lucide-react';
import DashboardCompactMap from '@/components/intelligence/dashboard-compact-map';

// Données des entrepreneurs (21 selon DGSS)
const entrepreneursData = [
  {
    id: 'ent-001',
    name: 'Réseau Entrepreneurs Gabonais Europe',
    location: { city: 'Paris', country: 'France', coordinates: { lat: 48.8566, lng: 2.3522 } },
    zone: 'Zone 1 : Paris IDF',
    members: 187,
    founded: '2015',
    president: 'ASSARI Ulrich',
    contact: { email: 'reseau.entrepreneurs@gabon-europe.org', phone: '+33 1 42 78 90 12' },
    riskLevel: 'high',
    surveillanceLevel: 'active',
    sector: 'Multi-sectoriel',
    businessModel: 'Réseau professionnel',
    activities: [
      'Networking d\'affaires',
      'Investissements transfrontaliers',
      'Formations entrepreneuriales',
      'Missions économiques au Gabon'
    ],
    financialMetrics: {
      totalRevenue: 2850000,
      memberContributions: 890000,
      investmentVolume: 15200000,
      jobsCreated: 234
    },
    partnerships: ['BPI France', 'CCI Paris', 'Ministère Économie Gabon'],
    internationalActivity: true,
    crossBorderInvestments: 8,
    riskFactors: [
      'Volumes financiers importants',
      'Connexions politiques',
      'Activité transfrontalière intensive'
    ],
    lastActivity: '2024-12-19T11:45:00Z'
  },
  {
    id: 'ent-002',
    name: 'Incubateur Gabon Tech',
    location: { city: 'Lyon', country: 'France', coordinates: { lat: 45.764, lng: 4.8357 } },
    zone: 'Zone 4 : Sud-Est',
    members: 67,
    founded: '2018',
    president: 'TCHIBANGA Marie',
    contact: { email: 'incubateur@gabon-tech.fr', phone: '+33 4 72 34 56 78' },
    riskLevel: 'medium',
    surveillanceLevel: 'monitoring',
    sector: 'Technologies',
    businessModel: 'Incubateur/Accélérateur',
    activities: [
      'Incubation de startups',
      'Formation numérique',
      'Transfert technologique',
      'Innovation collaborative'
    ],
    financialMetrics: {
      totalRevenue: 1240000,
      memberContributions: 340000,
      investmentVolume: 5600000,
      jobsCreated: 89
    },
    partnerships: ['Métropole Lyon', 'Bpifrance', 'Station F'],
    internationalActivity: true,
    crossBorderInvestments: 3,
    riskFactors: [
      'Innovation technologique sensible',
      'Transferts de compétences',
      'Propriété intellectuelle'
    ],
    lastActivity: '2024-12-18T16:20:00Z'
  }
];

export default function EntrepreneursPage() {
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEntities = useMemo(() => {
    return entrepreneursData.filter(entity => 
      !searchTerm || entity.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const totalRevenue = filteredEntities.reduce((sum, e) => sum + e.financialMetrics.totalRevenue, 0);
  const totalJobs = filteredEntities.reduce((sum, e) => sum + e.financialMetrics.jobsCreated, 0);

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      <IntelAgentLayout
        title="Entrepreneurs"
        description="21 entités entrepreneuriales - Réseaux économiques sous surveillance renforcée"
        currentPage="entrepreneurs"
        backButton={false}
      >
        <div className="space-y-6">
          {/* Stats entrepreneuriales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Réseaux/Incubateurs', value: filteredEntities.length, icon: Building2, color: 'blue' },
              { title: 'CA Total (M€)', value: Math.round(totalRevenue / 1000000), icon: DollarSign, color: 'green' },
              { title: 'Emplois créés', value: totalJobs, icon: Users, color: 'orange' },
              { title: 'Surveillance renforcée', value: filteredEntities.filter(e => e.riskLevel === 'high').length, icon: AlertTriangle, color: 'red' }
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

          {/* Liste des entrepreneurs */}
          <Card style={{
            background: 'var(--bg-glass-primary)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--border-glass-primary)',
          }}>
            <CardHeader>
              <CardTitle>Entités Entrepreneuriales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {filteredEntities.map((entity) => (
                  <div 
                    key={entity.id}
                    className="p-6 rounded-lg border-l-4"
                    style={{ 
                      background: 'var(--bg-glass-light)',
                      borderLeftColor: entity.riskLevel === 'high' ? '#ef4444' : '#f59e0b'
                    }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>
                          {entity.name}
                        </h3>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {entity.sector} • {entity.businessModel} • Fondé en {entity.founded}
                        </p>
                      </div>
                      <Badge className={entity.riskLevel === 'high' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'}>
                        {entity.riskLevel === 'high' ? '🔴 Risque élevé' : '🟡 Surveillance'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 rounded-lg" style={{ background: 'var(--bg-glass-secondary)' }}>
                        <div className="text-xl font-bold" style={{ color: 'var(--accent-intel)' }}>
                          {(entity.financialMetrics.totalRevenue / 1000000).toFixed(1)}M€
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          Chiffre d'affaires
                        </div>
                      </div>
                      <div className="text-center p-3 rounded-lg" style={{ background: 'var(--bg-glass-secondary)' }}>
                        <div className="text-xl font-bold" style={{ color: 'var(--accent-warning)' }}>
                          {entity.financialMetrics.jobsCreated}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          Emplois créés
                        </div>
                      </div>
                      <div className="text-center p-3 rounded-lg" style={{ background: 'var(--bg-glass-secondary)' }}>
                        <div className="text-xl font-bold" style={{ color: 'var(--accent-success)' }}>
                          {entity.members}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          Membres
                        </div>
                      </div>
                      <div className="text-center p-3 rounded-lg" style={{ background: 'var(--bg-glass-secondary)' }}>
                        <div className="text-xl font-bold" style={{ color: 'var(--accent-danger)' }}>
                          {entity.crossBorderInvestments}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          Investissements transfrontaliers
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                        ⚠️ Facteurs de risque identifiés
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {entity.riskFactors.map((factor, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs bg-red-500/10 text-red-600">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Analyser
                      </Button>
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Finances
                      </Button>
                      <Button variant="outline" size="sm">
                        <Network className="h-4 w-4 mr-2" />
                        Réseau
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
