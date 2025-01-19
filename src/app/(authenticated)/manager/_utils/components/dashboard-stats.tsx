'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslations } from "next-intl"

export function DashboardStats() {
  const t = useTranslations('manager.dashboard')

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t('overview.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{t('overview.pending_requests')}</p>
              <h3 className="text-2xl font-bold">12</h3>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('overview.processing_requests')}</p>
              <h3 className="text-2xl font-bold">5</h3>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('overview.completed_requests')}</p>
              <h3 className="text-2xl font-bold">28</h3>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}