// src/components/actions/requests/requests-filters.tsx
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';

export function RequestsFilters() {
  const t = useTranslations('admin.requests');

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <Input placeholder={t('filters.search')} className="sm:max-w-[300px]" />
        <Select>
          <SelectTrigger className="sm:max-w-[200px]">
            <SelectValue placeholder={t('filters.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('filters.all')}</SelectItem>
            <SelectItem value="PENDING">{t('status.pending')}</SelectItem>
            <SelectItem value="IN_PROGRESS">{t('status.in_progress')}</SelectItem>
            <SelectItem value="COMPLETED">{t('status.completed')}</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="ghost" size="sm" className="gap-2">
          <X className="size-4" />
          {t('filters.reset')}
        </Button>
      </div>
    </div>
  );
}
