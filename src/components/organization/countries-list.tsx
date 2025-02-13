import React from 'react';
import { Link } from 'react';
import { Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../constants/routes';

const CountriesList: React.FC = () => {
  const { t: t_common } = useTranslation('common');

  return (
    <div>
      {/* Existing code */}
      <Link
        onClick={(e) => e.stopPropagation()}
        href={ROUTES.dashboard.edit_country(row.original.id)}
      >
        <Pencil className="mr-1 size-4" /> {t_common('actions.edit')}
      </Link>
      {/* End of existing code */}
    </div>
  );
};

export default CountriesList;
