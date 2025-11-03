'use client';

import { useState, useMemo } from 'react';
import IntelAgentLayout from '@/components/layouts/intel-agent-layout';
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
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
  Search,
  Filter,
  Download,
  Briefcase,
  DollarSign,
  Globe,
  AlertTriangle,
  MapPin,
} from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import SmartInteractiveMap from '@/components/intelligence/smart-interactive-map';

// Données optimisées des entreprises
const enterprisesData = [
  {
    id: 'ent-001',
    name: 'Réseau Entrepreneurs Gabonais Europe',
    sector: 'Réseautage professionnel',
    location: {
      city: 'Lyon',
      country: 'France',
      coordinates: { lat: 45.764, lng: 4.8357 },
    },
    zone: 'Zone 4 : Sud-Est',
    members: 124,
    revenue: 2500000,
    riskLevel: 'high',
    crossBorder: true,
    activities: ['Networking', 'Investissements', 'Partenariats'],
  },
  {
    id: 'ent-002',
    name: 'Gabon Business Network Paris',
    sector: 'Services aux entreprises',
    location: {
      city: 'Paris',
      country: 'France',
      coordinates: { lat: 48.8566, lng: 2.3522 },
    },
    zone: 'Zone 1 : Paris IDF',
    members: 89,
    revenue: 1200000,
    riskLevel: 'medium',
    crossBorder: true,
    activities: ['Conseil', 'Formation', 'Mise en relation'],
  },
  {
    id: 'ent-003',
    name: 'Import-Export Gabon Services',
    sector: 'Commerce international',
    location: {
      city: 'Marseille',
      country: 'France',
      coordinates: { lat: 43.2965, lng: 5.3698 },
    },
    zone: 'Zone 4 : Sud-Est',
    members: 34,
    revenue: 4200000,
    riskLevel: 'high',
    crossBorder: true,
    activities: ['Import-Export', 'Logistique', 'Distribution'],
  },
];

export default function EnterprisesMapPage() {
  const profilesMapData = useQuery(api.functions.profile.getProfilesMapData);
  const [selectedEnterprises, setSelectedEnterprises] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedZone, setSelectedZone] = useState<string>('all');

  const filteredEnterprises = useMemo(() => {
    return enterprisesData.filter((enterprise) => {
      const matchesSearch =
        !searchTerm ||
        enterprise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enterprise.location.city.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSector =
        selectedSector === 'all' || enterprise.sector === selectedSector;
      const matchesZone = selectedZone === 'all' || enterprise.zone === selectedZone;
      return matchesSearch && matchesSector && matchesZone;
    });
  }, [searchTerm, selectedSector, selectedZone]);

  const handleSelectEnterprise = (id: string, checked: boolean) => {
    setSelectedEnterprises((prev) =>
      checked ? [...prev, id] : prev.filter((item) => item !== id),
    );
  };

  const handleExport = () => {
    if (selectedEnterprises.length === 0) {
      toast.error('Veuillez sélectionner au moins une entreprise');
      return;
    }
    toast.success(`${selectedEnterprises.length} entreprises exportées`);
  };

  const totalRevenue = filteredEnterprises.reduce((sum, e) => sum + e.revenue, 0);
  const crossBorderCount = filteredEnterprises.filter((e) => e.crossBorder).length;

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      <IntelAgentLayout
        title="Carte des Entreprises"
        description="Réseaux économiques gabonais - Surveillance des entités entrepreneuriales"
        currentPage="enterprises-map"
        backButton={false}
      >
        <div className="space-y-6">
          {/* Stats économiques */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'Entités économiques',
                value: filteredEnterprises.length,
                icon: Briefcase,
                color: 'blue',
              },
              {
                title: 'CA Total (M€)',
                value: Math.round(totalRevenue / 1000000),
                icon: DollarSign,
                color: 'green',
              },
              {
                title: 'Activité internationale',
                value: crossBorderCount,
                icon: Globe,
                color: 'orange',
              },
              {
                title: 'Sous surveillance',
                value: filteredEnterprises.filter((e) => e.riskLevel === 'high').length,
                icon: AlertTriangle,
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
                        background: `rgba(${
                          stat.color === 'blue'
                            ? '59, 130, 246'
                            : stat.color === 'green'
                              ? '16, 185, 129'
                              : stat.color === 'orange'
                                ? '245, 158, 11'
                                : '239, 68, 68'
                        }, 0.2)`,
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

          {/* Filtres */}
          <Card
            style={{
              background: 'var(--bg-glass-primary)',
              backdropFilter: 'blur(10px)',
              border: '1px solid var(--border-glass-primary)',
            }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtres et Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={selectedSector} onValueChange={setSelectedSector}>
                  <SelectTrigger>
                    <SelectValue placeholder="Secteur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous secteurs</SelectItem>
                    <SelectItem value="Réseautage professionnel">Réseautage</SelectItem>
                    <SelectItem value="Services aux entreprises">Services</SelectItem>
                    <SelectItem value="Commerce international">Commerce</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedZone} onValueChange={setSelectedZone}>
                  <SelectTrigger>
                    <SelectValue placeholder="Zone CGF" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes zones</SelectItem>
                    <SelectItem value="Zone 1 : Paris IDF">Zone 1 - Paris</SelectItem>
                    <SelectItem value="Zone 4 : Sud-Est">Zone 4 - Sud-Est</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedEnterprises.length > 0 && (
                <div
                  className="flex items-center gap-2 p-3 rounded-lg"
                  style={{ background: 'var(--bg-glass-light)' }}
                >
                  <span className="text-sm">
                    {selectedEnterprises.length} sélectionnées
                  </span>
                  <Button size="sm" onClick={handleExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Exporter
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Carte des entreprises */}
          <Card
            style={{
              background: 'var(--bg-glass-primary)',
              backdropFilter: 'blur(10px)',
              border: '1px solid var(--border-glass-primary)',
            }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Répartition Géographique
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SmartInteractiveMap profiles={profilesMapData} />
            </CardContent>
          </Card>

          {/* Liste des entreprises */}
          <Card
            style={{
              background: 'var(--bg-glass-primary)',
              backdropFilter: 'blur(10px)',
              border: '1px solid var(--border-glass-primary)',
            }}
          >
            <CardHeader>
              <CardTitle>Entreprises et Réseaux Économiques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredEnterprises.map((enterprise) => (
                  <div
                    key={enterprise.id}
                    className="flex items-start gap-4 p-4 rounded-lg cursor-pointer"
                    style={{
                      background: 'var(--bg-glass-light)',
                      border: '1px solid var(--border-glass-secondary)',
                    }}
                    onClick={() =>
                      toast.info(`${enterprise.name}`, 'Analyse économique détaillée')
                    }
                  >
                    <Checkbox
                      checked={selectedEnterprises.includes(enterprise.id)}
                      onCheckedChange={(checked) =>
                        handleSelectEnterprise(enterprise.id, checked as boolean)
                      }
                      onClick={(e) => e.stopPropagation()}
                    />

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3
                          className="font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {enterprise.name}
                        </h3>
                        <Badge
                          className={
                            enterprise.riskLevel === 'high'
                              ? 'bg-red-500/20 text-red-500'
                              : 'bg-yellow-500/20 text-yellow-500'
                          }
                        >
                          {enterprise.riskLevel === 'high'
                            ? 'Risque élevé'
                            : 'Surveillance'}
                        </Badge>
                        {enterprise.crossBorder && (
                          <Badge className="bg-purple-500/20 text-purple-500">
                            <Globe className="h-3 w-3 mr-1" />
                            International
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Secteur</p>
                          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                            {enterprise.sector}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Localisation</p>
                          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                            {enterprise.location.city} • {enterprise.zone}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Données économiques
                          </p>
                          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                            {enterprise.members} membres •{' '}
                            {(enterprise.revenue / 1000000).toFixed(1)}M€ CA
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1">
                        {enterprise.activities.map((activity, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {activity}
                          </Badge>
                        ))}
                      </div>
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
