'use client';

import { useTranslations } from 'next-intl';
import { AlertTriangle } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/schemas/routes';
import Link from 'next/link';

interface BetaBannerProps {
  className?: string;
  variant?: 'default' | 'compact';
}

export function BetaBanner({ className, variant = 'default' }: BetaBannerProps) {
  const t = useTranslations('feedback');

  return (
    <>
      <div
        className={cn(
          'flex items-center flex-wrap justify-between bg-primary/10 rounded-md text-primary px-3 py-1.5 text-sm',
          className,
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <AlertTriangle className={cn(variant === 'default' ? 'h-5 w-5' : 'h-4 w-4')} />
          <span>
            <span className="font-medium">{t('banner.betaVersion')}</span>
            {variant === 'default' && (
              <span className="ml-1">{t('banner.feedbackWelcome')}</span>
            )}
          </span>
        </div>
        <Link
          href={ROUTES.feedback}
          className={cn(
            buttonVariants({ variant: 'link' }),
            'px-1 text-sm underline ml-auto',
          )}
        >
          {t('banner.openFeedback')}
        </Link>
      </div>
    </>
  );
}
