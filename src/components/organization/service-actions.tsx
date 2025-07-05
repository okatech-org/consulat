'use client';

import { useTranslations } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pencil, Trash, Ban, CheckCircle, Copy } from 'lucide-react';
import type { ConsularServiceListingItem } from '@/types/consular-service';
import { ROUTES } from '@/schemas/routes';
import Link from 'next/link';

interface ServiceActionsProps {
  service: ConsularServiceListingItem;
  onServiceDelete: () => void;
  onStatusChange: () => void;
  onDuplicateService: () => void;
  isLoading: boolean;
}

export function ServiceActions({
  service,
  onServiceDelete,
  onDuplicateService,
  onStatusChange,
  isLoading,
}: ServiceActionsProps) {
  const t = useTranslations('common.actions');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="size-8 p-0"
          leftIcon={<MoreHorizontal className="size-4" />}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link
            href={ROUTES.dashboard.edit_service(service.id)}
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <Pencil className="mr-2 h-4 w-4" />
            {t('edit')}
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={(event) => {
            event.stopPropagation();
            onStatusChange();
          }}
          disabled={isLoading}
        >
          {service.isActive ? (
            <>
              <Ban className="mr-2 size-4" />
              {t('deactivate')}
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 size-4" />
              {t('activate')}
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(event) => {
            event.stopPropagation();
            onDuplicateService();
          }}
        >
          <Copy className="mr-2 h-4 w-4" />
          {t('duplicate')}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={(event) => {
            event.stopPropagation();
            onServiceDelete();
          }}
          className="text-destructive"
          disabled={isLoading}
        >
          <Trash className="mr-2 size-4" />
          {t('delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
