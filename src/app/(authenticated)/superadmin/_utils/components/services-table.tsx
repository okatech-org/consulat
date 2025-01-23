'use client'

import { useTranslations } from 'next-intl'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/data-table/data-table'
import { ConsularServiceListingItem, UpdateServiceInput } from '@/types/consular-service'
import { ServiceCategory } from '@prisma/client'
import { Organization } from '@/types/organization'
import { ServiceActions } from '@/app/(authenticated)/superadmin/_utils/components/service-actions'
import {
  deleteService,
  duplicateService,
  updateService,
  updateServiceStatus,
} from '@/app/(authenticated)/superadmin/_utils/actions/services'
import { useToast } from '@/hooks/use-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useState } from 'react'
import { NewServiceForm } from '@/app/(authenticated)/superadmin/_utils/components/new-service-form'
import { useRouter } from 'next/navigation'

export function ServicesTable({
                                services}: {
  services: ConsularServiceListingItem[]
  organizations: Organization[]
}) {
  const t = useTranslations('superadmin.services')
  const t_common = useTranslations('common')
  const t_messages = useTranslations('messages')
  const [selectedService, setSelectedService] = useState<ConsularServiceListingItem | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleStatusChange = async (serviceId: string, status: boolean) => {
    setIsLoading(true)
    try {
      const result = await updateServiceStatus(serviceId, status)

      if (result.error) throw new Error(result.error)

      toast({
        title: t('messages.updateSuccess'),
        variant: 'success'
      })
    } catch (error) {
      toast({
        title: t('messages.error.update'),
        variant: 'destructive',
        description: `${error}`
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (serviceId :string) => {
    setIsLoading(true)
    try {
      const result = await deleteService(serviceId)

      if (result.error) throw new Error(result.error)

      toast({
        title: t('messages.deleteSuccess'),
        variant: 'success'
      })
    } catch (error) {
      toast({
        title: t('messages.error.delete'),
        variant: 'destructive',
        description: `${error}`
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleServiceUpdate = async (data: UpdateServiceInput) => {
    setIsLoading(true)
    try {
      const result = await updateService(data)

      if (result.error) throw new Error(result.error)

      toast({
        title: t_messages('success.update'),
        variant: 'success'
      })
    } catch (error) {
      toast({
        title: t_messages('errors.update'),
        variant: 'destructive',
        description: `${error}`
      })
    } finally {
      setSelectedService(null)
      setShowEditDialog(false)
      setIsLoading(false)
    }
  }

  const handleDuplicateService = async (serviceId: string) => {
    setIsLoading(true);
    try {
      const result = await duplicateService(serviceId);
      if (result.error) {
        toast({
          title: t_messages('errors.duplicate'),
          description: result.error,
          variant: 'destructive',
        });
      } else {
        toast({
          title: t_messages('success.duplicate'),
          variant: 'success',
        });
        router.refresh();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const columns: ColumnDef<ConsularServiceListingItem>[] = [
    {
      accessorKey: 'name',
      header: t('table.name'),
      enableSorting: true,
    },
    {
      accessorKey: 'category',
      header: t('table.category'),
      cell: ({ row }) => t_common(`service_categories.${row.original.category}`),
      filterFn: "arrIncludesSome"
    },
    {
      accessorKey: 'organization',
      header: t('table.organization'),
      cell: ({ row }) => (
        row.original.organization?.name ||
        <Badge variant="default">{t_common('status.not_assigned')}</Badge>
      ),
    },
    {
      accessorKey: 'isActive',
      header: t('table.status'),
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'success' : 'outline'}>
          {t_common(`status.${row.original.isActive ? 'active' : 'inactive'}`)}
        </Badge>
      ),
      enableSorting: true,
      sortingFn: 'auto',
    },
    {
      id: 'actions',
      header: t('table.actions'),
      cell: ({ row }) => (
        <ServiceActions
          service={row.original}
          onStatusChange={async () => {
            await handleStatusChange(row.original.id, !row.original.isActive)
          }}
          onServiceDelete={async () => {
            await handleDelete(row.original.id)
          }}
          onDuplicateService={() => handleDuplicateService(row.original.id)}
          isLoading={isLoading}
        />
      ),
    },
  ]

  return (
    <>
      <DataTable<ConsularServiceListingItem, unknown>
        columns={columns}
        data={services}
        filters={[
          {
            type: 'search',
            value: 'name',
            label: t('table.name'),
          },
          {
            type: 'radio',
            value: 'category',
            label: t('table.category'),
            options: Object.values(ServiceCategory).map((category) => ({
              value: category,
              label: t_common(`service_categories.${category}`),
            })),
          },
          {
            type: 'radio',
            value: 'isActive',
            label: t('table.status'),
            options: [
              { value: 'true', label: t_common('status.active') },
              { value: 'false', label: t_common('status.inactive') },
            ],
          },
        ]}
        onRowClick={(row) => {
          setSelectedService(row.original)
          setShowEditDialog(true)
        }}
      />

      {/* Dialog de modification */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{t('form.edit_title')}</DialogTitle>
          </DialogHeader>
          {selectedService && (
            <NewServiceForm
              initialData={selectedService}
              handleSubmit={(data) => handleServiceUpdate(data)}
              isLoading={isLoading}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}