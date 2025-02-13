import { useTranslations } from 'next-intl';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function RequestsTable() {
  const t = useTranslations('admin.requests');

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('table.requester')}</TableHead>
            <TableHead>{t('table.type')}</TableHead>
            <TableHead>{t('table.status')}</TableHead>
            <TableHead>{t('table.submitted_at')}</TableHead>
            <TableHead className="w-[80px]">{t('table.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{/* Mapper les demandes ici */}</TableBody>
      </Table>
    </div>
  );
}
