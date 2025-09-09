'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import IntelAgentLayout from '@/components/layouts/intel-agent-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  Target, 
  ArrowLeft,
  Download,
  RefreshCw,
  Loader2,
  Users,
  Network,
  Brain,
  AlertTriangle,
  Eye,
  BarChart3,
  MapPin,
  Building2,
  Activity,
  FileText,
  Calendar,
  TrendingUp
} from 'lucide-react';

// Données détaillées du cluster (simulées)
const getClusterDetails = (clusterId: string) => {
  const clusterData: Record<string, any> = {
    'cluster-001': {
      id: 'cluster-001',
      name: 'Réseau Entrepreneurial Île-de-France',
      algorithm: 'Modularité Sociale',
      confidence: 92.3,
      density: 0.78,
      cohesion: 0.85,
      riskLevel: 'medium',
      center: { city: 'Paris', lat: 48.8566, lng: 2.3522 },
      radius: 25,
      detectedAt: '2024-12-19T10:30:00Z',
      nodes: [
        { 
          id: 'prof-001', 
          name: 'ASSARI Ulrich', 
          type: 'profile', 
          influence: 95, 
          connections: 23,
          role: 'leader',
          joinedAt: '2024-01-15',
          activity: 'Coordination des activités entrepreneuriales'
        },
        { 
          id: 'prof-002', 
          name: 'TCHIBANGA Marie', 
          type: 'profile', 
          influence: 87, 
          connections: 18,
          role: 'member',
          joinedAt: '2024-03-20',
          activity: 'Développement de partenariats'
        },
        { 
          id: 'asso-001', 
          name: 'Gabon Business Network Paris', 
          type: 'association', 
          influence: 89, 
          connections: 45,
          role: 'hub',
          joinedAt: '2024-01-01',
          activity: 'Plateforme de networking principal'
        }
      ],
      connections: [
        { from: 'prof-001', to: 'asso-001', strength: 0.95, type: 'leadership' },
        { from: 'prof-002', to: 'asso-001', strength: 0.82, type: 'active_member' },
        { from: 'prof-001', to: 'prof-002', strength: 0.67, type: 'collaboration' }
      ],
      activities: [
        { date: '2024-12-15', type: 'meeting', description: 'Réunion mensuelle du réseau', participants: 23 },
        { date: '2024-12-10', type: 'event', description: 'Conférence entrepreneurs gabonais', participants: 89 },
        { date: '2024-12-05', type: 'partnership', description: 'Signature partenariat avec entreprise française', participants: 5 }
      ],
      metrics: {
        totalMembers: 124,
        activeMembers: 89,
        monthlyMeetings: 4,
        economicImpact: 2500000,
        growthRate: 12.5,
        retentionRate: 87.3
      },
      riskFactors: [
        { factor: 'Croissance rapide', level: 'medium', description: 'Augmentation de 25% des membres en 6 mois' },
        { factor: 'Connexions internationales', level: 'high', description: 'Nouveaux partenaires en Afrique centrale' },
        { factor: 'Activité financière', level: 'medium', description: 'Transactions importantes détectées' }
      ]
    }
  };

  return clusterData[clusterId] || null;
};

export default function ClusterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clusterId = params.id as string;
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const clusterData = getClusterDetails(clusterId);

  if (!clusterData) {
    return (
      <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
        <IntelAgentLayout
          title="Cluster Non Trouvé"
          description="Le cluster demandé n'existe pas"
          currentPage="clusters"
          backButton={true}
        >
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Target className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p style={{ color: 'var(--text-muted)' }}>
                Cluster non trouvé
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => router.push('/dashboard/clusters')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux clusters
              </Button>
            </div>
          </div>
        </IntelAgentLayout>
      </div>
    );
  }

  const handleAnalyzeCluster = async () => {
    setIsAnalyzing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      toast.success('Analyse terminée', `Cluster ${clusterData.name} analysé avec succès`);
    } catch (error) {
      toast.error('Erreur d\'analyse');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExportCluster = async () => {
    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const csvContent = exportClusterToCSV(clusterData);
      downloadCSV(csvContent, `cluster_${clusterData.id}_details.csv`);
      toast.success('Export réussi', 'Données du cluster exportées');
    } catch (error) {
      toast.error('Erreur d\'export');
    } finally {
      setIsExporting(false);
    }
  };

  const exportClusterToCSV = (data: any) => {
    const headers = ['Type', 'ID', 'Nom', 'Influence', 'Connexions', 'Rôle', 'Date d\'adhésion', 'Activité'];
    const rows = data.nodes.map((node: any) => [
      node.type,
      node.id,
      node.name,
      node.influence,
      node.connections,
      node.role,
      node.joinedAt,
      node.activity
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

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      <IntelAgentLayout
        title={`Cluster: ${clusterData.name}`}
        description={`Analyse détaillée - ${clusterData.nodes.length} nœuds • Confiance: ${clusterData.confidence}%`}
        currentPage="clusters"
        backButton={true}
      >
        <div className="space-y-6">
          {/* Métriques principales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { 
                title: 'Membres totaux', 
                value: clusterData.metrics.totalMembers, 
                icon: Users, 
                color: 'blue'
              },
              { 
                title: 'Membres actifs', 
                value: clusterData.metrics.activeMembers, 
                icon: Activity, 
                color: 'green'
              },
              { 
                title: 'Impact économique (€)', 
                value: `${(clusterData.metrics.economicImpact / 1000000).toFixed(1)}M`, 
                icon: TrendingUp, 
                color: 'orange'
              },
              { 
                title: 'Taux de rétention (%)', 
                value: clusterData.metrics.retentionRate.toFixed(1), 
                icon: Target, 
                color: 'red'
              }
            ].map((metric, index) => (
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
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-2 rounded-lg"
                      style={{
                        background: metric.color === 'blue' ? 'rgba(59, 130, 246, 0.2)' : 
                                   metric.color === 'green' ? 'rgba(16, 185, 129, 0.2)' : 
                                   metric.color === 'orange' ? 'rgba(245, 158, 11, 0.2)' : 
                                   'rgba(239, 68, 68, 0.2)',
                        color: metric.color === 'blue' ? '#3b82f6' : 
                               metric.color === 'green' ? '#10b981' : 
                               metric.color === 'orange' ? '#f59e0b' : '#ef4444'
                      }}
                    >
                      <metric.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        {metric.value}
                      </div>
                      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {metric.title}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Actions et contrôles */}
          <Card style={{
            background: 'var(--bg-glass-primary)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--border-glass-primary)',
          }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Actions d'Analyse
                </CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push('/dashboard/clusters')}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Retour
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleAnalyzeCluster}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Brain className="h-4 w-4 mr-2" />
                    )}
                    {isAnalyzing ? 'Analyse...' : 'Analyser'}
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleExportCluster}
                    disabled={isExporting}
                  >
                    {isExporting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Export détaillé
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 rounded-lg text-center" style={{ background: 'var(--bg-glass-light)' }}>
                  <div className="text-2xl font-bold mb-2" style={{ color: 'var(--accent-intel)' }}>
                    {clusterData.confidence.toFixed(1)}%
                  </div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Confiance de détection
                  </div>
                  <Progress value={clusterData.confidence} className="mt-2" />
                </div>
                
                <div className="p-4 rounded-lg text-center" style={{ background: 'var(--bg-glass-light)' }}>
                  <div className="text-2xl font-bold mb-2" style={{ color: 'var(--accent-warning)' }}>
                    {clusterData.density.toFixed(2)}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Densité du cluster
                  </div>
                  <Progress value={clusterData.density * 100} className="mt-2" />
                </div>
                
                <div className="p-4 rounded-lg text-center" style={{ background: 'var(--bg-glass-light)' }}>
                  <div className="text-2xl font-bold mb-2" style={{ color: 'var(--accent-success)' }}>
                    {clusterData.cohesion.toFixed(2)}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Cohésion sociale
                  </div>
                  <Progress value={clusterData.cohesion * 100} className="mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Membres du cluster */}
          <Card style={{
            background: 'var(--bg-glass-primary)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--border-glass-primary)',
          }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Membres du Cluster ({clusterData.nodes.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clusterData.nodes.map((node: any) => (
                  <div 
                    key={node.id}
                    className="flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all duration-200"
                    style={{ 
                      background: 'var(--bg-glass-light)',
                      border: '1px solid var(--border-glass-secondary)'
                    }}
                    onClick={() => {
                      if (node.type === 'profile') {
                        router.push(`/dashboard/profiles/${node.id}`);
                      } else {
                        toast.info(`Association ${node.name}`, 'Détails de l\'association');
                      }
                    }}
                  >
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                      style={{
                        background: node.role === 'leader' ? 'linear-gradient(135deg, #ef4444, #dc2626)' :
                                   node.role === 'hub' ? 'linear-gradient(135deg, #f59e0b, #ea580c)' :
                                   'linear-gradient(135deg, #3b82f6, #2563eb)'
                      }}
                    >
                      {node.type === 'profile' ? <Users className="h-6 w-6" /> : <Building2 className="h-6 w-6" />}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {node.name}
                        </h3>
                        <Badge className={
                          node.role === 'leader' ? 'bg-red-500/20 text-red-500' :
                          node.role === 'hub' ? 'bg-orange-500/20 text-orange-500' :
                          'bg-blue-500/20 text-blue-500'
                        }>
                          {node.role}
                        </Badge>
                      </div>
                      <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                        {node.activity}
                      </p>
                      <div className="flex items-center gap-4 text-xs">
                        <span style={{ color: 'var(--text-muted)' }}>
                          Influence: {node.influence}
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>
                          Connexions: {node.connections}
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>
                          Membre depuis: {new Date(node.joinedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Activités récentes */}
          <Card style={{
            background: 'var(--bg-glass-primary)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--border-glass-primary)',
          }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Activités Récentes du Cluster
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clusterData.activities.map((activity: any, index: number) => (
                  <div 
                    key={index}
                    className="flex items-center gap-4 p-3 rounded-lg"
                    style={{ 
                      background: 'var(--bg-glass-light)',
                      border: '1px solid var(--border-glass-secondary)'
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{
                          background: activity.type === 'meeting' ? '#3b82f6' :
                                     activity.type === 'event' ? '#f59e0b' : '#10b981'
                        }}
                      />
                      <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                        {new Date(activity.date).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                        {activity.description}
                      </h4>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        Type: {activity.type} • {activity.participants} participants
                      </p>
                    </div>
                    
                    <Badge variant="outline" className="text-xs">
                      {activity.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Facteurs de risque */}
          <Card style={{
            background: 'var(--bg-glass-primary)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--border-glass-primary)',
          }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Analyse des Facteurs de Risque
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clusterData.riskFactors.map((risk: any, index: number) => (
                  <div 
                    key={index}
                    className="p-4 rounded-lg"
                    style={{ 
                      background: 'var(--bg-glass-light)',
                      border: '1px solid var(--border-glass-secondary)',
                      borderLeft: `4px solid ${getRiskColor(risk.level)}`
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                        {risk.factor}
                      </h4>
                      <Badge 
                        className="text-xs"
                        style={{
                          background: risk.level === 'high' ? 'rgba(239, 68, 68, 0.2)' :
                                     risk.level === 'medium' ? 'rgba(245, 158, 11, 0.2)' :
                                     'rgba(16, 185, 129, 0.2)',
                          color: getRiskColor(risk.level)
                        }}
                      >
                        {risk.level.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {risk.description}
                    </p>
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
