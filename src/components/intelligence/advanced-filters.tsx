'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Shield,
  Users,
  Baby,
  UserCheck,
  Globe,
  ChevronDown,
  ChevronUp,
  X,
  RotateCcw,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProfileCategory, Gender, RequestStatus } from '@/convex/lib/constants';
import { cn } from '@/lib/utils';

// Types pour les filtres de renseignement
export interface IntelligenceFilters {
  // Recherche textuelle
  search?: string;
  searchIn?: ('name' | 'email' | 'phone' | 'address' | 'notes')[];

  // Catégories de base
  category?: ProfileCategory[];
  status?: RequestStatus[];
  gender?: Gender[];

  // Filtres d'âge avancés
  ageRange?: [number, number];
  ageGroups?: ('minor' | 'adult' | 'senior')[];
  minorOnly?: boolean;
  adultOnly?: boolean;

  // Nationalité et résidence
  nationality?: string[];
  dualNationality?: boolean;
  residenceCountry?: string[];
  birthCountry?: string[];

  // Localisation
  city?: string[];
  region?: string[];
  hasCoordinates?: boolean;

  // Surveillance et risque
  riskLevel?: ('low' | 'medium' | 'high' | 'critical')[];
  hasNotes?: boolean;
  notesCount?: { min?: number; max?: number };
  lastActivityDays?: number;
  surveillanceStatus?: ('active' | 'passive' | 'archived')[];

  // Données professionnelles
  hasEmployment?: boolean;
  employmentSector?: string[];
  hasSkills?: boolean;

  // Associations et relations
  hasAssociations?: boolean;
  associationType?: string[];
  hasRelations?: boolean;
  relationType?: ('family' | 'professional' | 'social')[];

  // Relations familiales
  hasChildren?: boolean;
  childrenCount?: { min?: number; max?: number };

  // Documents et validité
  hasValidDocuments?: boolean;
  documentExpiringSoon?: boolean;
  documentType?: ('passport' | 'id_card' | 'visa' | 'permit')[];

  // Dates et temporalité
  createdDateRange?: { start?: Date; end?: Date };
  lastUpdateRange?: { start?: Date; end?: Date };
  birthDateRange?: { start?: Date; end?: Date };

  // Indicateurs spéciaux
  flagged?: boolean;
  vip?: boolean;
  sensitive?: boolean;
  archived?: boolean;
}

interface AdvancedFiltersProps {
  filters: IntelligenceFilters;
  onFiltersChange: (filters: IntelligenceFilters) => void;
  totalProfiles?: number;
  className?: string;
}

export function AdvancedFilters({
  filters,
  onFiltersChange,
  totalProfiles = 0,
  className,
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Calculer le nombre de filtres actifs
  useEffect(() => {
    let count = 0;
    Object.entries(filters).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== '' &&
        (!Array.isArray(value) || value.length > 0)
      ) {
        count++;
      }
    });
    setActiveFiltersCount(count);
  }, [filters]);

  // Fonction pour mettre à jour un filtre
  const updateFilter = (key: keyof IntelligenceFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  // Fonction pour réinitialiser tous les filtres
  const resetFilters = () => {
    onFiltersChange({});
  };

  // Fonction pour calculer l'âge à partir de la date de naissance
  const calculateAge = (birthDate: Date | string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Fonction pour vérifier si une personne est mineure
  const isMinor = (birthDate: Date | string): boolean => {
    return calculateAge(birthDate) < 18;
  };

  // Fonction pour vérifier si une personne est adulte
  const isAdult = (birthDate: Date | string): boolean => {
    const age = calculateAge(birthDate);
    return age >= 18 && age < 60;
  };

  // Fonction pour vérifier si une personne est senior
  const isSenior = (birthDate: Date | string): boolean => {
    return calculateAge(birthDate) >= 60;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Barre de recherche principale */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, email, téléphone, adresse..."
            className="pl-10 pr-10"
            value={filters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value)}
          />
          {filters.search && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => updateFilter('search', '')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        <Button
          variant={isExpanded ? 'default' : 'outline'}
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtres avancés
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFiltersCount}
            </Badge>
          )}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>

        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Réinitialiser
          </Button>
        )}
      </div>

      {/* Options de recherche */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-muted-foreground">Rechercher dans:</span>
        {(['name', 'email', 'phone', 'address', 'notes'] as const).map((field) => (
          <Label key={field} className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={filters.searchIn?.includes(field) ?? true}
              onCheckedChange={(checked) => {
                const current = filters.searchIn || [
                  'name',
                  'email',
                  'phone',
                  'address',
                  'notes',
                ];
                if (checked) {
                  updateFilter('searchIn', [...current, field]);
                } else {
                  updateFilter(
                    'searchIn',
                    current.filter((f) => f !== field),
                  );
                }
              }}
            />
            <span className="text-sm capitalize">
              {field === 'name'
                ? 'Nom'
                : field === 'email'
                  ? 'Email'
                  : field === 'phone'
                    ? 'Téléphone'
                    : field === 'address'
                      ? 'Adresse'
                      : 'Notes'}
            </span>
          </Label>
        ))}
      </div>

      {/* Filtres avancés */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/50">
          {/* Section Démographie */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              Démographie
            </h3>

            {/* Genre */}
            <div className="space-y-2">
              <Label className="text-xs">Genre</Label>
              <div className="space-y-1">
                {Object.values(Gender).map((gender) => (
                  <Label key={gender} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={filters.gender?.includes(gender) ?? false}
                      onCheckedChange={(checked) => {
                        const current = filters.gender || [];
                        if (checked) {
                          updateFilter('gender', [...current, gender]);
                        } else {
                          updateFilter(
                            'gender',
                            current.filter((g) => g !== gender),
                          );
                        }
                      }}
                    />
                    <span className="text-sm">
                      {gender === Gender.MALE
                        ? '👨 Homme'
                        : gender === Gender.FEMALE
                          ? '👩 Femme'
                          : '⚧ Autre'}
                    </span>
                  </Label>
                ))}
              </div>
            </div>

            {/* Groupes d'âge */}
            <div className="space-y-2">
              <Label className="text-xs">Groupes d'âge</Label>
              <div className="space-y-1">
                <Label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={filters.minorOnly ?? false}
                    onCheckedChange={(checked) => updateFilter('minorOnly', checked)}
                  />
                  <span className="text-sm flex items-center gap-1">
                    <Baby className="h-3 w-3" />
                    Mineurs (&lt;18 ans)
                  </span>
                </Label>
                <Label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={filters.adultOnly ?? false}
                    onCheckedChange={(checked) => updateFilter('adultOnly', checked)}
                  />
                  <span className="text-sm flex items-center gap-1">
                    <UserCheck className="h-3 w-3" />
                    Adultes (18+ ans)
                  </span>
                </Label>
                <Label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={filters.ageGroups?.includes('senior') ?? false}
                    onCheckedChange={(checked) => {
                      const current = filters.ageGroups || [];
                      if (checked) {
                        updateFilter('ageGroups', [...current, 'senior']);
                      } else {
                        updateFilter(
                          'ageGroups',
                          current.filter((a) => a !== 'senior'),
                        );
                      }
                    }}
                  />
                  <span className="text-sm">Seniors (60+ ans)</span>
                </Label>
              </div>
            </div>

            {/* Tranche d'âge */}
            <div className="space-y-2">
              <Label className="text-xs">Tranche d'âge</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  className="w-20 h-8"
                  value={filters.ageRange?.[0] || ''}
                  onChange={(e) => {
                    const min = parseInt(e.target.value) || 0;
                    updateFilter('ageRange', [min, filters.ageRange?.[1] || 100]);
                  }}
                />
                <span className="text-xs">à</span>
                <Input
                  type="number"
                  placeholder="Max"
                  className="w-20 h-8"
                  value={filters.ageRange?.[1] || ''}
                  onChange={(e) => {
                    const max = parseInt(e.target.value) || 100;
                    updateFilter('ageRange', [filters.ageRange?.[0] || 0, max]);
                  }}
                />
                <span className="text-xs">ans</span>
              </div>
            </div>

            {/* Relations familiales */}
            <div className="space-y-2">
              <Label className="text-xs">Relations familiales</Label>
              <div className="space-y-1">
                <Label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={filters.hasChildren ?? false}
                    onCheckedChange={(checked) => updateFilter('hasChildren', checked)}
                  />
                  <span className="text-sm flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Parents d'enfants
                  </span>
                </Label>
              </div>
              {filters.hasChildren && (
                <div className="pl-6 space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Nombre d'enfants
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      className="w-16 h-7 text-xs"
                      value={filters.childrenCount?.min || ''}
                      onChange={(e) => {
                        const min = parseInt(e.target.value) || 0;
                        updateFilter('childrenCount', {
                          min,
                          max: filters.childrenCount?.max,
                        });
                      }}
                    />
                    <span className="text-xs">-</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      className="w-16 h-7 text-xs"
                      value={filters.childrenCount?.max || ''}
                      onChange={(e) => {
                        const max = parseInt(e.target.value) || 10;
                        updateFilter('childrenCount', {
                          min: filters.childrenCount?.min,
                          max,
                        });
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section Nationalité */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Nationalité
            </h3>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={filters.dualNationality ?? false}
                  onCheckedChange={(checked) => updateFilter('dualNationality', checked)}
                />
                <span className="text-sm">Double nationalité</span>
              </Label>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Nationalité principale</Label>
              <Select
                value={filters.nationality?.[0] || 'all'}
                onValueChange={(value) => {
                  updateFilter('nationality', value === 'all' ? undefined : [value]);
                }}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Toutes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="GA">🇬🇦 Gabonaise</SelectItem>
                  <SelectItem value="FR">🇫🇷 Française</SelectItem>
                  <SelectItem value="CM">🇨🇲 Camerounaise</SelectItem>
                  <SelectItem value="CG">🇨🇬 Congolaise</SelectItem>
                  <SelectItem value="SN">🇸🇳 Sénégalaise</SelectItem>
                  <SelectItem value="CI">🇨🇮 Ivoirienne</SelectItem>
                  <SelectItem value="OTHER">🌍 Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Pays de naissance</Label>
              <Select
                value={filters.birthCountry?.[0] || 'all'}
                onValueChange={(value) => {
                  updateFilter('birthCountry', value === 'all' ? undefined : [value]);
                }}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="GA">🇬🇦 Gabon</SelectItem>
                  <SelectItem value="FR">🇫🇷 France</SelectItem>
                  <SelectItem value="OTHER">🌍 Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Section Surveillance */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Surveillance & Risque
            </h3>

            {/* Niveau de risque */}
            <div className="space-y-2">
              <Label className="text-xs">Niveau de risque</Label>
              <div className="space-y-1">
                {(['low', 'medium', 'high', 'critical'] as const).map((level) => (
                  <Label key={level} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={filters.riskLevel?.includes(level) ?? false}
                      onCheckedChange={(checked) => {
                        const current = filters.riskLevel || [];
                        if (checked) {
                          updateFilter('riskLevel', [...current, level]);
                        } else {
                          updateFilter(
                            'riskLevel',
                            current.filter((r) => r !== level),
                          );
                        }
                      }}
                    />
                    <span className="text-sm flex items-center gap-1">
                      <div
                        className={cn(
                          'w-2 h-2 rounded-full',
                          level === 'low' && 'bg-green-500',
                          level === 'medium' && 'bg-yellow-500',
                          level === 'high' && 'bg-orange-500',
                          level === 'critical' && 'bg-red-500',
                        )}
                      />
                      {level === 'low'
                        ? 'Faible'
                        : level === 'medium'
                          ? 'Moyen'
                          : level === 'high'
                            ? 'Élevé'
                            : 'Critique'}
                    </span>
                  </Label>
                ))}
              </div>
            </div>

            {/* Statut de surveillance */}
            <div className="space-y-2">
              <Label className="text-xs">Statut</Label>
              <Select
                value={filters.surveillanceStatus?.[0] || 'all'}
                onValueChange={(value) => {
                  updateFilter(
                    'surveillanceStatus',
                    value === 'all'
                      ? undefined
                      : [value as 'active' | 'passive' | 'archived'],
                  );
                }}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="active">🔴 Surveillance active</SelectItem>
                  <SelectItem value="passive">🟡 Surveillance passive</SelectItem>
                  <SelectItem value="archived">⚫ Archivé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes de renseignement */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={filters.hasNotes ?? false}
                  onCheckedChange={(checked) => updateFilter('hasNotes', checked)}
                />
                <span className="text-sm">Avec notes de renseignement</span>
              </Label>
            </div>

            {/* Indicateurs spéciaux */}
            <div className="space-y-2">
              <Label className="text-xs">Indicateurs</Label>
              <div className="space-y-1">
                <Label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={filters.flagged ?? false}
                    onCheckedChange={(checked) => updateFilter('flagged', checked)}
                  />
                  <span className="text-sm flex items-center gap-1">
                    <Flag className="h-3 w-3 text-red-500" />
                    Signalé
                  </span>
                </Label>
                <Label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={filters.vip ?? false}
                    onCheckedChange={(checked) => updateFilter('vip', checked)}
                  />
                  <span className="text-sm">⭐ VIP</span>
                </Label>
                <Label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={filters.sensitive ?? false}
                    onCheckedChange={(checked) => updateFilter('sensitive', checked)}
                  />
                  <span className="text-sm">🔒 Sensible</span>
                </Label>
              </div>
            </div>
          </div>

          {/* Section Localisation */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Localisation
            </h3>

            <div className="space-y-2">
              <Label className="text-xs">Ville</Label>
              <Input
                placeholder="Paris, Lyon, Marseille..."
                className="h-8"
                value={filters.city?.join(', ') || ''}
                onChange={(e) => {
                  const cities = e.target.value
                    .split(',')
                    .map((c) => c.trim())
                    .filter(Boolean);
                  updateFilter('city', cities.length > 0 ? cities : undefined);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Région</Label>
              <Select
                value={filters.region?.[0] || 'all'}
                onValueChange={(value) => {
                  updateFilter('region', value === 'all' ? undefined : [value]);
                }}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Toutes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="idf">Île-de-France</SelectItem>
                  <SelectItem value="ara">Auvergne-Rhône-Alpes</SelectItem>
                  <SelectItem value="naq">Nouvelle-Aquitaine</SelectItem>
                  <SelectItem value="occ">Occitanie</SelectItem>
                  <SelectItem value="paca">PACA</SelectItem>
                  <SelectItem value="bzh">Bretagne</SelectItem>
                  <SelectItem value="hdf">Hauts-de-France</SelectItem>
                  <SelectItem value="est">Grand Est</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={filters.hasCoordinates ?? false}
                  onCheckedChange={(checked) => updateFilter('hasCoordinates', checked)}
                />
                <span className="text-sm">Géolocalisé (GPS)</span>
              </Label>
            </div>

            {/* Dernière activité */}
            <div className="space-y-2">
              <Label className="text-xs">Dernière activité</Label>
              <Select
                value={filters.lastActivityDays?.toString() || 'all'}
                onValueChange={(value) => {
                  updateFilter(
                    'lastActivityDays',
                    value === 'all' ? undefined : parseInt(value),
                  );
                }}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Toute période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toute période</SelectItem>
                  <SelectItem value="1">Aujourd'hui</SelectItem>
                  <SelectItem value="7">Cette semaine</SelectItem>
                  <SelectItem value="30">Ce mois</SelectItem>
                  <SelectItem value="90">3 derniers mois</SelectItem>
                  <SelectItem value="365">Cette année</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Résumé des filtres actifs */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Filtres actifs:</span>
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Recherche: "{filters.search}"
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter('search', '')}
              />
            </Badge>
          )}
          {filters.minorOnly && (
            <Badge variant="secondary" className="gap-1">
              Mineurs uniquement
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter('minorOnly', false)}
              />
            </Badge>
          )}
          {filters.adultOnly && (
            <Badge variant="secondary" className="gap-1">
              Adultes uniquement
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter('adultOnly', false)}
              />
            </Badge>
          )}
          {filters.dualNationality && (
            <Badge variant="secondary" className="gap-1">
              Double nationalité
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter('dualNationality', false)}
              />
            </Badge>
          )}
          {filters.hasNotes && (
            <Badge variant="secondary" className="gap-1">
              Avec notes
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter('hasNotes', false)}
              />
            </Badge>
          )}
          {filters.flagged && (
            <Badge variant="secondary" className="gap-1">
              Signalés
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter('flagged', false)}
              />
            </Badge>
          )}
          {filters.hasChildren && (
            <Badge variant="secondary" className="gap-1">
              Parents d'enfants
              {filters.childrenCount && (
                <span className="text-xs">
                  ({filters.childrenCount.min || 0}-{filters.childrenCount.max || '∞'})
                </span>
              )}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  updateFilter('hasChildren', false);
                  updateFilter('childrenCount', undefined);
                }}
              />
            </Badge>
          )}
          {filters.gender && filters.gender.length > 0 && (
            <Badge variant="secondary" className="gap-1">
              Genre: {filters.gender.length} sélection(s)
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter('gender', undefined)}
              />
            </Badge>
          )}
          {filters.riskLevel && filters.riskLevel.length > 0 && (
            <Badge variant="secondary" className="gap-1">
              Risque: {filters.riskLevel.join(', ')}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter('riskLevel', undefined)}
              />
            </Badge>
          )}
        </div>
      )}

      {/* Statistiques des résultats */}
      {totalProfiles > 0 && (
        <div className="text-sm text-muted-foreground">
          {activeFiltersCount > 0 ? (
            <span>
              {totalProfiles.toLocaleString()} profil(s) correspondent aux critères
            </span>
          ) : (
            <span>{totalProfiles.toLocaleString()} profil(s) au total</span>
          )}
        </div>
      )}
    </div>
  );
}
