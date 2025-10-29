'use client';

import { useTranslations } from 'next-intl';
import { AlertTitle } from '@/components/ui/alert';
import { buttonVariants } from '@/components/ui/button';
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
import CardContainer from '@/components/layouts/card-container';
import { RequestStatus } from '@/convex/lib/constants';

type AlertVariant = 'default' | 'destructive' | 'secondary';

interface ProfileStatusAlertProps {
  status: RequestStatus;
  notes?: string;
  requestId?: string;
}

export function ProfileStatusAlert({
  status,
  notes,
  requestId,
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
            organization: t('default.organization'),
            address: t('default.address'),
          }),
          action: (
            <Link
              className={buttonVariants({ variant: 'link' })}
              href={`${ROUTES.user.new_appointment}?serviceRequestId=${requestId}&type=WITHDRAW`}
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
    <CardContainer
      title={
        <div className="flex items-center gap-2">
          <Icon className={cn('size-4', config.icon === Loader2 && 'animate-spin')} />
          <AlertTitle>{config.title}</AlertTitle>
        </div>
      }
      subtitle={config.description}
      contentClass="flex flex-col gap-2 justify-start"
    >
      {config.action && <div className="w-max">{config.action}</div>}
    </CardContainer>
  );
}
