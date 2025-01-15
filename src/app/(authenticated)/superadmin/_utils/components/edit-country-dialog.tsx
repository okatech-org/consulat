'use client'

import { useTranslations } from 'next-intl'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CountryForm } from './country-form'
import { useToast } from '@/hooks/use-toast'
import { Country, CreateCountryInput } from '@/types/country'
import { updateCountry } from '@/actions/countries'

interface EditCountryDialogProps {
  country: Country
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditCountryDialog({ country, open, onOpenChange }: EditCountryDialogProps) {
  const t = useTranslations('superadmin.countries')
  const { toast } = useToast()

  const handleSubmit = async (data: CreateCountryInput) => {
    const result = await updateCountry({
      ...data,
      id: country.id
    })

    if (result.error) {
      toast({
        title: t('messages.error.update'),
        variant: 'destructive'
      })
      return
    }

    toast({
      title: t('messages.updateSuccess')
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('actions.edit')} - {country.name}</DialogTitle>
        </DialogHeader>
        <CountryForm
          initialData={country as CreateCountryInput}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}