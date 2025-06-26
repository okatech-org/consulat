'use client';

import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  ArrowLeft,
  X,
  LayoutGrid,
  LayoutList,
  SlidersHorizontal,
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { getAvailableConsularServices } from '@/actions/services';
import { ServiceCategory } from '@prisma/client';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { cn } from '@/lib/utils';
import CardContainer from '@/components/layouts/card-container';

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

      return matchesSearch && matchesCategory && matchesOrganization;
    });
  };

  const filteredServices = getFilteredServices();
  const uniqueOrganizations = getUniqueOrganizations();

  // Group services by category
  const servicesByCategory = Object.values(ServiceCategory).reduce(
    (acc, category) => {
      acc[category] = filteredServices.filter((service) => service.category === category);
      return acc;
    },
    {} as Record<ServiceCategory, ConsularServiceWithOrganization[]>,
  );

  const handleCategorySelect = (category: ServiceCategory) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleOrganizationSelect = (organizationId: string) => {
    if (selectedOrganizations.includes(organizationId)) {
      setSelectedOrganizations(
        selectedOrganizations.filter((id) => id !== organizationId),
      );
    } else {
      setSelectedOrganizations([...selectedOrganizations, organizationId]);
    }
  };

  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedOrganizations([]);
    setSearchQuery('');
  };

  const areFiltersActive =
    selectedCategories.length > 0 ||
    selectedOrganizations.length > 0 ||
    searchQuery.trim() !== '';

  return (
    <PageContainer
      title={'Services consulaires disponibles'}
      description={
        'Découvrez les services consulaires disponibles et démarrez une nouvelle demande.'
      }
      action={
        <div className="flex space-x-2">
          <Link href={ROUTES.user.services}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      }
    >
      {/* Search and filters bar */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher un service..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex space-x-2">
          {/* Category filter dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="mobile"
                leftIcon={<Filter className="h-4 w-4" />}
              >
                <span>Catégories</span>
                {selectedCategories.length > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1 rounded-full">
                    {selectedCategories.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filtrer par catégorie</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.values(ServiceCategory).map((category) => (
                <DropdownMenuCheckboxItem
                  key={`category-${category}`}
                  checked={selectedCategories.includes(category as ServiceCategory)}
                  onCheckedChange={() =>
                    handleCategorySelect(category as ServiceCategory)
                  }
                >
                  {tInputs(`serviceCategory.options.${category}`)}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Organization filter dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="mobile"
                leftIcon={<Filter className="h-4 w-4" />}
              >
                <span>Organismes</span>
                {selectedOrganizations.length > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1 rounded-full">
                    {selectedOrganizations.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filtrer par organisme</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {uniqueOrganizations.map((org) => (
                <DropdownMenuCheckboxItem
                  key={org.id}
                  checked={selectedOrganizations.includes(org.id)}
                  onCheckedChange={() => handleOrganizationSelect(org.id)}
                >
                  {org.name}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuCheckboxItem
                checked={selectedOrganizations.includes('consulat')}
                onCheckedChange={() => handleOrganizationSelect('consulat')}
              >
                Services consulaires
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile filters sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="sm:hidden">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filtres
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Filtres</SheetTitle>
              </SheetHeader>
              <div className="py-4 space-y-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Catégories</h3>
                  <div className="space-y-1.5">
                    {Object.values(ServiceCategory).map((category) => (
                      <Button
                        key={category}
                        variant={
                          selectedCategories.includes(category as ServiceCategory)
                            ? 'default'
                            : 'outline'
                        }
                        className="w-full justify-start"
                        onClick={() => handleCategorySelect(category as ServiceCategory)}
                      >
                        {tInputs(`serviceCategory.options.${category}`)}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Organismes</h3>
                  <div className="space-y-1.5">
                    {uniqueOrganizations.map((org) => (
                      <Button
                        key={org.id}
                        variant={
                          selectedOrganizations.includes(org.id) ? 'default' : 'outline'
                        }
                        className="w-full justify-start"
                        onClick={() => handleOrganizationSelect(org.id)}
                      >
                        {org.name}
                      </Button>
                    ))}
                    <Button
                      variant={
                        selectedOrganizations.includes('consulat') ? 'default' : 'outline'
                      }
                      className="w-full justify-start"
                      onClick={() => handleOrganizationSelect('consulat')}
                    >
                      Services consulaires
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={resetFilters}>
                  Réinitialiser
                </Button>
                <Button className="flex-1">Appliquer</Button>
              </div>
            </SheetContent>
          </Sheet>

          {/* View toggle */}
          <div className="hidden sm:flex border rounded-md">
            <Button
              variant={view === 'grid' ? 'default' : 'ghost'}
              size="icon"
              className="rounded-r-none"
              onClick={() => setView('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="sr-only">Vue grille</span>
            </Button>
            <Button
              variant={view === 'list' ? 'default' : 'ghost'}
              size="icon"
              className="rounded-l-none"
              onClick={() => setView('list')}
            >
              <LayoutList className="h-4 w-4" />
              <span className="sr-only">Vue liste</span>
            </Button>
          </div>

          {/* Reset filters button */}
          {areFiltersActive && (
            <Button variant="outline" onClick={resetFilters}>
              <X className="h-4 w-4 mr-1" />
              Réinitialiser
            </Button>
          )}
        </div>
      </div>

      {/* Filter tags */}
      {areFiltersActive && (
        <div className="flex flex-wrap gap-2">
          {selectedCategories.map((category) => (
            <Badge key={category} variant="secondary" className="py-1 px-2">
              {tInputs(`serviceCategory.options.${category}`)}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 p-0"
                onClick={() => handleCategorySelect(category)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Supprimer</span>
              </Button>
            </Badge>
          ))}

          {selectedOrganizations.map((orgId) => {
            const orgName =
              orgId === 'consulat'
                ? 'Services consulaires'
                : uniqueOrganizations.find((org) => org.id === orgId)?.name || '';

            return (
              <Badge key={orgId} variant="secondary" className="py-1 px-2">
                {orgName}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1 p-0"
                  onClick={() => handleOrganizationSelect(orgId)}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Supprimer</span>
                </Button>
              </Badge>
            );
          })}

          {searchQuery.trim() && (
            <Badge variant="secondary" className="py-1 px-2">
              Recherche: {searchQuery}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 p-0"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Supprimer</span>
              </Button>
            </Badge>
          )}
        </div>
      )}

      {/* Services content */}
      <Tabs defaultValue="all" className="mt-6">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Tous les services</TabsTrigger>
          <TabsTrigger value="by-category">Par catégorie</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {loading ? (
            <div
              className={`grid gap-4 ${view === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}
            >
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-8 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-24 mt-1" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-9 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : filteredServices.length > 0 ? (
            view === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredServices.map((service) => {
                  return (
                    <CardContainer
                      key={service.id}
                      className="h-full hover:shadow-md transition-shadow"
                      title={
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span>{service.name}</span>
                          </div>
                        </div>
                      }
                      subtitle={
                        service.organization?.name ||
                        t('availableServices.consulateService')
                      }
                      footerContent={
                        <div className="w-full space-y-2">
                          <Button 
                            variant="secondary" 
                            className={`w-full ${!service.isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                            asChild={service.isActive}
                            disabled={!service.isActive}
                          >
                            {service.isActive ? (
                              <Link href={ROUTES.user.service_submit(service.id)}>
                                <Plus className="size-icon" />
                                {t('actions.startProcess')}
                              </Link>
                            ) : (
                              <>
                                <Plus className="size-icon" />
                                {t('actions.startProcess')}
                              </>
                            )}
                          </Button>
                          {!service.isActive && (
                            <p className="text-xs text-muted-foreground text-center">
                              {UNAVAILABLE_MESSAGE}
                            </p>
                          )}
                        </div>
                      }
                    >
                      <p className="text-sm">
                        {service.description?.slice(0, 200) + '...'}
                      </p>
                    </CardContainer>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredServices.map((service) => {
                  return (
                    <div
                      key={service.id}
                      className="flex flex-col sm:flex-row justify-between border rounded-md p-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="space-y-1 mb-4 sm:mb-0">
                        <div className="flex items-center">
                          <h3 className="font-medium">{service.name}</h3>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-y-1 sm:gap-x-4 text-sm text-muted-foreground">
                          <span>
                            {service.organization?.name ||
                              t('availableServices.consulateService')}
                          </span>
                          
                        </div>
                        {service.description && (
                          <p className="text-sm max-w-prose">{service.description.slice(0, 200) + '...'}</p>
                        )}
                      </div>
                      <div className="flex-shrink-0 flex flex-col items-center space-y-2">
                        <Button 
                          className={`${!service.isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                          asChild={service.isActive}
                          disabled={!service.isActive}
                        >
                          {service.isActive ? (
                            <Link href={ROUTES.user.new_service_request(service.id)}>
                              <Plus className="mr-2 h-4 w-4" />
                              {t('actions.startProcess')}
                            </Link>
                          ) : (
                            <>
                              <Plus className="mr-2 h-4 w-4" />
                              {t('actions.startProcess')}
                            </>
                          )}
                        </Button>
                        {!service.isActive && (
                          <p className="text-xs text-muted-foreground text-center">
                            {UNAVAILABLE_MESSAGE}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            <div className="text-center py-12 border rounded-lg bg-background">
              <p className="text-muted-foreground mb-4">
                {areFiltersActive
                  ? 'Aucun service ne correspond à vos critères de recherche'
                  : t('availableServices.empty')}
              </p>
              {areFiltersActive && (
                <Button onClick={resetFilters}>
                  <X className="mr-2 h-4 w-4" />
                  Réinitialiser les filtres
                </Button>
              )}
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
                      <div key={services[0].category} className="space-y-4">
                        <div className="flex items-center">
                          <h2 className="text-xl font-semibold">
                            {tInputs(`serviceCategory.options.${services[0].category}`)}
                          </h2>
                          <Badge className="ml-2" variant="outline">
                            {services.length}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {services.map((service) => (
                            <CardContainer
                              key={service.id}
                              className="h-full hover:shadow-md transition-shadow"
                              title={service.name}
                              subtitle={
                                service.organization?.name ||
                                t('availableServices.consulateService')
                              }
                              footerContent={
                                <div className="w-full space-y-2">
                                  <Button 
                                    className={`w-full ${!service.isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    asChild={service.isActive}
                                    disabled={!service.isActive}
                                  >
                                    {service.isActive ? (
                                      <Link href={ROUTES.user.new_service_request(service.id)}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        {t('actions.startProcess')}
                                      </Link>
                                    ) : (
                                      <>
                                        <Plus className="mr-2 h-4 w-4" />
                                        {t('actions.startProcess')}
                                      </>
                                    )}
                                  </Button>
                                  {!service.isActive && (
                                    <p className="text-xs text-muted-foreground text-center">
                                      {UNAVAILABLE_MESSAGE}
                                    </p>
                                  )}
                                </div>
                              }
                            >
                              <p className="text-sm">
                                {service.description?.slice(0, 200) + '...'}
                              </p>
                            </CardContainer>
                          ))}
                        </div>
                      </div>
                    ),
                )}

                {Object.values(servicesByCategory).every(
                  (services) => services.length === 0,
                ) && (
                  <div className="text-center py-12 border rounded-lg bg-background">
                    <p className="text-muted-foreground mb-4">
                      {areFiltersActive
                        ? 'Aucun service ne correspond à vos critères de recherche'
                        : t('availableServices.empty')}
                    </p>
                    {areFiltersActive && (
                      <Button onClick={resetFilters}>
                        <X className="mr-2 h-4 w-4" />
                        Réinitialiser les filtres
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
