'use client';

import { useTranslations } from 'next-intl';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { cn, type ProfileCompletionResult } from '@/lib/utils';
import { motion } from 'framer-motion';
import CardContainer from '@/components/layouts/card-container';

interface ProfileCompletionProps {
  completion: ProfileCompletionResult;
}

export function ProfileCompletion({ completion }: ProfileCompletionProps) {
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
          <span className={`font-medium ${getCompletionColor(completion.overall)}`}>
            {completion.overall}%
          </span>
        </div>
        <Progress value={completion.overall} />
        {/* Informations requises */}
        <FieldsSection
          title={t('completion.required_information')}
          fields={completion.sections
            .filter((s) => s.name === 'required')
            .map((s) => s.missingFields)
            .flat()}
          completed={completion.sections
            .filter((s) => s.name === 'required')
            .reduce((acc, s) => acc + s.completed, 0)}
          total={completion.sections
            .filter((s) => s.name === 'required')
            .reduce((acc, s) => acc + s.total, 0)}
          type="required"
        />

        {/* Informations optionnelles */}
        {completion.sections
          .filter((s) => s.name === 'optional')
          .reduce((acc, s) => acc + s.total, 0) > 0 && (
          <FieldsSection
            title={t('completion.optional_information')}
            fields={completion.sections
              .filter((s) => s.name === 'optional')
              .map((s) => s.missingFields)
              .flat()}
            completed={completion.sections
              .filter((s) => s.name === 'optional')
              .reduce((acc, s) => acc + s.completed, 0)}
            total={completion.sections
              .filter((s) => s.name === 'optional')
              .reduce((acc, s) => acc + s.total, 0)}
            type="optional"
          />
        )}
      </div>
    </CardContainer>
  );
}

const FieldsList = ({
  fields,
  isExpanded,
  type,
  toShowCount = 2,
}: {
  fields: string[];
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
          key={field}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center justify-between text-sm"
        >
          <div className="flex items-center gap-2">
            {fields.includes(field) ? (
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
  fields: string[];
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
