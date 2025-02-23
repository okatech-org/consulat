'use client';

import { useTranslations } from 'next-intl';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { buttonVariants } from '@/components/ui/button';
import { RequestStatus } from '@prisma/client';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileCheck,
  Loader2,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';
import { cn } from '@/lib/utils';
import { OrganizationMetadataAddress } from '@/schemas/organization';

type AlertVariant = 'default' | 'destructive' | 'secondary';

interface ProfileStatusAlertProps {
  status: RequestStatus;
  notes?: string;
  organizationName?: string;
  organizationAddress?: OrganizationMetadataAddress | undefined;
}

export function ProfileStatusAlert({
  status,
  notes,
  organizationName,
  organizationAddress,
}: ProfileStatusAlertProps) {
  const t = useTranslations('profile.status_messages');

  const getAlertConfig = (status: RequestStatus) => {
    switch (status) {
      case 'SUBMITTED':
        return {
          variant: 'default' as const,
          icon: Clock,
          title: t('submitted.title'),
          description: t('submitted.description'),
        };
      case 'PENDING':
        return {
          variant: 'default' as const,
          icon: Loader2,
          title: t('pending.title'),
          description: t('pending.description'),
        };
      case 'VALIDATED':
        return {
          variant: 'default' as AlertVariant,
          icon: CheckCircle2,
          title: t('validated.title'),
          description: t('validated.description'),
          action: (
            <Link
              className={buttonVariants({ variant: 'link' })}
              href={ROUTES.user.services}
            >
              {t('validated.action')}
            </Link>
          ),
        };
      case 'READY_FOR_PICKUP':
        return {
          variant: 'secondary' as AlertVariant,
          icon: FileCheck,
          title: t('ready_for_pickup.title'),
          description: t('ready_for_pickup.description', {
            organization: organizationName || t('default.organization'),
            address: organizationAddress
              ? `${organizationAddress.firstLine}, ${organizationAddress.city} ${organizationAddress.zipCode}`
              : t('default.address'),
          }),
          action: (
            <Link
              className={buttonVariants({ variant: 'link' })}
              href={ROUTES.user.appointments}
            >
              {t('ready_for_pickup.action')}
            </Link>
          ),
        };
      case 'COMPLETED':
        return {
          variant: 'default' as AlertVariant,
          icon: CheckCircle2,
          title: t('completed.title'),
          description: t('completed.description'),
        };
      case 'REJECTED':
        return {
          variant: 'destructive' as AlertVariant,
          icon: XCircle,
          title: t('rejected.title'),
          description: notes || t('rejected.description'),
        };
      case 'DRAFT':
        return {
          variant: 'default' as const,
          icon: AlertCircle,
          title: t('draft.title'),
          description: t('draft.description'),
        };
      case 'EDITED':
        return {
          variant: 'default' as const,
          icon: AlertCircle,
          title: t('edited.title'),
          description: t('edited.description'),
        };
      default:
        return {
          variant: 'default' as const,
          icon: AlertCircle,
          title: t('default.title'),
          description: t('default.description'),
        };
    }
  };

  const config = getAlertConfig(status);
  const Icon = config.icon;

  return (
    <Alert variant={config.variant} className="bg-card">
      <Icon className={cn('size-4', config.icon === Loader2 && 'animate-spin')} />
      <AlertTitle>{config.title}</AlertTitle>
      <AlertDescription>{config.description}</AlertDescription>
      {config.action}
    </Alert>
  );
}
