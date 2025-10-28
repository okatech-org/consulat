'use client';

import { useState, useMemo } from 'react';
import IntelAgentLayout from '@/components/layouts/intel-agent-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Route,
  Search,
  Filter,
  Users,
  ArrowRight,
  Plane,
  TrendingUp,
} from 'lucide-react';

// Données des mouvements migratoires
const movementsData = [
  {
    id: 'mov-001',
    type: 'Retour temporaire Gabon',
    origin: { city: 'Paris', coordinates: { lat: 48.8566, lng: 2.3522 } },
    destination: { city: 'Libreville', coordinates: { lat: 0.4162, lng: 9.4673 } },
    period: '2024-12',
    travelers: 145,
    reason: "Vacances de fin d'année",
    riskLevel: 'low',
  },
  {
    id: 'mov-002',
    type: 'Migration inter-villes',
    origin: { city: 'Lyon', coordinates: { lat: 45.764, lng: 4.8357 } },
    destination: { city: 'Paris', coordinates: { lat: 48.8566, lng: 2.3522 } },
    period: '2024-Q4',
    travelers: 67,
    reason: 'Opportunités professionnelles',
    riskLevel: 'medium',
  },
  {
    id: 'mov-003',
    type: 'Rassemblement événementiel',
    origin: { city: 'Multiple', coordinates: { lat: 46.2276, lng: 2.2137 } },
    destination: { city: 'Bordeaux', coordinates: { lat: 44.8378, lng: -0.5792 } },
    period: '2024-11',
    travelers: 234,
    reason: 'Festival culturel gabonais',
    riskLevel: 'medium',
  },
];

export default function MovementsMapPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');

  const filteredMovements = useMemo(() => {
    return movementsData.filter((movement) => {
      const matchesSearch =
        !searchTerm ||
        movement.origin.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movement.destination.city.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || movement.type === selectedType;
      const matchesPeriod =
        selectedPeriod === 'all' || movement.period.includes(selectedPeriod);
      return matchesSearch && matchesType && matchesPeriod;
    });
  }, [searchTerm, selectedType, selectedPeriod]);

  const totalTravelers = filteredMovements.reduce((sum, m) => sum + m.travelers, 0);
  const internationalMovements = filteredMovements.filter(
    (m) => m.destination.city === 'Libreville' || m.destination.city === 'Port-Gentil',
  ).length;

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      <IntelAgentLayout
        title="Carte des Déplacements"
        description="Analyse des mouvements migratoires de la communauté gabonaise"
        currentPage="movements-map"
        backButton={false}
      >
        <div className="space-y-6">
          {/* Stats des mouvements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'Mouvements tracés',
                value: filteredMovements.length,
                icon: Route,
                color: 'blue',
              },
              {
                title: 'Voyageurs estimés',
                value: totalTravelers,
                icon: Users,
                color: 'green',
              },
              {
                title: 'Vers le Gabon',
                value: internationalMovements,
                icon: Plane,
                color: 'orange',
              },
              {
                title: 'En surveillance',
                value: filteredMovements.filter((m) => m.riskLevel !== 'low').length,
                icon: TrendingUp,
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
                Filtres Temporels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher ville, raison..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type de mouvement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous types</SelectItem>
                    <SelectItem value="Retour temporaire Gabon">Retours Gabon</SelectItem>
                    <SelectItem value="Migration inter-villes">Inter-villes</SelectItem>
                    <SelectItem value="Rassemblement événementiel">Événements</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Période" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes périodes</SelectItem>
                    <SelectItem value="2024-Q4">Q4 2024</SelectItem>
                    <SelectItem value="2024-12">Décembre 2024</SelectItem>
                    <SelectItem value="2024-11">Novembre 2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Visualisation des flux */}
          <Card
            style={{
              background: 'var(--bg-glass-primary)',
              backdropFilter: 'blur(10px)',
              border: '1px solid var(--border-glass-primary)',
            }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Route className="h-5 w-5" />
                Flux Migratoires Visualisés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="h-[400px] relative"
                style={{ background: 'var(--bg-glass-light)', borderRadius: '0.5rem' }}
              >
                <svg className="w-full h-full" viewBox="0 0 800 400">
                  {/* Villes principales */}
                  {[
                    { name: 'Paris', x: 400, y: 150, size: 'large' },
                    { name: 'Lyon', x: 450, y: 200, size: 'medium' },
                    { name: 'Bordeaux', x: 350, y: 250, size: 'medium' },
                    { name: 'Libreville', x: 200, y: 300, size: 'large', isGabon: true },
                  ].map((city) => (
                    <g key={city.name}>
                      <circle
                        cx={city.x}
                        cy={city.y}
                        r={city.size === 'large' ? 12 : 8}
                        fill={city.isGabon ? '#ef4444' : '#3b82f6'}
                        opacity={0.8}
                      />
                      <text
                        x={city.x}
                        y={city.y - 20}
                        textAnchor="middle"
                        fontSize="11"
                        fill="var(--text-primary)"
                        fontWeight="500"
                      >
                        {city.name}
                      </text>
                    </g>
                  ))}

                  {/* Flèches de flux */}
                  {[
                    {
                      from: { x: 400, y: 150 },
                      to: { x: 200, y: 300 },
                      color: '#ef4444',
                      width: 4,
                    },
                    {
                      from: { x: 450, y: 200 },
                      to: { x: 400, y: 150 },
                      color: '#f59e0b',
                      width: 3,
                    },
                    {
                      from: { x: 350, y: 250 },
                      to: { x: 450, y: 200 },
                      color: '#10b981',
                      width: 2,
                    },
                  ].map((flow, index) => (
                    <g key={index}>
                      <defs>
                        <marker
                          id={`arrow-${index}`}
                          markerWidth="10"
                          markerHeight="7"
                          refX="9"
                          refY="3.5"
                          orient="auto"
                        >
                          <polygon points="0 0, 10 3.5, 0 7" fill={flow.color} />
                        </marker>
                      </defs>
                      <line
                        x1={flow.from.x}
                        y1={flow.from.y}
                        x2={flow.to.x}
                        y2={flow.to.y}
                        stroke={flow.color}
                        strokeWidth={flow.width}
                        markerEnd={`url(#arrow-${index})`}
                        opacity={0.7}
                      />
                    </g>
                  ))}
                </svg>
              </div>
            </CardContent>
          </Card>

          {/* Timeline des mouvements */}
          <Card
            style={{
              background: 'var(--bg-glass-primary)',
              backdropFilter: 'blur(10px)',
              border: '1px solid var(--border-glass-primary)',
            }}
          >
            <CardHeader>
              <CardTitle>Timeline des Mouvements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredMovements.map((movement) => (
                  <div
                    key={movement.id}
                    className="flex items-center gap-4 p-4 rounded-lg"
                    style={{
                      background: 'var(--bg-glass-light)',
                      border: '1px solid var(--border-glass-secondary)',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          background:
                            movement.riskLevel === 'high'
                              ? '#ef4444'
                              : movement.riskLevel === 'medium'
                                ? '#f59e0b'
                                : '#10b981',
                        }}
                      />
                      <span
                        className="text-xs font-mono"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {movement.period}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-1">
                      <div
                        className="text-sm font-medium"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {movement.origin.city}
                      </div>
                      <ArrowRight
                        className="h-4 w-4"
                        style={{ color: 'var(--accent-intel)' }}
                      />
                      <div
                        className="text-sm font-medium"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {movement.destination.city}
                      </div>
                    </div>

                    <div className="text-center">
                      <div
                        className="text-sm font-bold"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {movement.travelers}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        voyageurs
                      </div>
                    </div>

                    <div
                      className="text-xs max-w-xs"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {movement.reason}
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
