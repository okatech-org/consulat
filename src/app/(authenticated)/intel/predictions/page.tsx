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
  Brain, 
  Search, 
  Filter, 
  Download,
  RefreshCw,
  Loader2,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  Eye,
  Play,
  Pause,
  Settings,
  BarChart3,
  Calendar,
  Clock,
  Zap,
  Activity,
  Globe,
  Users,
  MapPin,
  Building2,
  FileText,
  Cpu
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// Modèles d'IA pour les prédictions
const aiModels = {
  migrationPredictor: {
    name: 'Prédicteur de Migrations',
    type: 'LSTM Neural Network',
    accuracy: 89.3,
    lastTraining: '2024-12-15',
    dataPoints: 15420,
    version: 'v2.1.3',
    status: 'active',
    description: 'Prédit les flux migratoires basés sur les patterns historiques'
  },
  riskAssessment: {
    name: 'Évaluateur de Risques',
    type: 'Random Forest',
    accuracy: 92.7,
    lastTraining: '2024-12-18',
    dataPoints: 8934,
    version: 'v1.8.2',
    status: 'active',
    description: 'Évalue le niveau de risque des profils et associations'
  },
  networkAnalyzer: {
    name: 'Analyseur de Réseaux',
    type: 'Graph Neural Network',
    accuracy: 85.1,
    lastTraining: '2024-12-10',
    dataPoints: 12678,
    version: 'v1.5.1',
    status: 'training',
    description: 'Analyse les connexions et influence dans les réseaux sociaux'
  },
  behaviorPredictor: {
    name: 'Prédicteur Comportemental',
    type: 'Transformer',
    accuracy: 76.8,
    lastTraining: '2024-12-05',
    dataPoints: 6789,
    version: 'v1.2.0',
    status: 'experimental',
    description: 'Prédit les comportements futurs basés sur l\'historique d\'activité'
  }
};

// Prédictions générées par l'IA
const aiPredictions = [
  {
    id: 'pred-001',
    model: 'migrationPredictor',
    type: 'migration',
    title: 'Pic de retours au Gabon - Fin 2024',
    description: 'Augmentation prévue de 34% des retours temporaires vers le Gabon entre décembre 2024 et janvier 2025',
    confidence: 91.2,
    timeframe: 'Court terme (1-3 mois)',
    impact: 'high',
    probability: 0.89,
    factors: ['Vacances scolaires', 'Fêtes de fin d\'année', 'Taux de change favorable'],
    riskLevel: 'medium',
    createdAt: '2024-12-19T09:30:00Z',
    validUntil: '2025-01-31T23:59:59Z',
    status: 'active'
  },
  {
    id: 'pred-002',
    model: 'riskAssessment',
    type: 'risk',
    title: 'Augmentation du risque - Réseau Entrepreneurial',
    description: 'Le réseau entrepreneurial parisien présente des signaux d\'activité suspecte nécessitant une surveillance renforcée',
    confidence: 87.5,
    timeframe: 'Moyen terme (3-6 mois)',
    impact: 'high',
    probability: 0.82,
    factors: ['Activités financières inhabituelles', 'Nouvelles connexions internationales', 'Augmentation des réunions'],
    riskLevel: 'high',
    createdAt: '2024-12-19T08:15:00Z',
    validUntil: '2025-06-19T23:59:59Z',
    status: 'monitoring'
  },
  {
    id: 'pred-003',
    model: 'networkAnalyzer',
    type: 'network',
    title: 'Formation d\'un nouveau cluster - Marseille',
    description: 'Détection d\'un nouveau cluster social en formation dans la région PACA avec 15 nouveaux membres',
    confidence: 78.9,
    timeframe: 'Moyen terme (3-6 mois)',
    impact: 'medium',
    probability: 0.75,
    factors: ['Nouveaux arrivants', 'Événements culturels', 'Proximité géographique'],
    riskLevel: 'low',
    createdAt: '2024-12-19T07:45:00Z',
    validUntil: '2025-06-19T23:59:59Z',
    status: 'active'
  },
  {
    id: 'pred-004',
    model: 'behaviorPredictor',
    type: 'behavior',
    title: 'Changement de comportement - Leaders Communautaires',
    description: 'Modification des patterns de communication chez 3 leaders communautaires clés',
    confidence: 82.1,
    timeframe: 'Court terme (1-3 mois)',
    impact: 'medium',
    probability: 0.79,
    factors: ['Changement de fréquence de communication', 'Nouveaux contacts', 'Modification des lieux de rencontre'],
    riskLevel: 'medium',
    createdAt: '2024-12-19T10:00:00Z',
    validUntil: '2025-03-19T23:59:59Z',
    status: 'alert'
  }
];

export default function PredictionsAIPage() {
  const router = useRouter();
  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState([80]);
  const [selectedPredictions, setSelectedPredictions] = useState<string[]>([]);
  const [realTimeMode, setRealTimeMode] = useState(false);

  // Filtrer les prédictions
  const filteredPredictions = useMemo(() => {
    return aiPredictions.filter(prediction => {
      const matchesSearch = !searchTerm || 
        prediction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prediction.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesModel = selectedModel === 'all' || prediction.model === selectedModel;
      const matchesType = selectedType === 'all' || prediction.type === selectedType;
      const matchesTimeframe = selectedTimeframe === 'all' || prediction.timeframe.includes(selectedTimeframe);
      const matchesStatus = selectedStatus === 'all' || prediction.status === selectedStatus;
      const matchesConfidence = prediction.confidence >= confidenceThreshold[0];
      
      return matchesSearch && matchesModel && matchesType && matchesTimeframe && matchesStatus && matchesConfidence;
    });
  }, [searchTerm, selectedModel, selectedType, selectedTimeframe, selectedStatus, confidenceThreshold]);

  const handleGeneratePredictions = async () => {
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 4000));
      toast.success('Nouvelles prédictions générées', `${Math.floor(Math.random() * 3) + 2} nouvelles prédictions créées`);
    } catch (error) {
      toast.error('Erreur de génération', 'Impossible de générer de nouvelles prédictions');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTrainModel = async (modelKey: string) => {
    setIsTraining(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 5000));
      const model = aiModels[modelKey as keyof typeof aiModels];
      toast.success(`Modèle ${model.name} entraîné`, `Nouvelle précision: ${(model.accuracy + Math.random() * 2).toFixed(1)}%`);
    } catch (error) {
      toast.error('Erreur d\'entraînement', 'Impossible d\'entraîner le modèle');
    } finally {
      setIsTraining(false);
    }
  };

  const handleExportPredictions = async () => {
    if (selectedPredictions.length === 0) {
      toast.error('Sélection requise', 'Veuillez sélectionner au moins une prédiction');
      return;
    }
    
    const selectedData = filteredPredictions.filter(p => selectedPredictions.includes(p.id));
    const csvContent = exportPredictionsToCSV(selectedData);
    downloadCSV(csvContent, 'predictions_ia_dgss.csv');
    
    toast.success('Export réussi', `${selectedPredictions.length} prédictions exportées`);
    setSelectedPredictions([]);
  };

  const exportPredictionsToCSV = (data: any[]) => {
    const headers = ['ID', 'Modèle', 'Type', 'Titre', 'Confiance', 'Probabilité', 'Échéance', 'Impact', 'Niveau Risque', 'Statut'];
    const rows = data.map(pred => [
      pred.id,
      pred.model,
      pred.type,
      pred.title,
      pred.confidence,
      pred.probability,
      pred.timeframe,
      pred.impact,
      pred.riskLevel,
      pred.status
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

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 90) return { text: '🎯 Très élevée', color: 'bg-green-500/20 text-green-500 border-green-500/30' };
    if (confidence >= 80) return { text: '✅ Élevée', color: 'bg-blue-500/20 text-blue-500 border-blue-500/30' };
    if (confidence >= 70) return { text: '⚠️ Moyenne', color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' };
    return { text: '❌ Faible', color: 'bg-red-500/20 text-red-500 border-red-500/30' };
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high':
        return { text: '🔴 Élevé', color: 'bg-red-500/20 text-red-500 border-red-500/30' };
      case 'medium':
        return { text: '🟡 Moyen', color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' };
      case 'low':
        return { text: '🟢 Faible', color: 'bg-green-500/20 text-green-500 border-green-500/30' };
      default:
        return { text: 'Non défini', color: 'bg-gray-500/20 text-gray-500 border-gray-500/30' };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return { text: '🟢 Active', color: 'bg-green-500/20 text-green-500' };
      case 'monitoring':
        return { text: '👁️ Surveillance', color: 'bg-blue-500/20 text-blue-500' };
      case 'alert':
        return { text: '🚨 Alerte', color: 'bg-red-500/20 text-red-500' };
      case 'archived':
        return { text: '📁 Archivée', color: 'bg-gray-500/20 text-gray-500' };
      default:
        return { text: 'Standard', color: 'bg-gray-500/20 text-gray-500' };
    }
  };

  // Simulation mode temps réel
  useEffect(() => {
    if (realTimeMode) {
      const interval = setInterval(() => {
        const randomPrediction = filteredPredictions[Math.floor(Math.random() * filteredPredictions.length)];
        if (randomPrediction) {
          toast.info('Mise à jour IA', `Confiance mise à jour: ${randomPrediction.title} → ${(randomPrediction.confidence + Math.random() * 2 - 1).toFixed(1)}%`);
        }
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [realTimeMode, filteredPredictions]);

  // Statistiques des prédictions
  const averageConfidence = filteredPredictions.reduce((sum, p) => sum + p.confidence, 0) / filteredPredictions.length || 0;
  const highConfidencePredictions = filteredPredictions.filter(p => p.confidence >= 85).length;
  const activePredictions = filteredPredictions.filter(p => p.status === 'active').length;
  const alertPredictions = filteredPredictions.filter(p => p.status === 'alert').length;

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      <IntelAgentLayout
        title="Prédictions Intelligence Artificielle"
        description="Modèles prédictifs avancés pour l'analyse comportementale et la surveillance préventive"
        currentPage="predictions"
        backButton={false}
      >
        <div className="space-y-6">
          {/* Stats des prédictions IA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { 
                title: 'Prédictions actives', 
                value: activePredictions, 
                icon: Brain, 
                color: 'blue',
                change: '+3'
              },
              { 
                title: 'Confiance moyenne (%)', 
                value: Math.round(averageConfidence), 
                icon: Target, 
                color: 'green',
                change: '+2.1%'
              },
              { 
                title: 'Haute confiance', 
                value: highConfidencePredictions, 
                icon: Zap, 
                color: 'orange',
                change: '+1'
              },
              { 
                title: 'Alertes IA', 
                value: alertPredictions, 
                icon: AlertTriangle, 
                color: 'red',
                change: '+2'
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

          {/* Contrôles IA */}
          <Card style={{
            background: 'var(--bg-glass-primary)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--border-glass-primary)',
          }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Contrôles Intelligence Artificielle
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant={realTimeMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setRealTimeMode(!realTimeMode);
                      toast.info('Mode temps réel', realTimeMode ? 'Désactivé' : 'Activé');
                    }}
                  >
                    {realTimeMode ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                    {realTimeMode ? 'Pause' : 'Temps réel'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleGeneratePredictions}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Brain className="h-4 w-4 mr-2" />
                    )}
                    {isGenerating ? 'Génération...' : 'Générer prédictions'}
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleExportPredictions}
                    disabled={selectedPredictions.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export ({selectedPredictions.length})
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Rechercher prédiction..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Modèle IA" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous modèles</SelectItem>
                    {Object.entries(aiModels).map(([key, model]) => (
                      <SelectItem key={key} value={key}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous types</SelectItem>
                    <SelectItem value="migration">🚶 Migration</SelectItem>
                    <SelectItem value="risk">⚠️ Risque</SelectItem>
                    <SelectItem value="network">🔗 Réseau</SelectItem>
                    <SelectItem value="behavior">🧠 Comportement</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                  <SelectTrigger>
                    <SelectValue placeholder="Échéance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes échéances</SelectItem>
                    <SelectItem value="Court">📅 Court terme</SelectItem>
                    <SelectItem value="Moyen">📆 Moyen terme</SelectItem>
                    <SelectItem value="Long">🗓️ Long terme</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous statuts</SelectItem>
                    <SelectItem value="active">🟢 Active</SelectItem>
                    <SelectItem value="monitoring">👁️ Surveillance</SelectItem>
                    <SelectItem value="alert">🚨 Alerte</SelectItem>
                    <SelectItem value="archived">📁 Archivée</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Seuil de confiance */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                  Seuil de confiance minimum: {confidenceThreshold[0]}%
                </label>
                <div className="relative">
                  <input
                    type="range"
                    min="50"
                    max="100"
                    step="5"
                    value={confidenceThreshold[0]}
                    onChange={(e) => setConfidenceThreshold([parseInt(e.target.value)])}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Modèles IA */}
          <Card style={{
            background: 'var(--bg-glass-primary)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--border-glass-primary)',
          }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                Modèles d'Intelligence Artificielle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(aiModels).map(([key, model]) => (
                  <div 
                    key={key}
                    className="p-4 rounded-lg transition-all duration-200"
                    style={{ 
                      background: 'var(--bg-glass-light)',
                      border: '1px solid var(--border-glass-secondary)'
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
                          {model.name}
                        </h4>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {model.type} • Version {model.version}
                        </p>
                      </div>
                      <Badge 
                        className={
                          model.status === 'active' ? 'bg-green-500/20 text-green-500' :
                          model.status === 'training' ? 'bg-yellow-500/20 text-yellow-500' :
                          'bg-gray-500/20 text-gray-500'
                        }
                      >
                        {model.status}
                      </Badge>
                    </div>
                    
                    <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                      {model.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <div className="text-lg font-bold" style={{ color: 'var(--accent-intel)' }}>
                          {model.accuracy}%
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          Précision
                        </div>
                      </div>
                      <div>
                        <div className="text-lg font-bold" style={{ color: 'var(--accent-warning)' }}>
                          {model.dataPoints.toLocaleString()}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          Points de données
                        </div>
                      </div>
                    </div>
                    
                    <Progress value={model.accuracy} className="h-2 mb-3" />
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleTrainModel(key)}
                        disabled={isTraining}
                      >
                        {isTraining ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        Ré-entraîner
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toast.info(`Modèle ${model.name}`, `Dernière formation: ${model.lastTraining}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Prédictions générées */}
          <Card style={{
            background: 'var(--bg-glass-primary)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--border-glass-primary)',
          }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Prédictions Générées par l'IA
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-500/20 text-blue-500">
                    {filteredPredictions.length} prédictions filtrées
                  </Badge>
                  {filteredPredictions.length > 0 && (
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox"
                        checked={selectedPredictions.length === filteredPredictions.length && filteredPredictions.length > 0}
                        onChange={(e) => setSelectedPredictions(e.target.checked ? filteredPredictions.map(p => p.id) : [])}
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
              <div className="space-y-4">
                {filteredPredictions.map((prediction) => {
                  const confidenceBadge = getConfidenceBadge(prediction.confidence);
                  const impactBadge = getImpactBadge(prediction.impact);
                  const statusBadge = getStatusBadge(prediction.status);
                  const model = aiModels[prediction.model as keyof typeof aiModels];
                  
                  return (
                    <div 
                      key={prediction.id}
                      className="p-4 rounded-lg transition-all duration-200 cursor-pointer group border-l-4"
                      style={{ 
                        background: 'var(--bg-glass-light)',
                        borderLeftColor: prediction.riskLevel === 'high' ? '#ef4444' :
                                        prediction.riskLevel === 'medium' ? '#f59e0b' : '#10b981'
                      }}
                      onClick={() => {
                        toast.info(`Prédiction ${prediction.title}`, 'Analyse détaillée en développement');
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <input 
                          type="checkbox"
                          checked={selectedPredictions.includes(prediction.id)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setSelectedPredictions(prev => 
                              checked ? [...prev, prediction.id] : prev.filter(id => id !== prediction.id)
                            );
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1 rounded"
                        />
                        
                        <div className="flex-1">
                          {/* Header de la prédiction */}
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--text-primary)' }}>
                                {prediction.title}
                              </h3>
                              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                {prediction.description}
                              </p>
                            </div>
                            <div className="flex flex-col gap-1">
                              <Badge className={confidenceBadge.color}>
                                {confidenceBadge.text}
                              </Badge>
                              <Badge className={statusBadge.color}>
                                {statusBadge.text}
                              </Badge>
                            </div>
                          </div>

                          {/* Métriques de la prédiction */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                            <div>
                              <div className="text-lg font-bold" style={{ color: 'var(--accent-intel)' }}>
                                {prediction.confidence.toFixed(1)}%
                              </div>
                              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                Confiance
                              </div>
                            </div>
                            <div>
                              <div className="text-lg font-bold" style={{ color: 'var(--accent-warning)' }}>
                                {(prediction.probability * 100).toFixed(0)}%
                              </div>
                              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                Probabilité
                              </div>
                            </div>
                            <div>
                              <Badge className={impactBadge.color}>
                                {impactBadge.text}
                              </Badge>
                              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                                Impact
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                {prediction.timeframe.split(' ')[0]}
                              </div>
                              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                Échéance
                              </div>
                            </div>
                          </div>

                          {/* Modèle et facteurs */}
                          <div className="mb-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Cpu className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                              <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                                Modèle: {model.name}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {model.type}
                              </Badge>
                            </div>
                            <div className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                              Facteurs d'influence:
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {prediction.factors.slice(0, 3).map((factor, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {factor}
                                </Badge>
                              ))}
                              {prediction.factors.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{prediction.factors.length - 3} autres
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Barre de confiance */}
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span style={{ color: 'var(--text-muted)' }}>Niveau de confiance</span>
                              <span style={{ color: 'var(--text-primary)' }}>{prediction.confidence.toFixed(1)}%</span>
                            </div>
                            <Progress value={prediction.confidence} className="h-2" />
                          </div>

                          {/* Actions de la prédiction */}
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                                toast.info('Validation prédiction', `Marquer comme ${prediction.status === 'active' ? 'archivée' : 'active'}`);
                              }}
                            >
                              {prediction.status === 'active' ? (
                                <>
                                  <TrendingDown className="h-4 w-4 mr-2" />
                                  Archiver
                                </>
                              ) : (
                                <>
                                  <TrendingUp className="h-4 w-4 mr-2" />
                                  Activer
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredPredictions.length === 0 && (
                  <div className="text-center py-12">
                    <Brain className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p style={{ color: 'var(--text-muted)' }}>
                      Aucune prédiction trouvée avec ces critères
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4" 
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedModel('all');
                        setSelectedType('all');
                        setSelectedTimeframe('all');
                        setSelectedStatus('all');
                        setConfidenceThreshold([80]);
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
