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
  Scale, 
  Search, 
  Download,
  Users,
  MapPin,
  Eye,
  AlertTriangle,
  FileText,
  Gavel,
  Shield,
  Building2,
  Phone,
  Mail
} from 'lucide-react';

// Données des entités juridiques (2 selon DGSS - niveau critique)
const juridiquesData = [
  {
    id: 'jur-001',
    name: 'Cabinet Juridique Gabon Conseil',
    location: { city: 'Paris', country: 'France', coordinates: { lat: 48.8566, lng: 2.3522 } },
    zone: 'Zone 1 : Paris IDF',
    members: 12,
    founded: '2013',
    president: 'NZOGHE Maître Jean-Baptiste',
    contact: { email: 'contact@gabon-conseil.fr', phone: '+33 1 45 67 89 01' },
    riskLevel: 'critical',
    surveillanceLevel: 'high_priority',
    specializations: [
      'Droit de l\'immigration',
      'Aide juridique aux Gabonais',
      'Procédures consulaires',
      'Droit des affaires franco-gabonais'
    ],
    clientsServed: 456,
    casesHandled: 234,
    successRate: 89.7,
    politicalConnections: [
      'Député franco-gabonais',
      'Conseil municipal Paris 15e',
      'Commission immigration'
    ],
    budget: 180000,
    riskFactors: [
      'Influence sur procédures administratives',
      'Connexions politiques multiples',
      'Accès à informations sensibles',
      'Capacité de mobilisation communautaire'
    ],
    lastActivity: '2024-12-19T14:20:00Z'
  },
  {
    id: 'jur-002',
    name: 'Association Juridique Gabon Droits',
    location: { city: 'Marseille', country: 'France', coordinates: { lat: 43.2965, lng: 5.3698 } },
    zone: 'Zone 4 : Sud-Est',
    members: 8,
    founded: '2020',
    president: 'BOUSSOUGOU Maître Françoise',
    contact: { email: 'droits.gabon@justice.org', phone: '+33 4 91 23 45 67' },
    riskLevel: 'critical',
    surveillanceLevel: 'high_priority',
    specializations: [
      'Droits de l\'homme',
      'Protection des mineurs gabonais',
      'Droit familial international',
      'Contentieux administratif'
    ],
    clientsServed: 189,
    casesHandled: 98,
    successRate: 92.3,
    politicalConnections: [
      'Défenseur des droits',
      'Commission droits de l\'homme',
      'Réseau avocats africains'
    ],
    budget: 95000,
    riskFactors: [
      'Accès aux instances juridiques',
      'Influence sur décisions judiciaires',
      'Réseau international étendu',
      'Capacité de contestation institutionnelle'
    ],
    lastActivity: '2024-12-19T16:45:00Z'
  }
];

export default function JuridiquesPage() {
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEntities = useMemo(() => {
    return juridiquesData.filter(entity => 
      !searchTerm || entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entity.specializations.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm]);

  const totalClients = filteredEntities.reduce((sum, e) => sum + e.clientsServed, 0);
  const totalCases = filteredEntities.reduce((sum, e) => sum + e.casesHandled, 0);
  const avgSuccessRate = filteredEntities.reduce((sum, e) => sum + e.successRate, 0) / filteredEntities.length || 0;

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      <IntelAgentLayout
        title="Entités Juridiques"
        description="2 entités juridiques - Surveillance critique niveau maximum"
        currentPage="juridiques"
        backButton={false}
      >
        <div className="space-y-6">
          {/* Alerte critique */}
          <Card style={{
            background: 'rgba(239, 68, 68, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(239, 68, 68, 0.3)',
          }}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-red-500" />
                <div>
                  <h3 className="font-semibold text-red-500">
                    SURVEILLANCE CRITIQUE ACTIVÉE
                  </h3>
                  <p className="text-sm text-red-400">
                    Entités juridiques sous surveillance prioritaire - Accès privilégié aux institutions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats juridiques */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Entités juridiques', value: filteredEntities.length, icon: Scale, color: 'blue' },
              { title: 'Clients assistés', value: totalClients, icon: Users, color: 'green' },
              { title: 'Dossiers traités', value: totalCases, icon: FileText, color: 'orange' },
              { title: 'Taux de succès (%)', value: Math.round(avgSuccessRate), icon: Target, color: 'red' }
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

          {/* Entités juridiques */}
          <Card style={{
            background: 'var(--bg-glass-primary)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--border-glass-primary)',
          }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-500" />
                Entités Juridiques - Surveillance Critique
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
                          Dirigé par {entity.president} • Fondé en {entity.founded}
                        </p>
                      </div>
                      <Badge className="bg-red-500/20 text-red-500 border-red-500/30">
                        🚨 CRITIQUE
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 rounded-lg" style={{ background: 'var(--bg-glass-secondary)' }}>
                        <div className="text-xl font-bold" style={{ color: 'var(--accent-intel)' }}>
                          {entity.clientsServed}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          Clients assistés
                        </div>
                      </div>
                      <div className="text-center p-3 rounded-lg" style={{ background: 'var(--bg-glass-secondary)' }}>
                        <div className="text-xl font-bold" style={{ color: 'var(--accent-warning)' }}>
                          {entity.casesHandled}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          Dossiers traités
                        </div>
                      </div>
                      <div className="text-center p-3 rounded-lg" style={{ background: 'var(--bg-glass-secondary)' }}>
                        <div className="text-xl font-bold" style={{ color: 'var(--accent-success)' }}>
                          {entity.successRate.toFixed(1)}%
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          Taux de succès
                        </div>
                      </div>
                      <div className="text-center p-3 rounded-lg" style={{ background: 'var(--bg-glass-secondary)' }}>
                        <div className="text-xl font-bold" style={{ color: 'var(--accent-danger)' }}>
                          {entity.politicalConnections.length}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          Connexions politiques
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs font-medium mb-2 text-red-500">
                        🚨 Facteurs de risque critiques
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
                        <FileText className="h-4 w-4 mr-2" />
                        Dossiers
                      </Button>
                      <Button variant="outline" size="sm">
                        <Shield className="h-4 w-4 mr-2" />
                        Sécurité
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