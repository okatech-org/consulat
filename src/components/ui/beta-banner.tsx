'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FeedbackForm } from '@/components/ui/feedback-form';
import { cn } from '@/lib/utils';

interface BetaBannerProps {
  className?: string;
  variant?: 'default' | 'compact';
}

export function BetaBanner({ className, variant = 'default' }: BetaBannerProps) {
  const t = useTranslations('feedback');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  return (
    <>
      <div
        className={cn(
          'flex items-center justify-between bg-primary/10 text-primary',
          variant === 'default' ? 'px-4 py-2' : 'px-3 py-1.5 text-sm',
          className,
        )}
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className={cn(variant === 'default' ? 'h-5 w-5' : 'h-4 w-4')} />
          <span>
            <span className="font-medium">{t('banner.betaVersion')}</span>
            {variant === 'default' && (
              <span className="ml-1">{t('banner.feedbackWelcome')}</span>
            )}
          </span>
        </div>
        <Button
          variant="link"
          size="sm"
          onClick={() => setShowFeedbackForm(true)}
          className={cn(
            'text-primary hover:text-primary/80',
            variant === 'compact' && 'text-xs',
          )}
        >
          {t('banner.openFeedback')}
        </Button>
      </div>

      <FeedbackForm isOpen={showFeedbackForm} onOpenChange={setShowFeedbackForm} />
    </>
  );
}
