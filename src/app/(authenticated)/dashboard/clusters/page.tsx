'use client';

import { useState, useMemo, useEffect } from 'react';
import { api } from '@/trpc/react';
import { useIntelligenceDashboardStats } from '@/hooks/use-optimized-queries';
import IntelAgentLayout from '@/components/layouts/intel-agent-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  Target, 
  Search, 
  Filter, 
  Download,
  RefreshCw,
  Loader2,
  Users,
  Network,
  Brain,
  AlertTriangle,
  Eye,
  Play,
  Pause,
  Settings,
  BarChart3,
  TrendingUp,
  MapPin,
  Building2,
  Zap,
  Activity,
  Globe,
  FileText
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// Algorithmes de détection de clusters
const clusterDetectionAlgorithms = {
  // Algorithme K-means pour clustering géographique
  kMeans: {
    name: 'K-Means Géographique',
    description: 'Clustering basé sur la proximité géographique',
    parameters: { k: 5, iterations: 100 },
    accuracy: 87,
    executionTime: '2.3s'
  },
  
  // Algorithme de modularité pour clustering social
  modularity: {
    name: 'Modularité Sociale',
    description: 'Détection de communautés basée sur les connexions',
    parameters: { resolution: 1.0, iterations: 50 },
    accuracy: 92,
    executionTime: '4.1s'
  },
  
  // Algorithme DBSCAN pour clustering de densité
  dbscan: {
    name: 'DBSCAN Densité',
    description: 'Clustering basé sur la densité des points',
    parameters: { epsilon: 0.5, minPoints: 5 },
    accuracy: 78,
    executionTime: '1.8s'
  }
};

// Clusters détectés avec données DGSS
const detectedClusters = [
  {
    id: 'cluster-001',
    name: 'Réseau Entrepreneurial Île-de-France',
    algorithm: 'modularity',
    nodes: [
      { id: 'prof-001', name: 'ASSARI Ulrich', type: 'profile', influence: 95 },
      { id: 'prof-002', name: 'TCHIBANGA Marie', type: 'profile', influence: 87 },
      { id: 'asso-001', name: 'Gabon Business Network Paris', type: 'association', influence: 89 }
    ],
    center: { lat: 48.8566, lng: 2.3522, city: 'Paris' },
    radius: 25,
    density: 0.78,
    cohesion: 0.85,
    riskLevel: 'medium',
    economicImpact: 'high',
    detectedAt: '2024-12-19T10:30:00Z',
    confidence: 92,
    connections: 23,
    avgInfluence: 90.3,
    keyActivities: ['Networking professionnel', 'Investissements', 'Partenariats économiques'],
    surveillanceLevel: 'active'
  },
  {
    id: 'cluster-002',
    name: 'Communauté Culturelle Sud-Est',
    algorithm: 'kMeans',
    nodes: [
      { id: 'prof-003', name: 'OBAME Jean-Claude', type: 'profile', influence: 76 },
      { id: 'prof-004', name: 'MINTSA Sylvie', type: 'profile', influence: 68 },
      { id: 'asso-002', name: 'Association Culturelle Lyon', type: 'association', influence: 72 }
    ],
    center: { lat: 45.764, lng: 4.8357, city: 'Lyon' },
    radius: 18,
    density: 0.65,
    cohesion: 0.71,
    riskLevel: 'low',
    economicImpact: 'medium',
    detectedAt: '2024-12-19T09:15:00Z',
    confidence: 87,
    connections: 15,
    avgInfluence: 72.0,
    keyActivities: ['Événements culturels', 'Promotion artistique', 'Éducation'],
    surveillanceLevel: 'passive'
  },
  {
    id: 'cluster-003',
    name: 'Réseau Humanitaire National',
    algorithm: 'dbscan',
    nodes: [
      { id: 'prof-005', name: 'NDONG Patricia', type: 'profile', influence: 83 },
      { id: 'asso-003', name: 'Collectif Humanitaire Gabon France', type: 'association', influence: 79 },
      { id: 'asso-004', name: 'Aide Solidaire Gabonaise', type: 'association', influence: 71 }
    ],
    center: { lat: 46.2276, lng: 2.2137, city: 'Centre France' },
    radius: 45,
    density: 0.52,
    cohesion: 0.67,
    riskLevel: 'low',
    economicImpact: 'low',
    detectedAt: '2024-12-19T08:45:00Z',
    confidence: 78,
    connections: 12,
    avgInfluence: 77.7,
    keyActivities: ['Aide humanitaire', 'Collecte de fonds', 'Missions sociales'],
    surveillanceLevel: 'monitoring'
  },
  {
    id: 'cluster-004',
    name: 'Groupe d\'Opinion Politique',
    algorithm: 'modularity',
    nodes: [
      { id: 'prof-006', name: 'MOUNGUENGUI Albert', type: 'profile', influence: 91 },
      { id: 'prof-007', name: 'BOUSSOUGOU Françoise', type: 'profile', influence: 79 }
    ],
    center: { lat: 43.2965, lng: 5.3698, city: 'Marseille' },
    radius: 12,
    density: 0.89,
    cohesion: 0.94,
    riskLevel: 'high',
    economicImpact: 'low',
    detectedAt: '2024-12-19T11:20:00Z',
    confidence: 96,
    connections: 8,
    avgInfluence: 85.0,
    keyActivities: ['Débats politiques', 'Mobilisation communautaire', 'Influence publique'],
    surveillanceLevel: 'high_priority'
  }
];

export default function ClustersDetectionPage() {
  const router = useRouter();
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('all');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('all');
  const [selectedSurveillance, setSelectedSurveillance] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedClusters, setSelectedClusters] = useState<string[]>([]);
  const [realTimeDetection, setRealTimeDetection] = useState(false);

  // Filtrer les clusters
  const filteredClusters = useMemo(() => {
    return detectedClusters.filter(cluster => {
      const matchesSearch = !searchTerm || 
        cluster.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cluster.center.city.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesAlgorithm = selectedAlgorithm === 'all' || cluster.algorithm === selectedAlgorithm;
      const matchesRisk = selectedRiskLevel === 'all' || cluster.riskLevel === selectedRiskLevel;
      const matchesSurveillance = selectedSurveillance === 'all' || cluster.surveillanceLevel === selectedSurveillance;
      
      return matchesSearch && matchesAlgorithm && matchesRisk && matchesSurveillance;
    });
  }, [searchTerm, selectedAlgorithm, selectedRiskLevel, selectedSurveillance]);

  const handleRunDetection = async () => {
    setIsDetecting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      toast.success('Détection terminée', `${filteredClusters.length} clusters mis à jour`);
    } catch (error) {
      toast.error('Erreur de détection', 'Impossible d\'exécuter l\'algorithme');
    } finally {
      setIsDetecting(false);
    }
  };

  const handleExportClusters = async () => {
    if (selectedClusters.length === 0) {
      toast.error('Sélection requise', 'Veuillez sélectionner au moins un cluster');
      return;
    }
    
    setIsExporting(true);
    try {
      const selectedData = filteredClusters.filter(c => selectedClusters.includes(c.id));
      const csvContent = exportClustersToCSV(selectedData);
      downloadCSV(csvContent, 'clusters_detection_dgss.csv');
      
      toast.success('Export réussi', `${selectedClusters.length} clusters exportés`);
      setSelectedClusters([]);
    } catch (error) {
      toast.error('Erreur d\'export');
    } finally {
      setIsExporting(false);
    }
  };

  const exportClustersToCSV = (data: any[]) => {
    const headers = ['ID', 'Nom', 'Algorithme', 'Nœuds', 'Densité', 'Cohésion', 'Influence Moyenne', 'Niveau Risque', 'Confiance', 'Ville Centre'];
    const rows = data.map(cluster => [
      cluster.id,
      cluster.name,
      cluster.algorithm,
      cluster.nodes.length,
      cluster.density,
      cluster.cohesion,
      cluster.avgInfluence,
      cluster.riskLevel,
      cluster.confidence,
      cluster.center.city
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

  const handleSelectCluster = (clusterId: string, checked: boolean) => {
    setSelectedClusters(prev => 
      checked ? [...prev, clusterId] : prev.filter(id => id !== clusterId)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedClusters(checked ? filteredClusters.map(c => c.id) : []);
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

  const getSurveillanceBadge = (level: string) => {
    switch (level) {
      case 'passive':
        return { text: '👁️ Passive', color: 'bg-blue-500/20 text-blue-500' };
      case 'active':
        return { text: '🔍 Active', color: 'bg-orange-500/20 text-orange-500' };
      case 'high_priority':
        return { text: '🚨 Prioritaire', color: 'bg-red-500/20 text-red-500' };
      case 'monitoring':
        return { text: '📊 Monitoring', color: 'bg-yellow-500/20 text-yellow-500' };
      default:
        return { text: 'Standard', color: 'bg-gray-500/20 text-gray-500' };
    }
  };

  // Simulation détection temps réel
  useEffect(() => {
    if (realTimeDetection) {
      const interval = setInterval(() => {
        toast.info('Détection temps réel', 'Analyse des nouveaux patterns...');
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [realTimeDetection]);

  // Statistiques des clusters
  const totalNodes = filteredClusters.reduce((sum, c) => sum + c.nodes.length, 0);
  const averageConfidence = filteredClusters.reduce((sum, c) => sum + c.confidence, 0) / filteredClusters.length || 0;
  const highRiskClusters = filteredClusters.filter(c => c.riskLevel === 'high').length;
  const avgDensity = filteredClusters.reduce((sum, c) => sum + c.density, 0) / filteredClusters.length || 0;

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      <IntelAgentLayout
        title="Détection de Clusters"
        description="Algorithmes avancés de détection automatique des groupes d'influence"
        currentPage="clusters"
        backButton={false}
      >
        <div className="space-y-6">
          {/* Stats de détection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { 
                title: 'Clusters détectés', 
                value: filteredClusters.length, 
                icon: Target, 
                color: 'blue',
                change: '+2'
              },
              { 
                title: 'Nœuds analysés', 
                value: totalNodes, 
                icon: Network, 
                color: 'green',
                change: '+12'
              },
              { 
                title: 'Confiance moyenne (%)', 
                value: Math.round(averageConfidence), 
                icon: Brain, 
                color: 'orange',
                change: '+3%'
              },
              { 
                title: 'Clusters à risque', 
                value: highRiskClusters, 
                icon: AlertTriangle, 
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

          {/* Contrôles de détection */}
          <Card style={{
            background: 'var(--bg-glass-primary)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--border-glass-primary)',
          }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Algorithmes de Détection
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant={realTimeDetection ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setRealTimeDetection(!realTimeDetection);
                      toast.info('Détection temps réel', realTimeDetection ? 'Désactivée' : 'Activée');
                    }}
                  >
                    {realTimeDetection ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                    {realTimeDetection ? 'Pause' : 'Temps réel'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleRunDetection}
                    disabled={isDetecting}
                  >
                    {isDetecting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Brain className="h-4 w-4 mr-2" />
                    )}
                    {isDetecting ? 'Détection...' : 'Exécuter détection'}
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleExportClusters}
                    disabled={isExporting || selectedClusters.length === 0}
                  >
                    {isExporting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Export ({selectedClusters.length})
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Rechercher cluster..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Select value={selectedAlgorithm} onValueChange={setSelectedAlgorithm}>
                  <SelectTrigger>
                    <SelectValue placeholder="Algorithme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous algorithmes</SelectItem>
                    <SelectItem value="modularity">Modularité Sociale</SelectItem>
                    <SelectItem value="kMeans">K-Means Géographique</SelectItem>
                    <SelectItem value="dbscan">DBSCAN Densité</SelectItem>
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
                    <SelectValue placeholder="Surveillance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous types</SelectItem>
                    <SelectItem value="passive">👁️ Passive</SelectItem>
                    <SelectItem value="active">🔍 Active</SelectItem>
                    <SelectItem value="high_priority">🚨 Prioritaire</SelectItem>
                    <SelectItem value="monitoring">📊 Monitoring</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Performance des algorithmes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(clusterDetectionAlgorithms).map(([key, algo]) => (
                  <div 
                    key={key}
                    className="p-4 rounded-lg cursor-pointer transition-all duration-200"
                    style={{ 
                      background: 'var(--bg-glass-light)',
                      border: '1px solid var(--border-glass-secondary)'
                    }}
                    onClick={() => {
                      setSelectedAlgorithm(key);
                      toast.info(`Algorithme ${algo.name}`, `Précision: ${algo.accuracy}% • Temps: ${algo.executionTime}`);
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                        {algo.name}
                      </h4>
                      <Badge className="bg-blue-500/20 text-blue-500">
                        {algo.accuracy}%
                      </Badge>
                    </div>
                    <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                      {algo.description}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span style={{ color: 'var(--text-muted)' }}>
                        Temps: {algo.executionTime}
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        Précision: {algo.accuracy}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Visualisation des clusters */}
          <Card style={{
            background: 'var(--bg-glass-primary)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--border-glass-primary)',
          }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  Visualisation des Clusters
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-500/20 text-blue-500">
                    {filteredClusters.length} clusters • Densité moy: {avgDensity.toFixed(2)}
                  </Badge>
                  {filteredClusters.length > 0 && (
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox"
                        checked={selectedClusters.length === filteredClusters.length && filteredClusters.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded"
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
              <div className="h-[500px] relative" style={{ background: 'var(--bg-glass-light)', borderRadius: '0.5rem', overflow: 'hidden' }}>
                {/* Graphique SVG des clusters */}
                <svg className="w-full h-full" viewBox="0 0 800 400">
                  {/* Clusters en arrière-plan */}
                  {filteredClusters.map((cluster, index) => {
                    const x = 150 + (index % 3) * 200;
                    const y = 150 + Math.floor(index / 3) * 150;
                    const radius = Math.max(30, cluster.nodes.length * 10);
                    const clusterColor = cluster.riskLevel === 'high' ? '#ef4444' : 
                                       cluster.riskLevel === 'medium' ? '#f59e0b' : '#10b981';
                    
                    return (
                      <g key={cluster.id}>
                        <circle 
                          cx={x} 
                          cy={y} 
                          r={radius}
                          fill={`${clusterColor}20`}
                          stroke={clusterColor}
                          strokeWidth="2"
                          strokeDasharray="5,5"
                          opacity={0.6}
                          className="cursor-pointer"
                          onClick={() => {
                            toast.info(`Cluster ${cluster.name}`, 
                              `${cluster.nodes.length} nœuds • Confiance: ${cluster.confidence}% • Densité: ${cluster.density}`);
                          }}
                        />
                        
                        {/* Nœuds du cluster */}
                        {cluster.nodes.slice(0, 5).map((node, nodeIndex) => {
                          const angle = (nodeIndex * 2 * Math.PI) / Math.min(cluster.nodes.length, 5);
                          const nodeX = x + Math.cos(angle) * (radius * 0.6);
                          const nodeY = y + Math.sin(angle) * (radius * 0.6);
                          const nodeColor = node.type === 'profile' ? '#3b82f6' : '#10b981';
                          
                          return (
                            <circle 
                              key={node.id}
                              cx={nodeX} 
                              cy={nodeY} 
                              r={Math.max(4, node.influence / 15)}
                              fill={nodeColor}
                              opacity={0.8}
                              stroke="white"
                              strokeWidth="1"
                              className="cursor-pointer"
                              onClick={() => {
                                if (node.type === 'profile') {
                                  router.push(`/dashboard/profiles/${node.id}`);
                                } else {
                                  toast.info(`Association ${node.name}`, 'Détails de l\'association');
                                }
                              }}
                            />
                          );
                        })}
                        
                        <text 
                          x={x} 
                          y={y + radius + 20} 
                          textAnchor="middle" 
                          fontSize="11" 
                          fontWeight="500"
                          fill="var(--text-primary)"
                          className="cursor-pointer"
                        >
                          {cluster.name.split(' ').slice(0, 2).join(' ')}
                        </text>
                      </g>
                    );
                  })}
                  
                  {/* Légende */}
                  <g transform="translate(20, 20)">
                    <rect width="200" height="120" fill="rgba(0, 0, 0, 0.85)" rx="8" />
                    <text x="15" y="25" fill="white" fontSize="14" fontWeight="bold">Clusters Détectés</text>
                    
                    <circle cx="30" cy="50" r="6" fill="#10b981" />
                    <text x="50" y="55" fill="white" fontSize="11">Risque faible</text>
                    
                    <circle cx="30" cy="70" r="6" fill="#f59e0b" />
                    <text x="50" y="75" fill="white" fontSize="11">Risque moyen</text>
                    
                    <circle cx="30" cy="90" r="6" fill="#ef4444" />
                    <text x="50" y="95" fill="white" fontSize="11">Risque élevé</text>
                    
                    <text x="15" y="115" fill="white" fontSize="10" opacity="0.7">Taille = Nombre de nœuds</text>
                  </g>
                </svg>
              </div>
            </CardContent>
          </Card>

          {/* Liste détaillée des clusters */}
          <Card style={{
            background: 'var(--bg-glass-primary)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--border-glass-primary)',
          }}>
            <CardHeader>
              <CardTitle>Clusters Détectés - Analyse Détaillée</CardTitle>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {filteredClusters.length} clusters sur {detectedClusters.length} au total
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredClusters.map((cluster) => {
                  const riskBadge = getRiskBadge(cluster.riskLevel);
                  const surveillanceBadge = getSurveillanceBadge(cluster.surveillanceLevel);
                  
                  return (
                    <div 
                      key={cluster.id}
                      className="p-4 rounded-lg transition-all duration-200 cursor-pointer group border-l-4"
                      style={{ 
                        background: 'var(--bg-glass-light)',
                        borderLeftColor: cluster.riskLevel === 'high' ? '#ef4444' :
                                        cluster.riskLevel === 'medium' ? '#f59e0b' : '#10b981'
                      }}
                      onClick={() => {
                        router.push(`/dashboard/clusters/${cluster.id}`);
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <input 
                          type="checkbox"
                          checked={selectedClusters.includes(cluster.id)}
                          onChange={(e) => handleSelectCluster(cluster.id, e.target.checked)}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1 rounded"
                        />
                        
                        <div className="flex-1">
                          {/* Header du cluster */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
                                {cluster.name}
                              </h3>
                              <Badge className={riskBadge.color}>
                                {riskBadge.text}
                              </Badge>
                              <Badge className={surveillanceBadge.color}>
                                {surveillanceBadge.text}
                              </Badge>
                            </div>
                            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              Détecté: {new Date(cluster.detectedAt).toLocaleDateString()}
                            </div>
                          </div>

                          {/* Métriques du cluster */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                            <div className="text-center">
                              <div className="text-lg font-bold" style={{ color: 'var(--accent-intel)' }}>
                                {cluster.nodes.length}
                              </div>
                              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                Nœuds
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold" style={{ color: 'var(--accent-warning)' }}>
                                {cluster.confidence}%
                              </div>
                              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                Confiance
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold" style={{ color: 'var(--accent-success)' }}>
                                {cluster.density.toFixed(2)}
                              </div>
                              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                Densité
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold" style={{ color: 'var(--accent-danger)' }}>
                                {cluster.avgInfluence.toFixed(1)}
                              </div>
                              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                Influence
                              </div>
                            </div>
                          </div>

                          {/* Informations géographiques */}
                          <div className="flex items-center gap-4 mb-3 text-sm">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                              <span style={{ color: 'var(--text-primary)' }}>
                                Centre: {cluster.center.city}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Target className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                              <span style={{ color: 'var(--text-secondary)' }}>
                                Rayon: {cluster.radius}km
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Activity className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                              <span style={{ color: 'var(--text-secondary)' }}>
                                Algorithme: {clusterDetectionAlgorithms[cluster.algorithm as keyof typeof clusterDetectionAlgorithms]?.name}
                              </span>
                            </div>
                          </div>

                          {/* Activités principales */}
                          <div className="mb-3">
                            <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                              Activités principales:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {cluster.keyActivities.map((activity, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {activity}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Membres du cluster */}
                          <div className="mb-3">
                            <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                              Membres du cluster:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {cluster.nodes.slice(0, 3).map((node) => (
                                <div 
                                  key={node.id}
                                  className="flex items-center gap-1 px-2 py-1 rounded text-xs"
                                  style={{ background: 'var(--bg-glass-secondary)' }}
                                >
                                  {node.type === 'profile' ? <Users className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
                                  <span style={{ color: 'var(--text-primary)' }}>
                                    {node.name.split(' ').slice(0, 2).join(' ')}
                                  </span>
                                </div>
                              ))}
                              {cluster.nodes.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{cluster.nodes.length - 3} autres
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Actions du cluster */}
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              Analyser
                            </Button>
                            <Button variant="outline" size="sm">
                              <Network className="h-4 w-4 mr-2" />
                              Voir le réseau
                            </Button>
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4 mr-2" />
                              Rapport
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredClusters.length === 0 && (
                  <div className="text-center py-12">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p style={{ color: 'var(--text-muted)' }}>
                      Aucun cluster trouvé avec ces critères
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4" 
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedAlgorithm('all');
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
