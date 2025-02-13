'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface QueueItem {
  id: string;
  type: string;
  status: string;
  createdAt: Date;
  priority: 'high' | 'medium' | 'low';
}

export function RequestsQueue() {
  const t = useTranslations('manager.dashboard');

  // TODO: Remplacer par les vraies données
  const queueItems: QueueItem[] = [
    {
      id: '1',
      type: 'PASSPORT_REQUEST',
      status: 'PENDING',
      createdAt: new Date(),
      priority: 'high',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('queue.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {queueItems.length > 0 ? (
            <div className="space-y-4">
              {queueItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">
                      {t(`requests.types.${item.type.toLowerCase()}`)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    variant={
                      item.priority === 'high'
                        ? 'destructive'
                        : item.priority === 'medium'
                          ? 'default'
                          : 'secondary'
                    }
                  >
                    {t(`priority.${item.priority}`)}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">{t('queue.empty')}</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
