'use client';

import { useState, useMemo } from 'react';
import { PageContainer } from '@/components/layouts/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  Network,
  Search,
  Filter,
  Download,
  RefreshCw,
  Users,
  TrendingUp,
  Target,
  Eye,
  Building2,
  Link,
  Zap,
  Brain,
  Globe,
  MapPin,
  BarChart3,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// Données simplifiées du réseau
const networkNodes = [
  {
    id: 'prof-001',
    name: 'ASSARI Ulrich',
    type: 'profile',
    influence: 95,
    connections: 234,
    riskLevel: 'low',
    location: 'Paris',
  },
  {
    id: 'prof-002',
    name: 'TCHIBANGA Marie',
    type: 'profile',
    influence: 87,
    connections: 156,
    riskLevel: 'medium',
    location: 'Lyon',
  },
  {
    id: 'asso-001',
    name: 'Association Gabonais Amiens',
    type: 'association',
    influence: 78,
    connections: 89,
    riskLevel: 'medium',
    location: 'Amiens',
  },
];

const clusters = [
  {
    id: 'cluster-001',
    name: 'Réseau Entrepreneurial Paris',
    nodes: 3,
    influence: 'high',
    connections: 23,
  },
  {
    id: 'cluster-002',
    name: 'Communauté Humanitaire Nord',
    nodes: 5,
    influence: 'medium',
    connections: 15,
  },
];

export default function ReseauxInfluencePage() {
  const router = useRouter();
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInfluence, setSelectedInfluence] = useState<string>('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const filteredNodes = useMemo(() => {
    return networkNodes.filter((node) => {
      const matchesSearch =
        !searchTerm || node.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesInfluence =
        selectedInfluence === 'all' ||
        (selectedInfluence === 'high' && node.influence >= 80) ||
        (selectedInfluence === 'medium' && node.influence < 80);
      return matchesSearch && matchesInfluence;
    });
  }, [searchTerm, selectedInfluence]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success('Analyse terminée', `${clusters.length} communautés détectées`);
    } catch (error) {
      toast.error("Erreur d'analyse");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExport = () => {
    if (selectedNodes.length === 0) {
      toast.error('Veuillez sélectionner des nœuds');
      return;
    }
    toast.success(`${selectedNodes.length} nœuds exportés`);
  };

  const totalInfluence = filteredNodes.reduce((sum, n) => sum + n.influence, 0);
  const averageInfluence = totalInfluence / filteredNodes.length || 0;

  return (
    <PageContainer
      title="Réseaux d'Influence"
      description="Analyse des connexions et réseaux d'influence gabonais"
    >
      <div className="space-y-6">
        {/* Stats du réseau */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'Nœuds du réseau',
              value: filteredNodes.length,
              icon: Network,
              color: 'blue',
            },
            {
              title: 'Connexions totales',
              value: filteredNodes.reduce((sum, n) => sum + n.connections, 0),
              icon: Link,
              color: 'green',
            },
            {
              title: 'Influence moyenne',
              value: Math.round(averageInfluence),
              icon: TrendingUp,
              color: 'orange',
            },
            {
              title: 'Clusters détectés',
              value: clusters.length,
              icon: Target,
              color: 'red',
            },
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
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{
                      background:
                        stat.color === 'blue'
                          ? 'rgba(59, 130, 246, 0.2)'
                          : stat.color === 'green'
                            ? 'rgba(16, 185, 129, 0.2)'
                            : stat.color === 'orange'
                              ? 'rgba(245, 158, 11, 0.2)'
                              : 'rgba(239, 68, 68, 0.2)',
                      color:
                        stat.color === 'blue'
                          ? '#3b82f6'
                          : stat.color === 'green'
                            ? '#10b981'
                            : stat.color === 'orange'
                              ? '#f59e0b'
                              : '#ef4444',
                    }}
                  >
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div
                      className="text-2xl font-bold"
                      style={{ color: 'var(--text-primary)' }}
                    >
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

        {/* Contrôles */}
        <Card
          style={{
            background: 'var(--bg-glass-primary)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--border-glass-primary)',
          }}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Analyse du Réseau
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? 'Analyse...' : 'Analyser'}
                </Button>
                <Button
                  size="sm"
                  onClick={handleExport}
                  disabled={selectedNodes.length === 0}
                >
                  Export ({selectedNodes.length})
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedInfluence} onValueChange={setSelectedInfluence}>
                <SelectTrigger>
                  <SelectValue placeholder="Niveau d'influence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous niveaux</SelectItem>
                  <SelectItem value="high">Influence élevée (80+)</SelectItem>
                  <SelectItem value="medium">Influence moyenne</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Visualisation du réseau */}
        <Card
          style={{
            background: 'var(--bg-glass-primary)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--border-glass-primary)',
          }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Graphique du Réseau d'Influence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="h-[400px] flex items-center justify-center"
              style={{ background: 'var(--bg-glass-light)', borderRadius: '0.5rem' }}
            >
              <div className="text-center">
                <Network className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p style={{ color: 'var(--text-muted)' }}>
                  Graphique du réseau d'influence
                </p>
                <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                  Visualisation interactive des connexions (D3.js/vis.js)
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() =>
                    toast.info(
                      'Graphique réseau',
                      'Activation de la visualisation interactive',
                    )
                  }
                >
                  <Network className="h-4 w-4 mr-2" />
                  Activer la visualisation
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clusters détectés */}
        <Card
          style={{
            background: 'var(--bg-glass-primary)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--border-glass-primary)',
          }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Clusters d'Influence Détectés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clusters.map((cluster) => (
                <div
                  key={cluster.id}
                  className="p-4 rounded-lg cursor-pointer transition-all duration-200"
                  style={{
                    background: 'var(--bg-glass-light)',
                    border: '1px solid var(--border-glass-secondary)',
                  }}
                  onClick={() =>
                    toast.info(
                      `Cluster ${cluster.name}`,
                      `${cluster.nodes} nœuds, ${cluster.connections} connexions`,
                    )
                  }
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4
                        className="font-medium text-sm mb-1"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {cluster.name}
                      </h4>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {cluster.nodes} nœuds • {cluster.connections} connexions
                      </p>
                    </div>
                    <Badge
                      className={
                        cluster.influence === 'high'
                          ? 'bg-red-500/20 text-red-500'
                          : 'bg-orange-500/20 text-orange-500'
                      }
                    >
                      {cluster.influence}
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    Analyser
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Liste des nœuds */}
        <Card
          style={{
            background: 'var(--bg-glass-primary)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--border-glass-primary)',
          }}
        >
          <CardHeader>
            <CardTitle>Nœuds du Réseau</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredNodes.map((node, index) => (
                <div
                  key={node.id}
                  className="flex items-center gap-4 p-3 rounded-lg cursor-pointer"
                  style={{
                    background: 'var(--bg-glass-light)',
                    border: '1px solid var(--border-glass-secondary)',
                  }}
                  onClick={() => {
                    if (node.type === 'profile') {
                      router.push(`/dashboard/profiles/${node.id}`);
                    } else {
                      toast.info(`Association ${node.name}`, "Détails de l'association");
                    }
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{
                      background:
                        node.influence >= 90
                          ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                          : node.influence >= 80
                            ? 'linear-gradient(135deg, #f59e0b, #ea580c)'
                            : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    }}
                  >
                    {index + 1}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {node.type === 'profile' ? (
                        <Users className="h-4 w-4" />
                      ) : (
                        <Building2 className="h-4 w-4" />
                      )}
                      <h4
                        className="font-medium text-sm"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {node.name}
                      </h4>
                      <Badge
                        className={
                          node.influence >= 80
                            ? 'bg-red-500/20 text-red-500'
                            : 'bg-orange-500/20 text-orange-500'
                        }
                      >
                        Influence: {node.influence}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span style={{ color: 'var(--text-muted)' }}>
                        <MapPin className="h-3 w-3 inline mr-1" />
                        {node.location}
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        <Link className="h-3 w-3 inline mr-1" />
                        {node.connections} connexions
                      </span>
                      <Badge
                        className={
                          node.riskLevel === 'high'
                            ? 'bg-red-500/20 text-red-500'
                            : node.riskLevel === 'medium'
                              ? 'bg-yellow-500/20 text-yellow-500'
                              : 'bg-green-500/20 text-green-500'
                        }
                      >
                        {node.riskLevel}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
