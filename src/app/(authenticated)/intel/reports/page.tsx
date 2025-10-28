'use client';

import { useState, useCallback } from 'react';
import { useReportMetrics, useMonthlyTrends } from '@/hooks/use-reports';
import { toast } from 'sonner';
import { IntelNavigationBar } from '@/components/intelligence/intel-navigation-bar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  BarChart3,
  Download,
  FileText,
  TrendingUp,
  Calendar,
  Users,
  MapPin,
  Eye,
  Target,
  Activity,
  RefreshCw,
  Filter,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function RapportsPage() {
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [reportType, setReportType] = useState<
    'summary' | 'detailed' | 'geographic' | 'security'
  >('summary');
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'json'>('pdf');
  const [classification, setClassification] = useState<
    'public' | 'interne' | 'confidentiel' | 'secret'
  >('confidentiel');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load data from Convex
  const reportMetricsRaw = useReportMetrics(period);
  const monthlyTrendsRaw = useMonthlyTrends();

  // Use Convex data or fallback
  const reportMetrics = reportMetricsRaw || {
    totalProfiles: 0,
    activeProfiles: 0,
    notesGenerated: 0,
    reportsGenerated: 0,
    averageProcessingTime: '0h',
    efficiencyRate: 0,
    geographicCoverage: 0,
    dataQuality: 0,
  };

  const monthlyTrends = monthlyTrendsRaw || [];

  const statsLoading = reportMetricsRaw === undefined;
  const statsError = null; // Convex handles errors differently

  const recentReports = [
    {
      id: 'RPT-001',
      title: 'Rapport Mensuel - Surveillance Générale',
      type: 'summary',
      status: 'completed',
      generatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      author: 'Agent Dubois',
      size: '2.4 MB',
      profiles: 2847,
    },
    {
      id: 'RPT-002',
      title: 'Analyse Géographique - Zones Sensibles',
      type: 'geographic',
      status: 'completed',
      generatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      author: 'Agent Martin',
      size: '5.1 MB',
      profiles: 456,
    },
    {
      id: 'RPT-003',
      title: 'Rapport Sécuritaire - Incidents',
      type: 'security',
      status: 'processing',
      generatedAt: new Date(Date.now() - 30 * 60 * 1000),
      author: 'System Auto',
      size: 'En cours...',
      profiles: 23,
    },
  ];

  const getReportTypeStyle = (type: string) => {
    switch (type) {
      case 'summary':
        return { bg: 'bg-blue-500/20', text: 'text-blue-500', icon: BarChart3 };
      case 'geographic':
        return { bg: 'bg-green-500/20', text: 'text-green-500', icon: MapPin };
      case 'security':
        return { bg: 'bg-red-500/20', text: 'text-red-500', icon: Eye };
      default:
        return { bg: 'bg-gray-500/20', text: 'text-gray-500', icon: FileText };
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          bg: 'bg-green-500/20',
          text: 'text-green-500',
          border: 'border-green-500/30',
        };
      case 'processing':
        return {
          bg: 'bg-orange-500/20',
          text: 'text-orange-500',
          border: 'border-orange-500/30',
        };
      case 'failed':
        return { bg: 'bg-red-500/20', text: 'text-red-500', border: 'border-red-500/30' };
      default:
        return {
          bg: 'bg-gray-500/20',
          text: 'text-gray-500',
          border: 'border-gray-500/30',
        };
    }
  };

  // Gestionnaires d'événements
  const handleGenerateReport = useCallback(async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    toast.info(`Génération du rapport ${reportType} en cours...`);

    try {
      // Simuler la génération de rapport (remplacer par vraie API)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Ici, appeler l'API réelle pour générer le rapport
      // const result = await api.intelligence.generateReport.mutate({
      //   type: reportType,
      //   period,
      //   format: exportFormat,
      //   classification
      // });

      toast.success(`Rapport ${reportType} généré avec succès !`);

      // Simuler le téléchargement
      const link = document.createElement('a');
      link.href = '#'; // Remplacer par l'URL réelle du rapport
      link.download = `rapport-${reportType}-${period}-${Date.now()}.${exportFormat}`;
      // link.click();
    } catch (err) {
      console.error('Erreur génération rapport:', err);
      toast.error('Erreur lors de la génération du rapport');
    } finally {
      setIsGenerating(false);
    }
  }, [reportType, period, exportFormat, classification, isGenerating]);

  const handleRefreshReports = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    toast.info('Actualisation des rapports...');

    try {
      // Ici, recharger les données des rapports
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Rapports actualisés');
    } catch (err) {
      console.error('Erreur actualisation:', err);
      toast.error("Erreur lors de l'actualisation");
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  const handleDownloadReport = useCallback(
    async (_reportId: string, reportTitle: string) => {
      toast.info(`Téléchargement de ${reportTitle}...`);

      try {
        // Simuler le téléchargement
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Ici, appeler l'API pour télécharger le rapport
        // const blob = await api.intelligence.downloadReport.mutate({ reportId });

        toast.success(`${reportTitle} téléchargé`);

        // Simuler le téléchargement du fichier
        const link = document.createElement('a');
        link.href = '#'; // Remplacer par l'URL réelle
        link.download = `${_reportId}.pdf`;
        // link.click();
      } catch (err) {
        console.error('Erreur téléchargement:', err);
        toast.error('Erreur lors du téléchargement');
      }
    },
    [],
  );

  const handleViewReport = useCallback(
    (_reportId: string, reportTitle: string) => {
      toast.info(`Ouverture de ${reportTitle}...`);
      // Ici, ouvrir le rapport dans une nouvelle fenêtre ou modal
      // window.open(`/api/reports/${reportId}/view`, '_blank');
      toast.success(`${reportTitle} ouvert`);
    },
    [],
  );

  // Gestion des erreurs
  if (statsError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center gap-4 text-center max-w-md">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
              <FileText className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold">Erreur de chargement</h2>
            <p className="text-muted-foreground">
              Impossible de charger les données des rapports. Vérifiez votre connexion.
            </p>
            <Button onClick={() => window.location.reload()}>Réessayer</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <IntelNavigationBar currentPage="Rapports" />
      <div className="space-y-6">
        {/* Métriques principales */}
        {statsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="p-3">
                  <div className="w-6 h-6 bg-gray-300 rounded"></div>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="w-16 h-6 bg-gray-300 rounded mb-2"></div>
                  <div className="w-24 h-4 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'Profils analysés',
                value: reportMetrics.totalProfiles,
                icon: Users,
                color: 'blue',
                trend: '+12%',
              },
              {
                title: 'Rapports générés',
                value: reportMetrics.reportsGenerated,
                icon: FileText,
                color: 'green',
                trend: '+25%',
              },
              {
                title: "Taux d'efficacité",
                value: `${reportMetrics.efficiencyRate}%`,
                icon: Target,
                color: 'orange',
                trend: '+3%',
                progress: reportMetrics.efficiencyRate,
              },
              {
                title: 'Couverture géographique',
                value: `${reportMetrics.geographicCoverage}%`,
                icon: MapPin,
                color: 'purple',
                trend: '+7%',
                progress: reportMetrics.geographicCoverage,
              },
            ].map((metric, index) => (
              <Card
                key={index}
                className="relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
                style={{
                  background: 'var(--bg-glass-primary)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid var(--border-glass-primary)',
                  boxShadow: 'var(--shadow-glass)',
                }}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100"
                  style={{
                    background:
                      'linear-gradient(90deg, transparent, var(--accent-intel), transparent)',
                    animation: 'scan 3s infinite',
                  }}
                />
                <CardHeader className="p-2 md:p-3 flex flex-row items-center justify-between space-y-0 pb-1">
                  <div
                    className="p-1.5 rounded-lg"
                    style={{
                      background:
                        metric.color === 'blue'
                          ? 'rgba(59, 130, 246, 0.2)'
                          : metric.color === 'green'
                            ? 'rgba(16, 185, 129, 0.2)'
                            : metric.color === 'orange'
                              ? 'rgba(245, 158, 11, 0.2)'
                              : metric.color === 'purple'
                                ? 'rgba(168, 85, 247, 0.2)'
                                : 'rgba(239, 68, 68, 0.2)',
                      color:
                        metric.color === 'blue'
                          ? '#3b82f6'
                          : metric.color === 'green'
                            ? '#10b981'
                            : metric.color === 'orange'
                              ? '#f59e0b'
                              : metric.color === 'purple'
                                ? '#a855f7'
                                : '#ef4444',
                    }}
                  >
                    <metric.icon className="h-4 w-4" />
                  </div>
                  <Badge
                    variant={metric.trend.includes('-') ? 'destructive' : 'default'}
                    className="text-xs"
                  >
                    {metric.trend}
                  </Badge>
                </CardHeader>
                <CardContent className="p-3 md:p-4 pt-0">
                  <div
                    className="text-xl font-bold font-mono mb-1"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {metric.value}
                  </div>
                  <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                    {metric.title}
                  </p>
                  {metric.progress && (
                    <Progress value={metric.progress} className="h-1.5" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Contrôles de génération */}
        <Card
          style={{
            background: 'var(--bg-glass-primary)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid var(--border-glass-primary)',
            boxShadow: 'var(--shadow-glass)',
          }}
        >
          <CardHeader className="py-3 px-4">
            <CardTitle
              className="flex items-center gap-2"
              style={{ color: 'var(--text-primary)' }}
            >
              <Filter className="h-5 w-5" />
              Génération de Rapports
            </CardTitle>
          </CardHeader>
          <CardContent className="py-3 px-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              <div className="space-y-2">
                <label
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Type de rapport
                </label>
                <Select
                  value={reportType}
                  onValueChange={(value) => setReportType(value as any)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="summary">📊 Synthèse générale</SelectItem>
                    <SelectItem value="detailed">📋 Rapport détaillé</SelectItem>
                    <SelectItem value="geographic">🗺️ Analyse géographique</SelectItem>
                    <SelectItem value="security">🔒 Rapport sécuritaire</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Période
                </label>
                <Select value={period} onValueChange={(value) => setPeriod(value as any)}>
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
                <label
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Format
                </label>
                <Select
                  value={exportFormat}
                  onValueChange={(value) => setExportFormat(value as any)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">📄 PDF</SelectItem>
                    <SelectItem value="excel">📊 Excel</SelectItem>
                    <SelectItem value="json">💾 JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Classification
                </label>
                <Select
                  value={classification}
                  onValueChange={(value) => setClassification(value as any)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">🟢 Public</SelectItem>
                    <SelectItem value="interne">🟡 Interne</SelectItem>
                    <SelectItem value="confidentiel">🔴 Confidentiel</SelectItem>
                    <SelectItem value="secret">⚫ Secret</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Action
                </label>
                <Button
                  size="sm"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
                  onClick={handleGenerateReport}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  {isGenerating ? 'Génération...' : 'Générer'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tendances et Analytics */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Graphique des tendances */}
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
                <TrendingUp className="h-5 w-5" />
                Tendances Mensuelles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {monthlyTrends.map((trend: any) => (
                  <div key={trend.month} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span
                        className="text-sm font-medium"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {trend.month} 2024
                      </span>
                      <div
                        className="flex items-center gap-4 text-xs"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <span>👥 {trend.profiles}</span>
                        <span>📝 {trend.notes}</span>
                        <span>⚡ {trend.efficiency}%</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <div
                          className="text-xs mb-1"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          Profils
                        </div>
                        <Progress value={(trend.profiles / 3000) * 100} className="h-2" />
                      </div>
                      <div>
                        <div
                          className="text-xs mb-1"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          Notes
                        </div>
                        <Progress value={(trend.notes / 200) * 100} className="h-2" />
                      </div>
                      <div>
                        <div
                          className="text-xs mb-1"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          Efficacité
                        </div>
                        <Progress value={trend.efficiency} className="h-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Métriques de performance */}
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
                <Activity className="h-5 w-5" />
                Métriques de Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  {
                    label: "Taux d'efficacité global",
                    value: reportMetrics.efficiencyRate,
                    target: 95,
                    color: 'green',
                  },
                  {
                    label: 'Couverture géographique',
                    value: reportMetrics.geographicCoverage,
                    target: 90,
                    color: 'blue',
                  },
                  {
                    label: 'Qualité des données',
                    value: reportMetrics.dataQuality,
                    target: 95,
                    color: 'orange',
                  },
                ].map((perf, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span
                        className="text-sm font-medium"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {perf.label}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-sm font-bold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {perf.value}%
                        </span>
                        <Badge
                          className={`text-xs ${
                            perf.value >= perf.target
                              ? 'bg-green-500/20 text-green-500'
                              : 'bg-orange-500/20 text-orange-500'
                          }`}
                        >
                          {perf.value >= perf.target ? '✓' : '⚠'}
                        </Badge>
                      </div>
                    </div>
                    <Progress value={perf.value} className="h-2" />
                    <div
                      className="flex justify-between text-xs"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <span>0%</span>
                      <span>Objectif: {perf.target}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rapports récents */}
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
              <CardTitle style={{ color: 'var(--text-primary)' }}>
                Rapports Récents
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshReports}
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
                />
                {isRefreshing ? 'Actualisation...' : 'Actualiser'}
              </Button>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {recentReports.length} rapports disponibles
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentReports.map((report, index) => {
                const typeStyle = getReportTypeStyle(report.type);
                const statusStyle = getStatusStyle(report.status);
                const TypeIcon = typeStyle.icon;

                return (
                  <div
                    key={report.id}
                    className="flex items-center gap-4 p-4 rounded-lg hover:bg-opacity-50 hover:bg-white transition-all duration-200 cursor-pointer"
                    style={{ background: 'var(--bg-glass-light)' }}
                    onClick={() => handleViewReport(report.id, report.title)}
                  >
                    <div
                      className="p-2 rounded-lg"
                      style={{
                        background: typeStyle.bg.replace('bg-', '').includes('blue')
                          ? 'rgba(59, 130, 246, 0.2)'
                          : typeStyle.bg.replace('bg-', '').includes('green')
                            ? 'rgba(16, 185, 129, 0.2)'
                            : typeStyle.bg.replace('bg-', '').includes('red')
                              ? 'rgba(239, 68, 68, 0.2)'
                              : 'rgba(107, 114, 128, 0.2)',
                        color: typeStyle.text.replace('text-', '').includes('blue')
                          ? '#3b82f6'
                          : typeStyle.text.replace('text-', '').includes('green')
                            ? '#10b981'
                            : typeStyle.text.replace('text-', '').includes('red')
                              ? '#ef4444'
                              : '#6b7280',
                      }}
                    >
                      <TypeIcon className="h-5 w-5" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p
                          className="font-medium text-sm"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {report.title}
                        </p>
                        <Badge
                          className={`text-xs ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                        >
                          {report.status === 'completed'
                            ? 'TERMINÉ'
                            : report.status === 'processing'
                              ? 'EN COURS'
                              : 'ÉCHEC'}
                        </Badge>
                      </div>

                      <div
                        className="flex items-center gap-4 text-xs"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <span>📋 {report.id}</span>
                        <span>👤 {report.author}</span>
                        <span>📊 {report.profiles} profils</span>
                        <span>💾 {report.size}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(report.generatedAt, 'dd/MM/yyyy HH:mm', {
                            locale: fr,
                          })}
                        </span>
                      </div>
                    </div>

                    {report.status === 'completed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation(); // Éviter le clic sur le parent
                          handleDownloadReport(report.id, report.title);
                        }}
                        className="hover:bg-blue-500/10"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
