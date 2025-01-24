import LanguageSwitcherSelect from '@/components/ui/LanguageSwitcher';
import { useLocale, useTranslations } from 'next-intl';

export default function LangSwitcher() {
  const t = useTranslations('common.languages');
  const locale = useLocale();

  return (
    <LanguageSwitcherSelect
      defaultValue={locale}
      languages={[
        {
          value: 'fr',
          label: t('fr_short'),
        },
        {
          value: 'en',
          label: t('en_short'),
        },
        {
          value: 'es',
          label: t('es_short'),
        },
      ]}
      label={t('label')}
    />
  );
}
