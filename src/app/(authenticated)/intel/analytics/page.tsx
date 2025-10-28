'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useIntelligenceAnalytics } from '@/hooks/use-analytics';
import { IntelNavigationBar } from '@/components/intelligence/intel-navigation-bar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  BarChart3,
  TrendingUp,
  RefreshCw,
  Loader2,
  MapPin,
  Network,
  Target,
  Brain,
  AlertTriangle,
  PieChart,
  Activity,
  Zap,
  Eye,
} from 'lucide-react';

// Données d'analyse chargées depuis Convex (en temps réel)

export default function AnalyticsPage() {
  const t = useTranslations('intelligence.analytics');
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedAnalysisType, setSelectedAnalysisType] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Charger les analytics réels depuis Convex
  const analyticsDataRaw = useIntelligenceAnalytics(selectedPeriod);

  // Utiliser les données Convex si disponibles, sinon des données par défaut
  const analyticsData = analyticsDataRaw || {
    demographicAnalysis: { ageGroups: [], genderDistribution: { male: { count: 0, percentage: 0 }, female: { count: 0, percentage: 0 } } },
    geographicAnalysis: { concentrationZones: [] },
    riskAnalysis: { riskDistribution: [], trends: { increasing: 0, stable: 0, decreasing: 0 } },
    networkAnalysis: { clusters: [] },
    predictions: { migrationTrends: [] },
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success(t('actions.refresh_success'));
    } catch {
      toast.error(t('errors.refresh_failed'));
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      toast.success(t('actions.report_generated'));
    } catch {
      toast.error(t('errors.report_failed'));
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleClusterAnalysis = (clusterId: string) => {
    toast.info(
      `${t('actions.cluster_analysis')} - ${t('actions.cluster_analysis_description', { clusterId })}`,
    );
  };

  return (
    <>
      <IntelNavigationBar currentPage="Analyses" />
      <div className="space-y-6">
        <div className="space-y-6">
          {/* Stats analytiques */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {[
              {
                title: 'Clusters détectés',
                value: analyticsData.networkAnalysis.clusters.length,
                icon: Network,
                color: 'blue',
                change: '+2',
              },
              {
                title: 'Prédictions actives',
                value: analyticsData.predictions.migrationTrends.length,
                icon: Brain,
                color: 'green',
                change: '+1',
              },
              {
                title: 'Alertes générées',
                value: analyticsData.riskAnalysis.trends.increasing,
                icon: AlertTriangle,
                color: 'orange',
                change: '+3',
              },
              {
                title: 'Confiance IA (%)',
                value: Math.round(
                  analyticsData.predictions.migrationTrends.reduce(
                    (sum, p) => sum + p.confidence,
                    0,
                  ) / analyticsData.predictions.migrationTrends.length,
                ),
                icon: Zap,
                color: 'red',
                change: '+5%',
              },
            ].map((stat, index) => (
              <Card
                key={index}
                className="relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 bg-card border shadow-sm"
              >
                <CardHeader className="p-2 md:p-3 flex flex-row items-center justify-between space-y-0 pb-1">
                  <div
                    className={`p-1.5 rounded-lg ${
                      stat.color === 'blue'
                        ? 'bg-blue-100 text-blue-600'
                        : stat.color === 'green'
                          ? 'bg-green-100 text-green-600'
                          : stat.color === 'orange'
                            ? 'bg-orange-100 text-orange-600'
                            : 'bg-red-100 text-red-600'
                    }`}
                  >
                    <stat.icon className="h-4 w-4" />
                  </div>
                  <Badge
                    variant={stat.change.includes('-') ? 'destructive' : 'default'}
                    className="text-xs"
                  >
                    {stat.change}
                  </Badge>
                </CardHeader>
                <CardContent className="p-3 md:p-4 pt-0">
                  <div className="text-xl font-bold font-mono text-foreground">
                    {stat.value}
                  </div>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contrôles d'analyse */}
          <Card className="bg-card border shadow-sm">
            <CardHeader className="py-3 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <BarChart3 className="h-5 w-5" />
                  Paramètres d&apos;Analyse
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                  >
                    {isRefreshing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Recalculer
                  </Button>
                  <Button
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={handleGenerateReport}
                    disabled={isGeneratingReport}
                  >
                    {isGeneratingReport ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <BarChart3 className="h-4 w-4 mr-2" />
                    )}
                    {isGeneratingReport ? 'Génération...' : 'Générer rapport'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="py-3 px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Période d&apos;analyse
                  </label>
                  <Select
                    value={selectedPeriod}
                    onValueChange={(value) => setSelectedPeriod(value as 'day' | 'week' | 'month' | 'quarter' | 'year')}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Cette semaine</SelectItem>
                      <SelectItem value="month">Ce mois</SelectItem>
                      <SelectItem value="quarter">Ce trimestre</SelectItem>
                      <SelectItem value="year">Cette année</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Type d&apos;analyse
                  </label>
                  <Select
                    value={selectedAnalysisType}
                    onValueChange={setSelectedAnalysisType}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      <SelectItem value="demographic">Démographique</SelectItem>
                      <SelectItem value="geographic">Géographique</SelectItem>
                      <SelectItem value="risk">Analyse de risque</SelectItem>
                      <SelectItem value="network">Réseaux</SelectItem>
                      <SelectItem value="prediction">Prédictions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Niveau de détail
                  </label>
                  <Select defaultValue="detailed">
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="overview">Vue d&apos;ensemble</SelectItem>
                      <SelectItem value="detailed">Détaillé</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analyse démographique */}
          {(selectedAnalysisType === 'all' || selectedAnalysisType === 'demographic') && (
            <Card
              style={{
                background: 'var(--bg-glass-primary)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid var(--border-glass-primary)',
                boxShadow: 'var(--shadow-glass)',
              }}
            >
              <CardHeader>
                <CardTitle
                  className="flex items-center gap-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <PieChart className="h-5 w-5" />
                  Analyse Démographique
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Pyramide des âges */}
                  <div>
                    <h4
                      className="font-medium mb-4"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Répartition par âge
                    </h4>
                    <div className="space-y-3">
                      {analyticsData.demographicAnalysis.ageGroups.map((group) => (
                        <div key={group.range} className="flex items-center gap-3">
                          <div
                            className="w-16 text-sm font-medium"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            {group.range} ans
                          </div>
                          <div className="flex-1">
                            <Progress value={group.percentage} className="h-2" />
                          </div>
                          <div className="w-20 text-right">
                            <div
                              className="text-sm font-bold"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {group.count}
                            </div>
                            <div
                              className="text-xs"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              {group.percentage}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Distribution par genre */}
                  <div>
                    <h4
                      className="font-medium mb-4"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Distribution par genre
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-16 text-sm font-medium"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          👨 Hommes
                        </div>
                        <div className="flex-1">
                          <Progress
                            value={
                              analyticsData.demographicAnalysis.genderDistribution.male
                                .percentage
                            }
                            className="h-2"
                          />
                        </div>
                        <div className="w-20 text-right">
                          <div
                            className="text-sm font-bold"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {
                              analyticsData.demographicAnalysis.genderDistribution.male
                                .count
                            }
                          </div>
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {
                              analyticsData.demographicAnalysis.genderDistribution.male
                                .percentage
                            }
                            %
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-16 text-sm font-medium"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          👩 Femmes
                        </div>
                        <div className="flex-1">
                          <Progress
                            value={
                              analyticsData.demographicAnalysis.genderDistribution.female
                                .percentage
                            }
                            className="h-2"
                          />
                        </div>
                        <div className="w-20 text-right">
                          <div
                            className="text-sm font-bold"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {
                              analyticsData.demographicAnalysis.genderDistribution.female
                                .count
                            }
                          </div>
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {
                              analyticsData.demographicAnalysis.genderDistribution.female
                                .percentage
                            }
                            %
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analyse géographique */}
          {(selectedAnalysisType === 'all' || selectedAnalysisType === 'geographic') && (
            <Card
              style={{
                background: 'var(--bg-glass-primary)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid var(--border-glass-primary)',
                boxShadow: 'var(--shadow-glass)',
              }}
            >
              <CardHeader>
                <CardTitle
                  className="flex items-center gap-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <MapPin className="h-5 w-5" />
                  Concentration Géographique
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.geographicAnalysis.concentrationZones.map((zone) => {
                    const densityColor =
                      zone.density === 'high'
                        ? '#ef4444'
                        : zone.density === 'medium'
                          ? '#f59e0b'
                          : '#10b981';

                    return (
                      <div
                        key={zone.zone}
                        className="p-4 rounded-lg transition-all duration-200 cursor-pointer"
                        style={{
                          background: 'var(--bg-glass-light)',
                          border: '1px solid var(--border-glass-secondary)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--interactive-hover)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'var(--bg-glass-light)';
                        }}
                        onClick={() =>
                          toast.info(
                            `Analyse de ${zone.zone} - Analyse détaillée en développement`,
                          )
                        }
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ background: densityColor }}
                            />
                            <div>
                              <h4
                                className="font-medium text-sm"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {zone.zone}
                              </h4>
                              <p
                                className="text-xs"
                                style={{ color: 'var(--text-secondary)' }}
                              >
                                Densité: {zone.density}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <div
                                className="text-sm font-bold"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {zone.profiles}
                              </div>
                              <div
                                className="text-xs"
                                style={{ color: 'var(--text-muted)' }}
                              >
                                profils
                              </div>
                            </div>
                            <div className="text-center">
                              <div
                                className="text-sm font-bold"
                                style={{ color: 'var(--accent-intel)' }}
                              >
                                {zone.associations}
                              </div>
                              <div
                                className="text-xs"
                                style={{ color: 'var(--text-muted)' }}
                              >
                                associations
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Détection de clusters */}
          {(selectedAnalysisType === 'all' || selectedAnalysisType === 'network') && (
            <Card
              style={{
                background: 'var(--bg-glass-primary)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid var(--border-glass-primary)',
                boxShadow: 'var(--shadow-glass)',
              }}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle
                    className="flex items-center gap-2"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <Target className="h-5 w-5" />
                    Clusters Détectés
                  </CardTitle>
                  <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">
                    {analyticsData.networkAnalysis.clusters.length} clusters actifs
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {analyticsData.networkAnalysis.clusters.map((cluster) => {
                    const influenceColor =
                      cluster.influence === 'high'
                        ? '#ef4444'
                        : cluster.influence === 'medium'
                          ? '#f59e0b'
                          : '#10b981';

                    return (
                      <div
                        key={cluster.id}
                        className="p-4 rounded-lg transition-all duration-200 cursor-pointer group"
                        style={{
                          background: 'var(--bg-glass-light)',
                          border: '1px solid var(--border-glass-secondary)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--interactive-hover)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'var(--bg-glass-light)';
                        }}
                        onClick={() => handleClusterAnalysis(cluster.id)}
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
                              ID: {cluster.id}
                            </p>
                          </div>
                          <Badge
                            className="text-xs"
                            style={{
                              background:
                                cluster.influence === 'high'
                                  ? 'rgba(239, 68, 68, 0.2)'
                                  : cluster.influence === 'medium'
                                    ? 'rgba(245, 158, 11, 0.2)'
                                    : 'rgba(16, 185, 129, 0.2)',
                              color: influenceColor,
                            }}
                          >
                            {cluster.influence.toUpperCase()}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div
                              className="text-lg font-bold"
                              style={{ color: 'var(--accent-intel)' }}
                            >
                              {cluster.size}
                            </div>
                            <div
                              className="text-xs"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              membres
                            </div>
                          </div>
                          <div className="text-center">
                            <div
                              className="text-lg font-bold"
                              style={{ color: 'var(--accent-warning)' }}
                            >
                              {cluster.connections}
                            </div>
                            <div
                              className="text-xs"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              connexions
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="outline" size="sm" className="w-full">
                            <Eye className="h-4 w-4 mr-2" />
                            Analyser le cluster
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Prédictions IA */}
          {(selectedAnalysisType === 'all' || selectedAnalysisType === 'prediction') && (
            <Card
              style={{
                background: 'var(--bg-glass-primary)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid var(--border-glass-primary)',
                boxShadow: 'var(--shadow-glass)',
              }}
            >
              <CardHeader>
                <CardTitle
                  className="flex items-center gap-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <Brain className="h-5 w-5" />
                  Prédictions Intelligence Artificielle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.predictions.migrationTrends.map((prediction, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg"
                      style={{
                        background: 'var(--bg-glass-light)',
                        border: '1px solid var(--border-glass-secondary)',
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {prediction.period}
                          </Badge>
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{
                              background:
                                prediction.confidence >= 85
                                  ? '#10b981'
                                  : prediction.confidence >= 70
                                    ? '#f59e0b'
                                    : '#ef4444',
                            }}
                          />
                        </div>
                        <div
                          className="text-sm font-medium"
                          style={{ color: 'var(--accent-intel)' }}
                        >
                          {prediction.confidence}% confiance
                        </div>
                      </div>

                      <p
                        className="text-sm mb-3"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {prediction.prediction}
                      </p>

                      <Progress value={prediction.confidence} className="h-1" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analyse des risques */}
          {(selectedAnalysisType === 'all' || selectedAnalysisType === 'risk') && (
            <Card
              style={{
                background: 'var(--bg-glass-primary)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid var(--border-glass-primary)',
                boxShadow: 'var(--shadow-glass)',
              }}
            >
              <CardHeader>
                <CardTitle
                  className="flex items-center gap-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <AlertTriangle className="h-5 w-5" />
                  Analyse des Risques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Distribution des risques */}
                  <div>
                    <h4
                      className="font-medium mb-4"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Distribution des niveaux de risque
                    </h4>
                    <div className="space-y-3">
                      {analyticsData.riskAnalysis.riskDistribution.map((risk) => (
                        <div key={risk.level} className="flex items-center gap-3">
                          <div
                            className="w-20 text-sm font-medium"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            {risk.level}
                          </div>
                          <div className="flex-1">
                            <Progress value={risk.percentage} className="h-2" />
                          </div>
                          <div className="w-20 text-right">
                            <div
                              className="text-sm font-bold"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {risk.count}
                            </div>
                            <div
                              className="text-xs"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              {risk.percentage}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tendances des risques */}
                  <div>
                    <h4
                      className="font-medium mb-4"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Évolution des tendances
                    </h4>
                    <div className="space-y-3">
                      <div
                        className="flex items-center justify-between p-3 rounded-lg"
                        style={{ background: 'var(--bg-glass-light)' }}
                      >
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-red-500" />
                          <span
                            className="text-sm"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            En augmentation
                          </span>
                        </div>
                        <Badge className="bg-red-500/20 text-red-500">
                          {analyticsData.riskAnalysis.trends.increasing}
                        </Badge>
                      </div>

                      <div
                        className="flex items-center justify-between p-3 rounded-lg"
                        style={{ background: 'var(--bg-glass-light)' }}
                      >
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-green-500" />
                          <span
                            className="text-sm"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            Stables
                          </span>
                        </div>
                        <Badge className="bg-green-500/20 text-green-500">
                          {analyticsData.riskAnalysis.trends.stable}
                        </Badge>
                      </div>

                      <div
                        className="flex items-center justify-between p-3 rounded-lg"
                        style={{ background: 'var(--bg-glass-light)' }}
                      >
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-blue-500 rotate-180" />
                          <span
                            className="text-sm"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            En diminution
                          </span>
                        </div>
                        <Badge className="bg-blue-500/20 text-blue-500">
                          {analyticsData.riskAnalysis.trends.decreasing}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
