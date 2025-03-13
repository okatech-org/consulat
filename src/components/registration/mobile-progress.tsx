'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

interface MobileProgressProps {
  currentStepIndex: number;
  totalSteps: number;
  stepTitle: string;
  isOptional?: boolean;
}

export function MobileProgress({
  currentStepIndex,
  totalSteps,
  stepTitle,
  isOptional,
}: MobileProgressProps) {
  const t = useTranslations('registration');

  return (
    <div className="fixed inset-x-0 bottom-0 bg-background p-4 shadow-lg md:hidden">
      <div className="container space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{stepTitle}</p>
            {isOptional && (
              <span className="text-xs text-muted-foreground">
                ({t('steps.optional')})
              </span>
            )}
          </div>
          <span className="text-sm text-muted-foreground">
            {t('steps.progress', { current: currentStepIndex + 1, total: totalSteps })}
          </span>
        </div>
        <div className="h-1 w-full rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: '0%' }}
            animate={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </div>
  );
}
