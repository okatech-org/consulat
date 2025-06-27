'use client';

import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  ArrowLeft,
  X,
  LayoutGrid,
  LayoutList,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { getAvailableConsularServices } from '@/actions/services';
import { ServiceCategory } from '@prisma/client';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageContainer } from '@/components/layouts/page-container';
import CardContainer from '@/components/layouts/card-container';
import { MultiSelect } from '@/components/ui/multi-select';

type ConsularServiceWithOrganization = {
  id: string;
  name: string;
  description: string | null;
  category: ServiceCategory;
  isActive: boolean;
  organization?: {
    id: string;
    name: string;
    type: string;
  } | null;
  countryCode: string | null;
};

const UNAVAILABLE_MESSAGE = "Disponible à partir du 15 juillet 2025";

export default function AvailableServicesPage() {
  const t = useTranslations('services');
  const tInputs = useTranslations('inputs');
  const [availableServices, setAvailableServices] = useState<
    ConsularServiceWithOrganization[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  // Filters
  const [selectedCategories, setSelectedCategories] = useState<ServiceCategory[]>([]);
  const [selectedOrganizations, setSelectedOrganizations] = useState<string[]>([]);
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const services = await getAvailableConsularServices();
        const filteredServices = services?.filter(
          (service) => service.category !== ServiceCategory.REGISTRATION,
        );
        setAvailableServices(filteredServices || []);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get unique organizations from available services
  const getUniqueOrganizations = () => {
    const organizations = availableServices
      .filter((service) => service.organization)
      .map((service) => service.organization!);

    return Array.from(new Map(organizations.map((org) => [org.id, org])).values());
  };

  // Create options for MultiSelect components
  const getCategoryOptions = () => {
    return Object.values(ServiceCategory).map((category) => ({
      value: category,
      label: tInputs(`serviceCategory.options.${category}`),
    }));
  };

  const getOrganizationOptions = () => {
    const uniqueOrgs = getUniqueOrganizations();
    const orgOptions = uniqueOrgs.map((org) => ({
      value: org.id,
      label: org.name,
    }));
    
    // Add consulat option
    orgOptions.push({
      value: 'consulat',
      label: 'Services consulaires',
    });
    
    return orgOptions;
  };

  // Filter services based on search query and selected filters
  const getFilteredServices = () => {
    return availableServices.filter((service) => {
      // Search query filter
      const matchesSearch =
        !searchQuery.trim() ||
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (service.description &&
          service.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (service.organization &&
          service.organization.name.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category filter
      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(service.category);

      // Organization filter
      const matchesOrganization =
        selectedOrganizations.length === 0 ||
        (service.organization && selectedOrganizations.includes(service.organization.id));

      // Active filter
      const matchesActive = !showActiveOnly || service.isActive;

      return matchesSearch && matchesCategory && matchesOrganization && matchesActive;
    });
  };

  const filteredServices = getFilteredServices();

  // Group services by category
  const servicesByCategory = Object.values(ServiceCategory).reduce(
    (acc, category) => {
      acc[category] = filteredServices.filter((service) => service.category === category);
      return acc;
    },
    {} as Record<ServiceCategory, ConsularServiceWithOrganization[]>,
  );

  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedOrganizations([]);
    setShowActiveOnly(false);
    setSearchQuery('');
  };

  const areFiltersActive =
    selectedCategories.length > 0 ||
    selectedOrganizations.length > 0 ||
    showActiveOnly ||
    searchQuery.trim() !== '';

  return (
    <PageContainer
      title={'Services consulaires'}
      description={
        'Découvrez les services consulaires et démarrez une nouvelle demande.'
      }
      action={
        <div className="flex items-center space-x-2">
          <Link href={ROUTES.user.services}>
            <Button variant="outline" size="icon" aria-label="Retour aux services">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      }
    >

      {/* Search and filters section - condensed */}
      <div className="space-y-4">
        {/* Combined search and main filters */}
        <div className="bg-card rounded-lg border p-4 shadow-sm space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher un service par nom, description ou organisme..."
              className="pl-10 pr-4 py-2 text-sm focus:border-primary transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Rechercher des services"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                onClick={() => setSearchQuery('')}
                aria-label="Effacer la recherche"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Filters row - more compact */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* Mobile filters sheet */}
            <div className="flex gap-2 sm:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 text-xs">
                    <SlidersHorizontal className="h-3 w-3 mr-1" />
                    Filtres
                    {(selectedCategories.length > 0 || selectedOrganizations.length > 0) && (
                      <Badge variant="secondary" className="ml-1 px-1 py-0 text-xs bg-primary text-primary-foreground">
                        {selectedCategories.length + selectedOrganizations.length}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px]">
                  <SheetHeader className="pb-3">
                    <SheetTitle className="text-base">Filtres</SheetTitle>
                  </SheetHeader>
                  <ScrollArea className="h-[calc(100vh-100px)] pr-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-foreground">Catégories</h3>
                        <MultiSelect
                          type="multiple"
                          options={getCategoryOptions()}
                          selected={selectedCategories}
                          onChange={setSelectedCategories}
                          placeholder="Toutes les catégories"
                          searchPlaceholder="Rechercher..."
                          emptyText="Aucune catégorie trouvée"
                        />
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-foreground">Organismes</h3>
                        <MultiSelect
                          type="multiple"
                          options={getOrganizationOptions()}
                          selected={selectedOrganizations}
                          onChange={setSelectedOrganizations}
                          placeholder="Tous les organismes"
                          searchPlaceholder="Rechercher..."
                          emptyText="Aucun organisme trouvé"
                        />
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-foreground">Disponibilité</h3>
                        <Button
                          variant={showActiveOnly ? 'default' : 'outline'}
                          size="sm"
                          className="w-full justify-start h-8"
                          onClick={() => setShowActiveOnly(!showActiveOnly)}
                        >
                          <span>Services actifs uniquement</span>
                          {showActiveOnly && (
                            <div className="w-2 h-2 bg-success rounded-full ml-auto"></div>
                          )}
                        </Button>
                      </div>
                    </div>
                  </ScrollArea>
                  <div className="pt-3 border-t mt-3">
                    <Button variant="outline" size="sm" className="w-full h-8" onClick={resetFilters}>
                      Réinitialiser
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Quick active services toggle for mobile */}
              <Button
                variant={showActiveOnly ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowActiveOnly(!showActiveOnly)}
                className="h-8 text-xs"
                aria-label={showActiveOnly ? 'Afficher tous les services' : 'Afficher seulement les services actifs'}
              >
                Actifs
                <div className={`ml-1 w-2 h-2 rounded-full ${showActiveOnly ? 'bg-success' : 'bg-muted-foreground'}`}></div>
              </Button>

              {areFiltersActive && (
                <Button variant="outline" size="sm" onClick={resetFilters} className="h-8 text-xs">
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Desktop filters - more compact */}
            <div className="hidden sm:flex sm:gap-2 sm:items-center sm:flex-wrap w-full">
              <span className="text-xs text-muted-foreground">Filtres :</span>
              
              {/* Compact multiselects */}
              <div className="min-w-[160px] max-w-[200px]">
                <MultiSelect
                  type="multiple"
                  options={getCategoryOptions()}
                  selected={selectedCategories}
                  onChange={setSelectedCategories}
                  placeholder="Catégories"
                  searchPlaceholder="Rechercher..."
                  emptyText="Aucune catégorie trouvée"
                  className="text-xs h-8"
                />
              </div>

              <div className="min-w-[160px] max-w-[200px]">
                <MultiSelect
                  type="multiple"
                  options={getOrganizationOptions()}
                  selected={selectedOrganizations}
                  onChange={setSelectedOrganizations}
                  placeholder="Organismes"
                  searchPlaceholder="Rechercher..."
                  emptyText="Aucun organisme trouvé"
                  className="text-xs h-8"
                />
              </div>

              <Button
                variant={showActiveOnly ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowActiveOnly(!showActiveOnly)}
                className="h-8 text-xs"
                aria-label={showActiveOnly ? 'Afficher tous les services' : 'Afficher seulement les services actifs'}
              >
                <span className="hidden lg:inline">Actifs</span>
                <span className="lg:hidden">Actifs</span>
                <div className={`ml-1 w-2 h-2 rounded-full ${showActiveOnly ? 'bg-success' : 'bg-muted-foreground'}`}></div>
              </Button>

              {areFiltersActive && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={resetFilters}
                  className="ml-auto h-8 text-xs hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive"
                >
                  <X className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              )}

              {/* View toggle inline */}
              
            </div>
          </div>

          {/* Active filters tags - only show if any active, more compact */}
          {areFiltersActive && (
            <div className="flex flex-wrap gap-1 pt-2 border-t">
              {selectedCategories.map((category) => (
                <Badge key={category} variant="secondary" className="text-xs py-0 px-2 h-6 bg-primary-100 text-primary-700 border-primary-200">
                  <span className="truncate max-w-[100px]">
                    {tInputs(`serviceCategory.options.${category}`)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-3 w-3 ml-1 p-0 hover:bg-primary-300 rounded-full"
                    onClick={() => setSelectedCategories(selectedCategories.filter((c) => c !== category))}
                    aria-label={`Supprimer ${tInputs(`serviceCategory.options.${category}`)}`}
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </Badge>
              ))}

              {selectedOrganizations.map((orgId) => {
                const orgName = orgId === 'consulat' ? 'Services consulaires' : getUniqueOrganizations().find((org) => org.id === orgId)?.name || '';
                return (
                  <Badge key={orgId} variant="secondary" className="text-xs py-0 px-2 h-6 bg-secondary-100 text-secondary-700 border-secondary-200">
                    <span className="truncate max-w-[100px]">{orgName}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-3 w-3 ml-1 p-0 hover:bg-secondary-300 rounded-full"
                      onClick={() => setSelectedOrganizations(selectedOrganizations.filter((id) => id !== orgId))}
                      aria-label={`Supprimer ${orgName}`}
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </Badge>
                );
              })}

              {showActiveOnly && (
                <Badge variant="secondary" className="text-xs py-0 px-2 h-6 bg-success/5 text-success border-success/20">
                  <span>Actifs uniquement</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-3 w-3 ml-1 p-0 hover:bg-success/30 rounded-full"
                    onClick={() => setShowActiveOnly(false)}
                    aria-label="Supprimer le filtre actifs"
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </Badge>
              )}

              {searchQuery.trim() && (
                <Badge variant="secondary" className="text-xs py-0 px-2 h-6 bg-accent text-accent-foreground border-accent">
                  <span className="truncate max-w-[80px]">"{searchQuery}"</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-3 w-3 ml-1 p-0 hover:bg-accent/60 rounded-full"
                    onClick={() => setSearchQuery('')}
                    aria-label="Supprimer la recherche"
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Compact tabs with inline results summary */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <Tabs defaultValue="all">
          <TabsList className="w-full sm:w-auto bg-card border shadow-sm h-9">
            <TabsTrigger value="all" className="flex-1 sm:flex-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm h-7">
              Tous les services
              {!loading && (
                <Badge variant="secondary" className="ml-2 px-1.5 py-0 text-xs bg-muted text-muted-foreground h-4">
                  {filteredServices.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="by-category" className="flex-1 sm:flex-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm h-7">
              Par catégorie
            </TabsTrigger>
          </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Services content */}
      <div className="mt-8">
        <Tabs defaultValue="all" className="space-y-6">
          <TabsContent value="all" className="space-y-6">
            {loading ? (
              <div className="space-y-6">
                <div className="text-center py-4">
                  <div className="inline-flex items-center gap-2 text-muted-foreground">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span>Chargement des services...</span>
                  </div>
                </div>
                <div
                  className={`grid gap-6 ${view === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}
                >
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="overflow-hidden border-2">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <Skeleton className="h-5 w-40" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                          <Skeleton className="h-5 w-16 rounded-full" />
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-4/5" />
                      </CardContent>
                      <CardFooter>
                        <Skeleton className="h-10 w-full" />
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            ) : filteredServices.length > 0 ? (
              <div className="space-y-6">
                {/* Results summary */}
                <div className="flex items-center justify-between bg-primary-50 rounded-lg p-4 border border-primary-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 rounded-full">
                      <Search className="h-4 w-4 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-primary-900">
                        {filteredServices.length} service{filteredServices.length > 1 ? 's' : ''} trouvé{filteredServices.length > 1 ? 's' : ''}
                      </h3>
                      <p className="text-sm text-primary-600">
                        {filteredServices.filter(s => s.isActive).length} actuellement disponible{filteredServices.filter(s => s.isActive).length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  
                </div>

                {view === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredServices.map((service) => (
                      <CardContainer
                        key={service.id}
                        className={`h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border-2 ${
                          service.isActive ? 'hover:border-success/50' : 'hover:border-warning/50'
                        }`}
                        title={
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-lg leading-tight line-clamp-2">{service.name}</h3>
                            <Badge 
                              variant={service.isActive ? 'default' : 'secondary'} 
                              className={`flex-shrink-0 ${
                                service.isActive 
                                  ? 'bg-success/5 text-success border-success/20' 
                                  : 'bg-warning/5 text-warning border-warning/20'
                              }`}
                            >
                              {service.isActive ? 'Actif' : 'Bientôt disponible'}
                            </Badge>
                          </div>
                        }
                        subtitle={
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <div className="w-1 h-4 bg-primary rounded-full flex-shrink-0"></div>
                            <span className="text-sm">
                              {service.organization?.name || t('availableServices.consulateService')}
                            </span>
                          </div>
                        }
                        footerContent={
                          <div className="w-full space-y-3">
                            <Button 
                              className={`w-full text-base font-medium py-3 transition-all duration-200 ${
                                service.isActive 
                                  ? 'bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg' 
                                  : 'opacity-60 cursor-not-allowed bg-muted text-muted-foreground hover:bg-muted'
                              }`}
                              asChild={service.isActive}
                              disabled={!service.isActive}
                              size="lg"
                            >
                              {service.isActive ? (
                                <Link href={ROUTES.user.service_submit(service.id)} className="flex items-center justify-center gap-2">
                                  <Plus className="h-5 w-5" />
                                  <span>{t('actions.startProcess')}</span>
                                </Link>
                              ) : (
                                <span className="flex items-center justify-center gap-2">
                                  <Plus className="h-5 w-5" />
                                  <span>{t('actions.startProcess')}</span>
                                </span>
                              )}
                            </Button>
                            {!service.isActive && (
                              <p className="text-xs text-center opacity-60 font-medium">
                                {UNAVAILABLE_MESSAGE}
                              </p>
                            )}
                          </div>
                        }
                      >
                        <div className="space-y-3">
                          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                            {service.description || 'Description non disponible'}
                          </p>
                        </div>
                      </CardContainer>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredServices.map((service) => (
                      <div
                        key={service.id}
                        className={`bg-card border-2 rounded-lg p-6 transition-all duration-200 hover:shadow-md ${
                          service.isActive ? 'hover:border-success/50' : 'hover:border-warning/50'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row gap-4">
                          <div className="flex-1 space-y-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="space-y-2">
                                <h3 className="text-xl font-semibold text-foreground">{service.name}</h3>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-2">
                                    <div className="w-1 h-4 bg-primary rounded-full"></div>
                                    <span>{service.organization?.name || t('availableServices.consulateService')}</span>
                                  </div>
                                </div>
                              </div>
                              <Badge 
                                variant={service.isActive ? 'default' : 'secondary'}
                                className={`flex-shrink-0 ${
                                  service.isActive 
                                    ? 'bg-success/5 text-success border-success/20' 
                                    : 'bg-warning/5 text-warning border-warning/20'
                                }`}
                              >
                                {service.isActive ? 'Disponible' : 'Prochainement'}
                              </Badge>
                            </div>
                            {service.description && (
                              <p className="text-muted-foreground leading-relaxed line-clamp-2">
                                {service.description}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-center justify-center gap-3 lg:w-48">
                            <Button 
                              className={`w-full text-base font-medium py-3 transition-all duration-200 ${
                                service.isActive 
                                  ? 'bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg' 
                                  : 'opacity-60 cursor-not-allowed bg-muted text-muted-foreground hover:bg-muted'
                              }`}
                              asChild={service.isActive}
                              disabled={!service.isActive}
                              size="lg"
                            >
                              {service.isActive ? (
                                <Link href={ROUTES.user.new_service_request(service.id)} className="flex items-center justify-center gap-2">
                                  <Plus className="h-5 w-5" />
                                  <span>{t('actions.startProcess')}</span>
                                </Link>
                              ) : (
                                <span className="flex items-center justify-center gap-2">
                                  <Plus className="h-5 w-5" />
                                  <span>{t('actions.startProcess')}</span>
                                </span>
                              )}
                            </Button>
                            {!service.isActive && (
                              <div className="bg-warning/5 border border-warning/20 rounded-md p-2 w-full">
                                <p className="text-xs text-warning text-center font-medium">
                                  {UNAVAILABLE_MESSAGE}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16 bg-muted/30 rounded-lg border-2 border-dashed border-muted">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="p-4 bg-card rounded-full w-fit mx-auto border border-muted">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {areFiltersActive ? 'Aucun service trouvé' : 'Aucun service disponible'}
                    </h3>
                    <p className="text-muted-foreground">
                      {areFiltersActive
                        ? 'Aucun service ne correspond à vos critères de recherche. Essayez de modifier vos filtres.'
                        : t('availableServices.empty')}
                    </p>
                  </div>
                  {areFiltersActive && (
                    <div className="space-y-3">
                      <Button onClick={resetFilters} className="bg-primary hover:bg-primary/90">
                        <X className="mr-2 h-4 w-4" />
                        Réinitialiser les filtres
                      </Button>
                      <p className="text-sm text-muted-foreground">
                        ou <Link href={ROUTES.user.services} className="text-primary hover:underline font-medium">retourner aux services</Link>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="by-category">
            <ScrollArea className="h-[600px] pr-4">
              {loading ? (
                <div className="space-y-8">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-4">
                      <Skeleton className="h-7 w-48" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.values(servicesByCategory).map(
                    (services) =>
                      services.length > 0 &&
                      services[0]?.category && (
                        <div key={services[0].category} className="space-y-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-1 h-6 bg-primary rounded-full"></div>
                              <h2 className="text-2xl font-bold text-foreground">
                                {tInputs(`serviceCategory.options.${services[0].category}`)}
                              </h2>
                            </div>
                            <Badge className="bg-primary/10 text-primary border-primary/20" variant="outline">
                              {services.length} service{services.length > 1 ? 's' : ''}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {services.map((service) => (
                              <CardContainer
                                key={service.id}
                                className={`h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border-2 ${
                                  service.isActive ? 'hover:border-success/50' : 'hover:border-warning/50'
                                }`}
                                title={
                                  <div className="flex items-start justify-between gap-2">
                                    <h3 className="font-semibold text-lg leading-tight line-clamp-2">{service.name}</h3>
                                    <Badge 
                                      variant={service.isActive ? 'default' : 'secondary'} 
                                      className={`flex-shrink-0 ${
                                        service.isActive 
                                          ? 'bg-success/5 text-success border-success/20' 
                                          : 'bg-warning/5 text-warning border-warning/20'
                                      }`}
                                    >
                                      {service.isActive ? 'Actif' : 'Bientôt'}
                                    </Badge>
                                  </div>
                                }
                                subtitle={
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <div className="w-1 h-4 bg-primary rounded-full flex-shrink-0"></div>
                                    <span className="text-sm">
                                      {service.organization?.name || t('availableServices.consulateService')}
                                    </span>
                                  </div>
                                }
                                footerContent={
                                  <div className="w-full space-y-3">
                                    <Button 
                                      className={`w-full text-base font-medium py-3 transition-all duration-200 ${
                                        service.isActive 
                                          ? 'bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg' 
                                          : 'opacity-60 cursor-not-allowed bg-muted text-muted-foreground hover:bg-muted'
                                      }`}
                                      asChild={service.isActive}
                                      disabled={!service.isActive}
                                      size="lg"
                                    >
                                      {service.isActive ? (
                                        <Link href={ROUTES.user.new_service_request(service.id)} className="flex items-center justify-center gap-2">
                                          <Plus className="h-5 w-5" />
                                          <span>{t('actions.startProcess')}</span>
                                        </Link>
                                      ) : (
                                        <span className="flex items-center justify-center gap-2">
                                          <Plus className="h-5 w-5" />
                                          <span>{t('actions.startProcess')}</span>
                                        </span>
                                      )}
                                    </Button>
                                    {!service.isActive && (
                                      <div className="bg-warning/5 border border-warning/20 rounded-md p-3">
                                        <p className="text-xs text-warning text-center font-medium">
                                          {UNAVAILABLE_MESSAGE}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                }
                              >
                                <div className="space-y-3">
                                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                                    {service.description || 'Description non disponible'}
                                  </p>
                                </div>
                              </CardContainer>
                            ))}
                          </div>
                        </div>
                      ),
                  )}

                  {Object.values(servicesByCategory).every(
                    (services) => services.length === 0,
                  ) && (
                    <div className="text-center py-16 bg-muted/30 rounded-lg border-2 border-dashed border-muted">
                      <div className="max-w-md mx-auto space-y-4">
                        <div className="p-4 bg-card rounded-full w-fit mx-auto border border-muted">
                          <Search className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold text-foreground">
                            {areFiltersActive ? 'Aucun service trouvé' : 'Aucun service disponible'}
                          </h3>
                          <p className="text-muted-foreground">
                            {areFiltersActive
                              ? 'Aucun service ne correspond à vos critères de recherche. Essayez de modifier vos filtres.'
                              : t('availableServices.empty')}
                          </p>
                        </div>
                        {areFiltersActive && (
                          <div className="space-y-3">
                            <Button onClick={resetFilters} className="bg-primary hover:bg-primary/90">
                              <X className="mr-2 h-4 w-4" />
                              Réinitialiser les filtres
                            </Button>
                            <p className="text-sm text-muted-foreground">
                              ou <Link href={ROUTES.user.services} className="text-primary hover:underline font-medium">retourner aux services</Link>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}

