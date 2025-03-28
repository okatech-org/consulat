'use client';

import { useTranslations } from 'next-intl';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { cn, ProfileFieldStatus } from '@/lib/utils';
import { motion } from 'framer-motion';
import CardContainer from '@/components/layouts/card-container';

interface ProfileCompletionProps {
  completionRate: number;
  fieldStatus: ProfileFieldStatus;
}

export function ProfileCompletion({
  completionRate,
  fieldStatus,
}: ProfileCompletionProps) {
  const t = useTranslations('profile');

  const getCompletionColor = (rate: number) => {
    if (rate >= 100) return 'text-green';
    if (rate >= 70) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <CardContainer title={t('completion.title')}>
      {/* Barre de progression globale */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {t('completion.progress')}
          </span>
          <span className={`font-medium ${getCompletionColor(completionRate)}`}>
            {completionRate}%
          </span>
        </div>
        <Progress value={completionRate} />
      </div>

      {/* Informations requises */}
      <FieldsSection
        title={t('completion.required_information')}
        fields={fieldStatus.required.fields.filter((f) => !f.completed)}
        completed={fieldStatus.required.completed}
        total={fieldStatus.required.total}
        type="required"
      />

      {/* Informations optionnelles */}
      {fieldStatus.optional.total > 0 && (
        <FieldsSection
          title={t('completion.optional_information')}
          fields={fieldStatus.optional.fields}
          completed={fieldStatus.optional.completed}
          total={fieldStatus.optional.total}
          type="optional"
        />
      )}
    </CardContainer>
  );
}

const FieldsList = ({
  fields,
  isExpanded,
  type,
  toShowCount = 2,
}: {
  fields: ProfileFieldStatus['required']['fields'];
  isExpanded: boolean;
  toShowCount?: number;
  type: 'required' | 'optional';
}) => {
  const t_inputs = useTranslations('inputs');
  const visibleFields = isExpanded ? fields : fields.slice(0, toShowCount);

  return (
    <ul className="space-y-2">
      {visibleFields.map((field) => (
        <motion.li
          key={field.key}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center justify-between text-sm"
        >
          <div className="flex items-center gap-2">
            {field.completed ? (
              <CheckCircle className="text-success size-icon" />
            ) : (
              <AlertCircle
                className={cn(
                  'size-icon min-w-max',
                  type === 'required' ? 'text-destructive' : 'text-muted-foreground',
                )}
              />
            )}
            {/** @ts-expect-error -- We are sure that the key is valid */}
            {t_inputs(`${field.key}.label`)}
          </div>
        </motion.li>
      ))}
    </ul>
  );
};

const FieldsSection = ({
  title,
  fields,
  completed,
  total,
  type,
}: {
  title: string;
  fields: ProfileFieldStatus['required']['fields'];
  completed: number;
  total: number;
  type: 'required' | 'optional';
}) => {
  const t = useTranslations('profile');
  const [isExpanded, setIsExpanded] = useState(false);
  const toShowCount = 3;
  const hasMoreFields = fields.length > toShowCount;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">{title}</h4>
        <Badge variant="outline">
          {completed}/{total}
        </Badge>
      </div>

      <FieldsList
        fields={fields}
        isExpanded={isExpanded}
        toShowCount={toShowCount}
        type={type}
      />

      {hasMoreFields && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>
              {t('completion.show_less')}
              <ChevronDown className="ml-2 size-4" />
            </>
          ) : (
            <>
              {t('completion.show_more', { count: fields.length - toShowCount })}
              <ChevronRight className="ml-2 size-4" />
            </>
          )}
        </Button>
      )}
    </div>
  );
};
