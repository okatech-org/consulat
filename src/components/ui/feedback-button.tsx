'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { MessageSquare } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { FeedbackForm } from '@/components/ui/feedback-form';
import { cn } from '@/lib/utils';

interface FeedbackButtonProps extends Omit<ButtonProps, 'onClick'> {
  showIcon?: boolean;
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function FeedbackButton({
  showIcon = true,
  variant = 'outline',
  size = 'sm',
  className,
  children,
  ...props
}: FeedbackButtonProps) {
  const t = useTranslations('feedback');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setShowFeedbackForm(true)}
        className={cn(className)}
        leftIcon={showIcon ? <MessageSquare className="sier-icon" /> : undefined}
        {...props}
      >
        {children || t('banner.openFeedback')}
      </Button>

      <FeedbackForm isOpen={showFeedbackForm} onOpenChange={setShowFeedbackForm} />
    </>
  );
}
