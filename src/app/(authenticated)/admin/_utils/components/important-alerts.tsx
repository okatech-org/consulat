'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface AlertItem {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  createdAt: Date;
}

export function ImportantAlerts() {
  const t = useTranslations('manager.dashboard');

  // TODO: Remplacer par les vraies données
  const alerts: AlertItem[] = [
    {
      id: '1',
      title: 'Demandes urgentes en attente',
      description: '5 demandes de passeport nécessitent une attention immédiate',
      severity: 'high',
      createdAt: new Date(),
    },
  ];

  function getAlertVariant(severity: AlertItem['severity']) {
    if (severity === 'high') return 'destructive';
    if (severity === 'medium') return 'default';
    return 'secondary';
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('alerts.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {alerts.length > 0 ? (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <Alert key={alert.id} variant={getAlertVariant(alert.severity)}>
                  <AlertCircle className="size-4" />
                  <AlertTitle>{alert.title}</AlertTitle>
                  <AlertDescription>{alert.description}</AlertDescription>
                </Alert>
              ))}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">{t('alerts.empty')}</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
