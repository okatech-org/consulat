'use client'

import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export function GeneralSettings() {
  const t = useTranslations('manager.settings.general')
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    // TODO: Implémenter la sauvegarde

    toast({
      title: t('messages.success'),
      description: t('messages.success_description')
    })

    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('notifications.email')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('notifications.email_description')}
              </p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('notifications.sms')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('notifications.sms_description')}
              </p>
            </div>
            <Switch />
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? t('saving') : t('save')}
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}