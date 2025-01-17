'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { createService } from '../actions/services'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { CreateServiceInput } from '@/schemas/consular-service'
import { Organization } from '@/types/organization'
import { ServiceQuickForm } from '@/app/(authenticated)/superadmin/_utils/components/service-quick-form'

export function CreateServiceButton({ organizations }: { organizations: Organization[] }) {
  const t = useTranslations('superadmin.services')
  const { toast } = useToast()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: CreateServiceInput) => {
    setIsLoading(true)
    try {
      const result = await createService(data)
      if (result.error) {
        throw new Error(result.error)
      }
      toast({
        title: t('messages.createSuccess'),
        variant: 'success',
      })
      setIsOpen(false)
      router.refresh()
    } catch (error) {
      toast({
        title: t('messages.error.create'),
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 size-4" />
          <span className={'mobile-hide-inline'}>
           {t('actions.create')}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{t('form.create_title')}</DialogTitle>
        </DialogHeader>
        <ServiceQuickForm
          organizations={organizations}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  )
}