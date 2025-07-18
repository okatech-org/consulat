'use client';

import { useTranslations } from 'next-intl';
import { Plus, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ServiceCategory } from '@prisma/client';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageContainer } from '@/components/layouts/page-container';
import { useTableSearchParams, type Sorting } from '@/hooks/use-table-search-params';
import { api } from '@/trpc/react';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { useEffect } from 'react';
import CardContainer from '@/components/layouts/card-container';

// Types pour les filtres des services
type ServiceFilters = {
  search?: string;
  category?: ServiceCategory;
  isActive?: boolean;
  organizationId?: string;
};

// Type pour le tri
type ServiceSorting = Sorting<{
  name: string;
  createdAt: Date;
  category: ServiceCategory;
  isActive: boolean;
}>;

// Adapter les paramètres URL pour les filtres
function adaptSearchParams(searchParams: URLSearchParams): ServiceFilters {
  return {
    search: searchParams.get('search') || undefined,
    category: (searchParams.get('category') as ServiceCategory) || undefined,
    isActive: searchParams.get('isActive')
      ? searchParams.get('isActive') === 'true'
      : undefined,
    organizationId: searchParams.get('organizationId') || undefined,
  };
}

export default function AvailableServicesPage() {
  const t = useTranslations('services');
  const tInputs = useTranslations('inputs');

  // Hook pour gérer les paramètres URL et la pagination
  const {
    params: filters,
    pagination,
    handleParamsChange,
  } = useTableSearchParams<ServiceSorting, ServiceFilters>(adaptSearchParams);

  // Query tRPC pour récupérer les services avec pagination et filtres
  const {
    data: servicesData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = api.services.getAvailableServicesDashboard.useInfiniteQuery(
    {
      limit: pagination.limit,
      search: filters.search,
      category: filters.category,
      isActive: filters.isActive,
      organizationId: filters.organizationId,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  );

  // Query pour récupérer les organisations pour le filtre
  const { data: organizations } = api.organizations.getList.useQuery({
    limit: 100,
  });

  // Flatten les services de toutes les pages
  const allServices = servicesData?.pages.flatMap((page) => page.services) ?? [];
  const totalCount = servicesData?.pages[0]?.totalCount ?? 0;

  // Gérer le changement de recherche
  const handleSearchChange = (value: string) => {
    handleParamsChange('search', value || undefined);
  };

  // Gérer le changement de catégorie
  const handleCategoryChange = (value: string) => {
    handleParamsChange(
      'category',
      value === 'all' ? undefined : (value as ServiceCategory),
    );
  };

  // Gérer le changement d'organisation
  const handleOrganizationChange = (value: string) => {
    handleParamsChange('organizationId', value === 'all' ? undefined : value);
  };

  // Gérer le changement de statut actif
  const handleActiveStatusChange = (value: string) => {
    handleParamsChange('isActive', value === 'all' ? undefined : value === 'true');
  };

  // Réinitialiser tous les filtres
  const resetFilters = () => {
    handleParamsChange('search', undefined);
    handleParamsChange('category', undefined);
    handleParamsChange('organizationId', undefined);
    handleParamsChange('isActive', undefined);
  };

  // Auto-refetch when filters change
  useEffect(() => {
    refetch();
  }, [filters, refetch]);

  return (
    <PageContainer
      title={t('new_request.title')}
      description={t('new_request.subtitle')}
      action={
        <div className="flex items-center space-x-2">
          <Link href={ROUTES.user.dashboard}>
            <Button
              variant="outline"
              size="icon"
              aria-label={t('actions.backToServices')}
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              {t('actions.backToServices')}
            </Button>
          </Link>
        </div>
      }
    >
      {/* Search and filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Input
          placeholder={t('new_request.search_placeholder')}
          value={filters.search || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="flex-1"
        />
        <Select value={filters.category || 'all'} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('new_request.filters.all_categories')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('new_request.filters.all_categories')}</SelectItem>
            {Object.values(ServiceCategory).map((category) => (
              <SelectItem key={category} value={category}>
                {tInputs(`serviceCategory.options.${category}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.organizationId || 'all'}
          onValueChange={handleOrganizationChange}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t('new_request.filters.all_organizations')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {t('new_request.filters.all_organizations')}
            </SelectItem>
            {organizations?.items?.map((org) => (
              <SelectItem key={org.id} value={org.id}>
                {org.name}
              </SelectItem>
            ))}
            <SelectItem value="consulat">{t('new_request.consulat_services')}</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.isActive === undefined ? 'all' : filters.isActive.toString()}
          onValueChange={handleActiveStatusChange}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="true">{t('new_request.status.active')}</SelectItem>
            <SelectItem value="false">{t('new_request.status.coming_soon')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="space-y-6">
          <LoadingSkeleton variant="grid" aspectRatio="4/3" />
        </div>
      ) : allServices.length > 0 ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {totalCount} service{totalCount > 1 ? 's' : ''} trouvé
              {totalCount > 1 ? 's' : ''}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allServices.map((service) => (
              <CardContainer
                key={service.id}
                title={service.name}
                subtitle={
                  service.organization?.name || t('new_request.consulat_services')
                }
                action={
                  <Badge
                    className="w-fit"
                    variant={service.isActive ? 'default' : 'secondary'}
                  >
                    {service.isActive
                      ? t('new_request.status.active')
                      : t('new_request.status.coming_soon')}
                  </Badge>
                }
                className="cursor-pointer hover:border-primary transition-all hover:shadow-lg hover:-translate-y-1"
                headerClass="bg-muted/50 pb-4!"
                footerContent={
                  <div className="w-full space-y-2">
                    <Button
                      className={`w-full ${!service.isActive ? 'opacity-60 cursor-not-allowed' : ''}`}
                      asChild={service.isActive}
                      disabled={!service.isActive}
                    >
                      {service.isActive ? (
                        <Link href={ROUTES.user.service_submit(service.id)}>
                          <Plus className="h-4 w-4 mr-2" />
                          {t('new_request.start_request')}
                        </Link>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          {t('new_request.start_request')}
                        </>
                      )}
                    </Button>
                    {!service.isActive && (
                      <p className="text-xs text-center text-muted-foreground">
                        {t('new_request.available_from')}
                      </p>
                    )}
                  </div>
                }
              >
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {service.description || t('new_request.no_description')}
                </p>
              </CardContainer>
            ))}
          </div>

          {/* Load More Button */}
          {hasNextPage && (
            <div className="flex justify-center">
              <Button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                variant="outline"
              >
                {isFetchingNextPage
                  ? t('new_request.loading')
                  : t('new_request.load_more')}
              </Button>
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
                {t('new_request.no_services_found')}
              </h3>
              <p className="text-muted-foreground">
                {t('new_request.no_services_description')}
              </p>
            </div>
            <Button onClick={resetFilters} className="bg-primary hover:bg-primary/90">
              {t('new_request.reset_filters')}
            </Button>
          </div>
        </div>
      )}

      {/* Help section */}
      <CardContainer title={t('new_request.help.title')} className="bg-muted/50">
        <div className="space-y-4">
          <p className="text-muted-foreground">{t('new_request.help.description')}</p>
          <div className="flex flex-wrap gap-4">
            <Button asChild>
              <Link href={ROUTES.user.contact}>{t('new_request.help.contact')}</Link>
            </Button>
            <Button variant="outline" disabled>
              {t('new_request.help.guide')}
            </Button>
          </div>
        </div>
      </CardContainer>
    </PageContainer>
  );
}
