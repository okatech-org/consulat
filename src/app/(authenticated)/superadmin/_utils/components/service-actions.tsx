'use client'

import { useTranslations } from 'next-intl'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Pencil, Trash, Ban, CheckCircle } from 'lucide-react'
import { ConsularServiceListingItem } from '@/types/consular-service'

interface ServiceActionsProps {
  service: ConsularServiceListingItem
  onServiceDelete: () => void
  onServiceEdit: () => void
  onStatusChange: () => void
  isLoading: boolean
}

export function ServiceActions({ service, onServiceDelete, onServiceEdit, onStatusChange, isLoading }: ServiceActionsProps) {
  const t = useTranslations('superadmin.services')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="size-8 p-0">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem disabled={isLoading} onClick={() => onServiceEdit()}>
          <Pencil className="mr-2 size-4" />
          {t('actions.edit')}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => onStatusChange()}
          disabled={isLoading}
        >
          {service.isActive ? (
            <>
              <Ban className="mr-2 size-4" />
              {t('actions.deactivate')}
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 size-4" />
              {t('actions.activate')}
            </>
          )}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => onServiceDelete()}
          className="text-destructive"
          disabled={isLoading}
        >
          <Trash className="mr-2 size-4" />
          {t('actions.delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}