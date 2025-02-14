import { LoaderIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function CustomLoader() {
  const t = useTranslations('common');

  return (
    <div className={'container flex size-full items-center justify-center'}>
      <div className={'flex items-center gap-4'}>
        <LoaderIcon className={'size-12 animate-spin'} />
        <p className={'text-lg leading-none tracking-tight'}>{t('loading')}</p>
      </div>
    </div>
  );
}
