import React from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { InfoIcon, AlertTriangle } from 'lucide-react';

interface StepGuideProps {
  stepKey: string;
  isOptional?: boolean;
  className?: string;
}

export function StepGuide({ stepKey, isOptional, className }: StepGuideProps) {
  const t = useTranslations('registration');

  return (
    <Card className={cn('p-4', className)}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-start gap-3">
          <InfoIcon className="mt-1 size-5 text-primary" />
          <div className="space-y-2">
            <h3 className="font-medium">{t(`help.${stepKey}.title`)}</h3>
            <p className="text-sm text-muted-foreground">
              {t(`help.${stepKey}.description`)}
            </p>

            {/* Indication optionnelle */}
            {isOptional && (
              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <AlertTriangle className="size-4" />
                {t('help.optional_step')}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Card>
  );
}
