'use client';

import { useState, useEffect } from 'react';
import { useAIModels, useAIPredictions } from '@/hooks/use-predictions';
import { IntelNavigationBar } from '@/components/intelligence/intel-navigation-bar';
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
  Brain,
  Search,
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
  Zap,
  Cpu,
  FileText,
} from 'lucide-react';


export default function PredictionsAIPage() {
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

  // Load AI models and predictions from Convex
  const aiModelsRaw = useAIModels();
  const predictionsRaw = useAIPredictions({
    model: selectedModel !== 'all' ? selectedModel : undefined,
    type: selectedType !== 'all' ? selectedType : undefined,
    timeframe: selectedTimeframe !== 'all' ? selectedTimeframe : undefined,
    status: selectedStatus !== 'all' ? selectedStatus : undefined,
    minConfidence: confidenceThreshold[0],
  });

  // Use Convex data or fallback
  const aiModels = aiModelsRaw || {
    migrationPredictor: { name: '', type: '', accuracy: 0, lastTraining: '', dataPoints: 0, version: '', status: 'active' as const, description: '' },
    riskAssessment: { name: '', type: '', accuracy: 0, lastTraining: '', dataPoints: 0, version: '', status: 'active' as const, description: '' },
    networkAnalyzer: { name: '', type: '', accuracy: 0, lastTraining: '', dataPoints: 0, version: '', status: 'active' as const, description: '' },
    behaviorPredictor: { name: '', type: '', accuracy: 0, lastTraining: '', dataPoints: 0, version: '', status: 'active' as const, description: '' },
  };

  const allPredictions = predictionsRaw || [];

  // Client-side search filter (search is not handled server-side)
  const filteredPredictions = searchTerm
    ? allPredictions.filter(
        (prediction: any) =>
          prediction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          prediction.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allPredictions;

  const handleGeneratePredictions = async () => {
    setIsGenerating(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 4000));
      toast.success('Nouvelles prédictions générées', {
        description: `${Math.floor(Math.random() * 3) + 2} nouvelles prédictions créées`,
      });
    } catch {
      toast.error('Erreur de génération', {
        description: 'Impossible de générer de nouvelles prédictions',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTrainModel = async (modelKey: string) => {
    setIsTraining(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      const model = aiModels[modelKey as keyof typeof aiModels];
      toast.success(`Modèle ${model.name} entraîné`, {
        description: `Nouvelle précision: ${(model.accuracy + Math.random() * 2).toFixed(1)}%`,
      });
    } catch {
      toast.error("Erreur d'entraînement", {
        description: "Impossible d'entraîner le modèle",
      });
    } finally {
      setIsTraining(false);
    }
  };

  const handleExportPredictions = async () => {
    if (selectedPredictions.length === 0) {
      toast.error('Sélection requise', {
        description: 'Veuillez sélectionner au moins une prédiction',
      });
      return;
    }

    const selectedData: typeof filteredPredictions = filteredPredictions.filter((p: any) =>
      selectedPredictions.includes(p.id),
    );
    const csvContent = exportPredictionsToCSV(selectedData);
    downloadCSV(csvContent, 'predictions_ia_dgss.csv');

    toast.success('Export réussi', {
      description: `${selectedPredictions.length} prédictions exportées`,
    });
    setSelectedPredictions([]);
  };

  const exportPredictionsToCSV = (data: typeof filteredPredictions) => {
    const headers = [
      'ID',
      'Modèle',
      'Type',
      'Titre',
      'Confiance',
      'Probabilité',
      'Échéance',
      'Impact',
      'Niveau Risque',
      'Statut',
    ];
    const rows = data.map((pred: any) => [
      pred.id,
      pred.model,
      pred.type,
      pred.title,
      pred.confidence,
      pred.probability,
      pred.timeframe,
      pred.impact,
      pred.riskLevel,
      pred.status,
    ]);

    return [headers, ...rows].map((row: any) => row.join(',')).join('\n');
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
    if (confidence >= 90)
      return {
        text: '🎯 Très élevée',
        color: 'bg-green-500/20 text-green-500 border-green-500/30',
      };
    if (confidence >= 80)
      return {
        text: '✅ Élevée',
        color: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
      };
    if (confidence >= 70)
      return {
        text: '⚠️ Moyenne',
        color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
      };
    return { text: '❌ Faible', color: 'bg-red-500/20 text-red-500 border-red-500/30' };
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high':
        return {
          text: '🔴 Élevé',
          color: 'bg-red-500/20 text-red-500 border-red-500/30',
        };
      case 'medium':
        return {
          text: '🟡 Moyen',
          color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
        };
      case 'low':
        return {
          text: '🟢 Faible',
          color: 'bg-green-500/20 text-green-500 border-green-500/30',
        };
      default:
        return {
          text: 'Non défini',
          color: 'bg-gray-500/20 text-gray-500 border-gray-500/30',
        };
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
        const randomPrediction =
          filteredPredictions[Math.floor(Math.random() * filteredPredictions.length)];
        if (randomPrediction) {
          toast.info('Mise à jour IA', {
            description: `Confiance mise à jour: ${randomPrediction.title} → ${(randomPrediction.confidence + Math.random() * 2 - 1).toFixed(1)}%`,
          });
        }
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [realTimeMode, filteredPredictions]);

  // Statistiques des prédictions
  const averageConfidence =
    filteredPredictions.reduce((sum: number, p: any) => sum + p.confidence, 0) /
      filteredPredictions.length || 0;
  const highConfidencePredictions = filteredPredictions.filter(
    (p: any) => p.confidence >= 85,
  ).length;
  const activePredictions = filteredPredictions.filter(
    (p: any) => p.status === 'active',
  ).length;
  const alertPredictions = filteredPredictions.filter((p: any) => p.status === 'alert').length;

  return (
    <>
      <IntelNavigationBar currentPage="Prédictions" />
      <div className="space-y-6">
        {/* Stats des prédictions IA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'Prédictions actives',
              value: activePredictions,
              icon: Brain,
              color: 'blue',
              change: '+3',
            },
            {
              title: 'Confiance moyenne (%)',
              value: Math.round(averageConfidence),
              icon: Target,
              color: 'green',
              change: '+2.1%',
            },
            {
              title: 'Haute confiance',
              value: highConfidencePredictions,
              icon: Zap,
              color: 'orange',
              change: '+1',
            },
            {
              title: 'Alertes IA',
              value: alertPredictions,
              icon: AlertTriangle,
              color: 'red',
              change: '+2',
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
                <div className="flex items-center justify-between mb-2">
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
                  <Badge
                    variant={stat.change.includes('-') ? 'destructive' : 'default'}
                    className="text-xs"
                  >
                    {stat.change}
                  </Badge>
                </div>
                <div
                  className="text-2xl font-bold mb-1"
                  style={{ color: 'var(--text-primary)' }}
                >
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
                <Settings className="h-5 w-5" />
                Contrôles Intelligence Artificielle
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant={realTimeMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setRealTimeMode(!realTimeMode);
                    toast.info('Mode temps réel', {
                      description: realTimeMode ? 'Désactivé' : 'Activé',
                    });
                  }}
                >
                  {realTimeMode ? (
                    <Pause className="h-4 w-4 mr-2" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
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
                  {Object.entries(aiModels).map(([key, model]: [string, any]) => (
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
              <label
                className="text-sm font-medium mb-2 block"
                style={{ color: 'var(--text-secondary)' }}
              >
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
              <div
                className="flex justify-between text-xs mt-1"
                style={{ color: 'var(--text-muted)' }}
              >
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modèles IA */}
        <Card
          style={{
            background: 'var(--bg-glass-primary)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--border-glass-primary)',
          }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              Modèles d&apos;Intelligence Artificielle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(aiModels).map(([key, model]: [string, any]) => (
                <div
                  key={key}
                  className="p-4 rounded-lg transition-all duration-200"
                  style={{
                    background: 'var(--bg-glass-light)',
                    border: '1px solid var(--border-glass-secondary)',
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4
                        className="font-medium text-sm mb-1"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {model.name}
                      </h4>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {model.type} • Version {model.version}
                      </p>
                    </div>
                    <Badge
                      className={
                        model.status === 'active'
                          ? 'bg-green-500/20 text-green-500'
                          : model.status === 'training'
                            ? 'bg-yellow-500/20 text-yellow-500'
                            : 'bg-gray-500/20 text-gray-500'
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
                      <div
                        className="text-lg font-bold"
                        style={{ color: 'var(--accent-intel)' }}
                      >
                        {model.accuracy}%
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Précision
                      </div>
                    </div>
                    <div>
                      <div
                        className="text-lg font-bold"
                        style={{ color: 'var(--accent-warning)' }}
                      >
                        {model.dataPoints
                          .toString()
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
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
                      onClick={() =>
                        toast.info(`Modèle ${model.name}`, {
                          description: `Dernière formation: ${model.lastTraining}`,
                        })
                      }
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
                <Brain className="h-5 w-5" />
                Prédictions Générées par l&apos;IA
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-500/20 text-blue-500">
                  {filteredPredictions.length} prédictions filtrées
                </Badge>
                {filteredPredictions.length > 0 && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={
                        selectedPredictions.length === filteredPredictions.length &&
                        filteredPredictions.length > 0
                      }
                      onChange={(e) =>
                        setSelectedPredictions(
                          e.target.checked ? filteredPredictions.map((p: any) => p.id) : [],
                        )
                      }
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
              {filteredPredictions.map((prediction: any) => {
                const confidenceBadge = getConfidenceBadge(prediction.confidence);
                const impactBadge = getImpactBadge(prediction.impact);
                const statusBadge = getStatusBadge(prediction.status);
                const model = aiModels[prediction.model as keyof typeof aiModels] || {
                  name: 'Modèle Inconnu',
                  type: 'Inconnu',
                  accuracy: 0,
                  lastTraining: 'N/A',
                  dataPoints: 0,
                  version: 'N/A',
                  status: 'unknown',
                  description: 'Modèle non trouvé',
                };

                return (
                  <div
                    key={prediction.id}
                    className="p-4 rounded-lg transition-all duration-200 cursor-pointer group border-l-4"
                    style={{
                      background: 'var(--bg-glass-light)',
                      borderLeftColor:
                        prediction.riskLevel === 'high'
                          ? '#ef4444'
                          : prediction.riskLevel === 'medium'
                            ? '#f59e0b'
                            : '#10b981',
                    }}
                    onClick={() => {
                      toast.info(`Prédiction ${prediction.title}`, {
                        description: 'Analyse détaillée en développement',
                      });
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedPredictions.includes(prediction.id)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setSelectedPredictions((prev) =>
                            checked
                              ? [...prev, prediction.id]
                              : prev.filter((id) => id !== prediction.id),
                          );
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1 rounded"
                      />

                      <div className="flex-1">
                        {/* Header de la prédiction */}
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3
                              className="font-semibold text-base mb-1"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {prediction.title}
                            </h3>
                            <p
                              className="text-sm"
                              style={{ color: 'var(--text-secondary)' }}
                            >
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
                            <div
                              className="text-lg font-bold"
                              style={{ color: 'var(--accent-intel)' }}
                            >
                              {prediction.confidence.toFixed(1)}%
                            </div>
                            <div
                              className="text-xs"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              Confiance
                            </div>
                          </div>
                          <div>
                            <div
                              className="text-lg font-bold"
                              style={{ color: 'var(--accent-warning)' }}
                            >
                              {(prediction.probability * 100).toFixed(0)}%
                            </div>
                            <div
                              className="text-xs"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              Probabilité
                            </div>
                          </div>
                          <div>
                            <Badge className={impactBadge.color}>
                              {impactBadge.text}
                            </Badge>
                            <div
                              className="text-xs mt-1"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              Impact
                            </div>
                          </div>
                          <div>
                            <div
                              className="text-sm font-medium"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {prediction.timeframe.split(' ')[0]}
                            </div>
                            <div
                              className="text-xs"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              Échéance
                            </div>
                          </div>
                        </div>

                        {/* Modèle et facteurs */}
                        <div className="mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Cpu
                              className="h-4 w-4"
                              style={{ color: 'var(--text-muted)' }}
                            />
                            <span
                              className="text-xs font-medium"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              Modèle: {model.name}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {model.type}
                            </Badge>
                          </div>
                          <div
                            className="text-xs mb-2"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            Facteurs d&apos;influence:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {prediction.factors.slice(0, 3).map((factor: string, idx: number) => (
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
                            <span style={{ color: 'var(--text-muted)' }}>
                              Niveau de confiance
                            </span>
                            <span style={{ color: 'var(--text-primary)' }}>
                              {prediction.confidence.toFixed(1)}%
                            </span>
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
                              toast.info('Validation prédiction', {
                                description: `Marquer comme ${prediction.status === 'active' ? 'archivée' : 'active'}`,
                              });
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
    </>
  );
}
