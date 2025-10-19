'use client';

import { useTranslations } from 'next-intl';
import { Plus, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { useState, useMemo } from 'react';
import CardContainer from '@/components/layouts/card-container';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { ServiceCategory, ServiceStatus } from '@/convex/lib/constants';
import type { Id } from '@/convex/_generated/dataModel';

export default function AvailableServicesPage() {
  const t = useTranslations('services');
  const tInputs = useTranslations('inputs');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | undefined>(
    undefined,
  );
  const [selectedOrganization, setSelectedOrganization] = useState<
    Id<'organizations'> | undefined
  >(undefined);
  const [selectedStatus, setSelectedStatus] = useState<ServiceStatus | undefined>(
    undefined,
  );

  // Récupérer tous les services et organisations
  const allServices = useQuery(api.functions.service.getAllServices, {
    category: selectedCategory,
    organizationId: selectedOrganization,
    status: selectedStatus,
  });

  const organizations = useQuery(api.functions.organization.getAllOrganizations, {});

  // Filtrer les services selon les critères
  const filteredServices = useMemo(() => {
    if (!allServices) return [];

    return allServices
      .filter((service) => {
        // Filtre de recherche
        if (searchTerm) {
          const search = searchTerm.toLowerCase();
          const matchesSearch =
            service.name.toLowerCase().includes(search) ||
            service.code.toLowerCase().includes(search) ||
            service.description?.toLowerCase().includes(search);
          if (!matchesSearch) return false;
        }

        return true;
      })
      .sort((a, b) => a.status.localeCompare(b.status));
  }, [allServices, searchTerm, selectedCategory, selectedOrganization, selectedStatus]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory(undefined);
    setSelectedOrganization(undefined);
    setSelectedStatus(undefined);
  };

  return (
    <PageContainer
      title={t('new_request.title')}
      description={t('new_request.subtitle')}
      action={
        <div className="flex items-center space-x-2">
          <Link href={ROUTES.user.dashboard}>
            <Button
              variant="outline"
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
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select
          value={selectedCategory}
          onValueChange={(value) => setSelectedCategory(value as ServiceCategory)}
        >
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
          value={selectedOrganization}
          onValueChange={(value) => setSelectedOrganization(value as Id<'organizations'>)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t('new_request.filters.all_organizations')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {t('new_request.filters.all_organizations')}
            </SelectItem>
            {organizations?.map((org) => (
              <SelectItem key={org._id} value={org._id}>
                {org.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={selectedStatus}
          onValueChange={(value) => setSelectedStatus(value as ServiceStatus)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="active">{t('new_request.status.active')}</SelectItem>
            <SelectItem value="inactive">
              {t('new_request.status.coming_soon')}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Services Grid */}
      {!allServices ? (
        <div className="space-y-6">
          <LoadingSkeleton variant="grid" aspectRatio="4/3" />
        </div>
      ) : filteredServices.length > 0 ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {filteredServices.length} service{filteredServices.length > 1 ? 's' : ''}{' '}
              trouvé
              {filteredServices.length > 1 ? 's' : ''}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => {
              const organization = organizations?.find(
                (org) => org._id === service.organizationId,
              );
              const isActive = service.status === ServiceStatus.Active;

              return (
                <CardContainer
                  key={service._id}
                  title={service.name}
                  subtitle={organization?.name || t('new_request.consulat_services')}
                  action={
                    <Badge className="w-fit" variant={isActive ? 'default' : 'secondary'}>
                      {isActive
                        ? t('new_request.status.active')
                        : t('new_request.status.coming_soon')}
                    </Badge>
                  }
                  className="cursor-pointer hover:border-primary transition-all hover:shadow-lg hover:-translate-y-1"
                  headerClass="bg-muted/50 pb-4!"
                  footerContent={
                    <div className="w-full space-y-2">
                      <Button
                        className={`w-full ${!isActive ? 'opacity-60 cursor-not-allowed' : ''}`}
                        asChild={isActive}
                        disabled={!isActive}
                      >
                        {isActive ? (
                          <Link href={ROUTES.user.service_submit(service._id)}>
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
                      {!isActive && (
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
              );
            })}
          </div>
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
