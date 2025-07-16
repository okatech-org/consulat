'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, MessageCircle, HelpCircle } from 'lucide-react';
import { getAvailableConsularServices } from '@/actions/services';
import { ServiceCategory } from '@prisma/client';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';

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

const UNAVAILABLE_MESSAGE = 'Disponible à partir du 15 juillet 2025';

export function NewRequestSection() {
  const t = useTranslations('dashboard.request_details.new_request');
  const tInputs = useTranslations('inputs');
  const [availableServices, setAvailableServices] = useState<
    ConsularServiceWithOrganization[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [organizationFilter, setOrganizationFilter] = useState<string>('all');

  useEffect(() => {
    const fetchServices = async () => {
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

    fetchServices();
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
        !searchTerm.trim() ||
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (service.description &&
          service.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (service.organization &&
          service.organization.name.toLowerCase().includes(searchTerm.toLowerCase()));

      // Category filter
      const matchesCategory =
        categoryFilter === 'all' || service.category === categoryFilter;

      // Organization filter
      const matchesOrganization =
        organizationFilter === 'all' ||
        (service.organization && service.organization.id === organizationFilter);

      return matchesSearch && matchesCategory && matchesOrganization;
    });
  };

  const filteredServices = getFilteredServices();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </CardHeader>
      <CardContent>
        {/* Search and filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            placeholder={t('filters.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('filters.all_categories')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filters.all_categories')}</SelectItem>
              {Object.values(ServiceCategory).map((category) => (
                <SelectItem key={category} value={category}>
                  {tInputs(`serviceCategory.options.${category}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={organizationFilter} onValueChange={setOrganizationFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={t('filters.all_organizations')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filters.all_organizations')}</SelectItem>
              {getUniqueOrganizations().map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span>Chargement des services...</span>
            </div>
          </div>
        ) : filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {filteredServices.map((service) => (
              <Card
                key={service.id}
                className="cursor-pointer hover:border-primary transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <CardHeader className="bg-muted/50">
                  <Badge
                    className="w-fit mb-2"
                    variant={service.isActive ? 'default' : 'secondary'}
                  >
                    {service.isActive ? t('service_status.active') : 'Bientôt disponible'}
                  </Badge>
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {service.organization?.name || 'Services consulaires'}
                  </p>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {service.description || 'Description non disponible'}
                  </p>
                </CardContent>
                <div className="px-6 pb-6">
                  <Button
                    className={`w-full ${!service.isActive ? 'opacity-60 cursor-not-allowed' : ''}`}
                    asChild={service.isActive}
                    disabled={!service.isActive}
                  >
                    {service.isActive ? (
                      <Link href={ROUTES.user.service_submit(service.id)}>
                        <FileText className="h-4 w-4 mr-2" />
                        {t('service_action')}
                      </Link>
                    ) : (
                      <span>
                        <FileText className="h-4 w-4 mr-2" />
                        {t('service_action')}
                      </span>
                    )}
                  </Button>
                  {!service.isActive && (
                    <p className="text-xs text-center mt-2 text-muted-foreground">
                      {UNAVAILABLE_MESSAGE}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-muted/30 rounded-lg border-2 border-dashed border-muted">
            <div className="max-w-md mx-auto space-y-4">
              <div className="p-4 bg-card rounded-full w-fit mx-auto border border-muted">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Aucun service trouvé
                </h3>
                <p className="text-muted-foreground">
                  Aucun service ne correspond à vos critères de recherche. Essayez de
                  modifier vos filtres.
                </p>
              </div>
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                  setOrganizationFilter('all');
                }}
                className="bg-primary hover:bg-primary/90"
              >
                Réinitialiser les filtres
              </Button>
            </div>
          </div>
        )}

        {/* Help section */}
        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">{t('help.title')}</h3>
            <p className="text-muted-foreground mb-4">{t('help.description')}</p>
            <div className="flex flex-wrap gap-4">
              <Button asChild>
                <Link href={ROUTES.user.contact}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {t('help.contact')}
                </Link>
              </Button>
              <Button variant="outline">
                <HelpCircle className="h-4 w-4 mr-2" />
                {t('help.guide')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
