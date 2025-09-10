'use client';

import { useState, useMemo } from 'react';
import { PageContainer } from '@/components/layouts/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
  MapPin,
  Search,
  Filter,
  Download,
  RefreshCw,
  Loader2,
  Building2,
  Users,
  TrendingUp,
  AlertTriangle,
  Eye,
  Activity,
  Shield,
  Globe,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  associations as dgssAssociations,
  associationStats,
  type Association,
} from '@/data/dgss-associations';

// Import dynamique du composant de carte pour éviter les erreurs SSR
const AssociationsMapSimple = dynamic(
  () => import('@/components/intelligence/associations-map-simple'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-600">Chargement de la carte...</p>
        </div>
      </div>
    ),
  },
);

// Transformation des données pour le format attendu par le composant carte
const transformAssociationsForMap = (associations: Association[]) => {
  return associations.map((asso) => ({
    id: asso.id,
    name: asso.name,
    category: asso.category,
    city: asso.city,
    riskLevel: asso.riskLevel,
    memberCount: asso.memberCount,
    zone: asso.zone,
    status: asso.monitoringStatus,
    activities: asso.activities,
    influence: asso.influence,
  }));
};

export default function AssociationsMapPage() {
  const router = useRouter();

  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showClusters, setShowClusters] = useState(true);
  const [selectedAssociations, setSelectedAssociations] = useState<Set<string>>(
    new Set(),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'list' | 'grid'>('map');

  // Filtrage des associations
  const filteredAssociations = useMemo(() => {
    return dgssAssociations.filter((asso) => {
      const matchesSearch =
        searchTerm === '' ||
        asso.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asso.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asso.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' || asso.category === selectedCategory;
      const matchesZone = selectedZone === 'all' || asso.zone.includes(selectedZone);
      const matchesRisk =
        selectedRiskLevel === 'all' || asso.riskLevel === selectedRiskLevel;
      const matchesStatus =
        selectedStatus === 'all' || asso.monitoringStatus === selectedStatus;

      return (
        matchesSearch && matchesCategory && matchesZone && matchesRisk && matchesStatus
      );
    });
  }, [searchTerm, selectedCategory, selectedZone, selectedRiskLevel, selectedStatus]);

  // Statistiques filtrées
  const filteredStats = useMemo(() => {
    const byCategory: Record<string, number> = {};
    const byZone: Record<string, number> = {};
    const byRisk: Record<string, number> = {};

    filteredAssociations.forEach((asso) => {
      byCategory[asso.category] = (byCategory[asso.category] || 0) + 1;
      byZone[asso.zone] = (byZone[asso.zone] || 0) + 1;
      byRisk[asso.riskLevel] = (byRisk[asso.riskLevel] || 0) + 1;
    });

    return { byCategory, byZone, byRisk };
  }, [filteredAssociations]);

  // Gestionnaires
  const handleSelectAll = () => {
    if (selectedAssociations.size === filteredAssociations.length) {
      setSelectedAssociations(new Set());
    } else {
      setSelectedAssociations(new Set(filteredAssociations.map((a) => a.id)));
    }
  };

  const handleSelectAssociation = (id: string) => {
    const newSelection = new Set(selectedAssociations);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedAssociations(newSelection);
  };

  const handleExport = () => {
    const dataToExport = filteredAssociations.filter(
      (a) => selectedAssociations.size === 0 || selectedAssociations.has(a.id),
    );

    const csv = [
      [
        'ID',
        'Nom',
        'Catégorie',
        'Zone',
        'Ville',
        'Membres',
        'Niveau de Risque',
        'Statut',
        'Influence',
      ].join(','),
      ...dataToExport.map((a) =>
        [
          a.id,
          `"${a.name}"`,
          a.category,
          a.zone,
          a.city,
          a.memberCount || 'N/A',
          a.riskLevel,
          a.monitoringStatus,
          a.influence,
        ].join(','),
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `associations_dgss_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast.success(`${dataToExport.length} associations exportées`);
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    toast.info('Actualisation des données...');

    // Simulation d'une actualisation
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsLoading(false);
    toast.success('Données actualisées');
  };

  const handleViewDetails = (id: string) => {
    router.push(`/dashboard/entities/associations/${id}`);
  };

  // Transformation des données pour la carte
  const mapData = useMemo(
    () => transformAssociationsForMap(filteredAssociations),
    [filteredAssociations],
  );

  return (
    <PageContainer
      title="Cartographie des Associations DGSS"
      description="Surveillance et analyse des 129 associations gabonaises en France"
    >
      <div className="space-y-6">
        {/* Statistiques en temps réel */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Associations</p>
                  <p className="text-2xl font-bold">{associationStats.total}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {filteredAssociations.length} affichées
                  </p>
                </div>
                <Building2 className="h-8 w-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Zone 1 (Paris)</p>
                  <p className="text-2xl font-bold">
                    {associationStats.byZone['Zone 1']}
                  </p>
                  <Badge variant="outline" className="mt-1">
                    {Math.round(
                      (associationStats.byZone['Zone 1'] / associationStats.total) * 100,
                    )}
                    %
                  </Badge>
                </div>
                <MapPin className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Risque Élevé</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {associationStats.byRiskLevel.eleve +
                      associationStats.byRiskLevel.critique}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Surveillance active
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Humanitaires</p>
                  <p className="text-2xl font-bold">
                    {associationStats.byCategory['Social / Humanitaire']}
                  </p>
                  <Badge className="mt-1" variant="secondary">
                    Principal
                  </Badge>
                </div>
                <Users className="h-8 w-8 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Entrepreneurs</p>
                  <p className="text-2xl font-bold">
                    {
                      associationStats.byCategory[
                        'Education - Réseautage / Entrepreneurs'
                      ]
                    }
                  </p>
                  <Badge className="mt-1" variant="destructive">
                    À surveiller
                  </Badge>
                </div>
                <TrendingUp className="h-8 w-8 text-red-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres avancés */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtres et Recherche
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedZone('all');
                    setSelectedRiskLevel('all');
                    setSelectedStatus('all');
                  }}
                >
                  Réinitialiser
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Recherche</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Nom, ville, catégorie..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les catégories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    {Object.keys(associationStats.byCategory).map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat} ({associationStats.byCategory[cat]})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Zone CGF</Label>
                <Select value={selectedZone} onValueChange={setSelectedZone}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les zones" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les zones</SelectItem>
                    <SelectItem value="Zone 1">
                      Zone 1 : Paris IDF ({associationStats.byZone['Zone 1']})
                    </SelectItem>
                    <SelectItem value="Zone 2">
                      Zone 2 : Nord-Ouest ({associationStats.byZone['Zone 2']})
                    </SelectItem>
                    <SelectItem value="Zone 3">
                      Zone 3 : Nord-Est ({associationStats.byZone['Zone 3']})
                    </SelectItem>
                    <SelectItem value="Zone 4">
                      Zone 4 : Sud-Est ({associationStats.byZone['Zone 4']})
                    </SelectItem>
                    <SelectItem value="Zone 5">
                      Zone 5 : Sud-Ouest ({associationStats.byZone['Zone 5']})
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Niveau de Risque</Label>
                <Select value={selectedRiskLevel} onValueChange={setSelectedRiskLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les niveaux" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les niveaux</SelectItem>
                    <SelectItem value="faible">
                      <span className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        Faible ({associationStats.byRiskLevel.faible})
                      </span>
                    </SelectItem>
                    <SelectItem value="moyen">
                      <span className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                        Moyen ({associationStats.byRiskLevel.moyen})
                      </span>
                    </SelectItem>
                    <SelectItem value="eleve">
                      <span className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                        Élevé ({associationStats.byRiskLevel.eleve})
                      </span>
                    </SelectItem>
                    <SelectItem value="critique">
                      <span className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        Critique ({associationStats.byRiskLevel.critique})
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="heatmap"
                    checked={showHeatmap}
                    onCheckedChange={(checked) => setShowHeatmap(checked as boolean)}
                  />
                  <Label htmlFor="heatmap" className="text-sm cursor-pointer">
                    Carte de densité
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="clusters"
                    checked={showClusters}
                    onCheckedChange={(checked) => setShowClusters(checked as boolean)}
                  />
                  <Label htmlFor="clusters" className="text-sm cursor-pointer">
                    Regroupement automatique
                  </Label>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode('map')}
                  className={viewMode === 'map' ? 'bg-accent' : ''}
                >
                  <MapPin className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'bg-accent' : ''}
                >
                  <Users className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'bg-accent' : ''}
                >
                  <Building2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions et sélection */}
        {selectedAssociations.size > 0 && (
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Badge variant="secondary">
                    {selectedAssociations.size} sélectionnée(s)
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedAssociations(new Set())}
                  >
                    Désélectionner tout
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Exporter CSV
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => toast.info('Génération du rapport en cours...')}
                  >
                    Générer rapport
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Affichage selon le mode */}
        {viewMode === 'map' ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>
                  Carte Interactive - {filteredAssociations.length} associations
                </span>
                <Badge variant="outline">
                  Mise à jour : {new Date().toLocaleTimeString()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[600px]">
                <AssociationsMapSimple
                  associations={mapData}
                  onAssociationClick={(id) => {
                    const asso = filteredAssociations.find((a) => a.id === id);
                    if (asso) {
                      toast.info(`Association: ${asso.name}`, {
                        description: `${asso.category} - ${asso.city}`,
                      });
                    }
                  }}
                  className="h-full"
                  showClusters={showClusters}
                />
              </div>
            </CardContent>
          </Card>
        ) : viewMode === 'list' ? (
          <Card>
            <CardHeader>
              <CardTitle>Liste des Associations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredAssociations.map((asso) => (
                  <div
                    key={asso.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => handleViewDetails(asso.id)}
                  >
                    <div className="flex items-center gap-4">
                      <Checkbox
                        checked={selectedAssociations.has(asso.id)}
                        onCheckedChange={() => handleSelectAssociation(asso.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div>
                        <div className="font-medium">{asso.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {asso.category} • {asso.city} • {asso.memberCount || 'N/A'}{' '}
                          membres
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          asso.riskLevel === 'critique'
                            ? 'destructive'
                            : asso.riskLevel === 'eleve'
                              ? 'default'
                              : asso.riskLevel === 'moyen'
                                ? 'secondary'
                                : 'outline'
                        }
                      >
                        {asso.riskLevel}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssociations.map((asso) => (
              <Card
                key={asso.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleViewDetails(asso.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">{asso.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {asso.category}
                      </p>
                    </div>
                    <Checkbox
                      checked={selectedAssociations.has(asso.id)}
                      onCheckedChange={() => handleSelectAssociation(asso.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {asso.city} • {asso.zone}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{asso.memberCount || 'N/A'} membres</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span>Influence : {asso.influence}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <Badge
                      variant={
                        asso.riskLevel === 'critique'
                          ? 'destructive'
                          : asso.riskLevel === 'eleve'
                            ? 'default'
                            : asso.riskLevel === 'moyen'
                              ? 'secondary'
                              : 'outline'
                      }
                    >
                      Risque {asso.riskLevel}
                    </Badge>
                    <Badge
                      variant={asso.monitoringStatus === 'actif' ? 'default' : 'outline'}
                    >
                      {asso.monitoringStatus === 'actif' ? (
                        <Activity className="h-3 w-3 mr-1" />
                      ) : null}
                      {asso.monitoringStatus}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Légende */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Légende et Informations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="space-y-2">
                <p className="font-medium">Niveaux de Risque</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span>Faible</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span>Moyen</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span>Élevé</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span>Critique</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-medium">Zones CGF</p>
                <div className="space-y-1 text-xs">
                  <div>Zone 1 : Paris IDF</div>
                  <div>Zone 2 : Nord-Ouest</div>
                  <div>Zone 3 : Nord-Est</div>
                  <div>Zone 4 : Sud-Est</div>
                  <div>Zone 5 : Sud-Ouest</div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-medium">Statuts de Surveillance</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Activity className="h-3 w-3" />
                    <span>Actif - Surveillance continue</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-3 w-3" />
                    <span>Passif - Surveillance périodique</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-medium">Actions Rapides</p>
                <div className="space-y-1 text-xs">
                  <div>• Clic pour voir les détails</div>
                  <div>• Sélection multiple pour export</div>
                  <div>• Filtrage en temps réel</div>
                  <div>• Génération de rapports</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
