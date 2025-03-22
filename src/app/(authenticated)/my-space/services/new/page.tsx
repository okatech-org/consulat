'use client';

import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { getAvailableConsularServices } from '@/actions/services';
import { Skeleton } from '@/components/ui/skeleton';
import { ServiceField } from '@/types/consular-service';
import { ROUTES } from '@/schemas/routes';

// Define a more specific type for consular service details
type ConsularServiceDetails = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  isActive: boolean;
  organization?: {
    id: string;
    name: string;
    type: string;
  } | null;
  steps?: Array<{
    id: string | null;
    order: number;
    title: string;
    description: string | null;
    type: string;
    isRequired: boolean;
    fields: ServiceField[];
    validations: Record<string, unknown> | null;
  }>;
};

export default function NewServiceRequestPage() {
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('serviceId');
  const t = useTranslations('services');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serviceDetails, setServiceDetails] = useState<ConsularServiceDetails | null>(
    null,
  );

  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        setLoading(true);
        if (serviceId) {
          // Fetch details for the specific service
          const services = await getAvailableConsularServices();
          const service = services.find((s) => s.id === serviceId);
          if (service) {
            setServiceDetails(service);
          } else {
            setError('Service not found');
          }
        } else {
          setError('No service ID provided');
        }
      } catch (err) {
        console.error('Error fetching service details:', err);
        setError('Failed to load service details');
      } finally {
        setLoading(false);
      }
    };

    fetchServiceDetails();
  }, [serviceId]);

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-6 w-40" />
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (error || !serviceDetails) {
    return (
      <div className="container mx-auto py-6">
        <Link href={ROUTES.user.services}>
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('actions.backToServices')}
          </Button>
        </Link>
        <Card>
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error || 'Failed to load service details'}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Link href={ROUTES.user.services}>
        <Button variant="outline" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('actions.backToServices')}
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>{t('newRequest.title')}</CardTitle>
          <CardDescription>{t('newRequest.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{serviceDetails.name}</h3>
            {serviceDetails.description && (
              <p className="text-muted-foreground">{serviceDetails.description}</p>
            )}
            {serviceDetails.organization && (
              <p className="text-sm text-muted-foreground">
                Fourni par{' '}
                <span className="font-medium">{serviceDetails.organization.name}</span>
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button>{t('actions.startProcess')}</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
