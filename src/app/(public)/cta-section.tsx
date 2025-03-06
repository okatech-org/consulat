'use client';

import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { buttonVariants } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { subscribeToWaitlist } from '@/actions/email-list';
import { useTranslations } from 'next-intl';

export function CTASection() {
  const t = useTranslations('home.waitlist_section');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await subscribeToWaitlist(email);

      toast({
        title: t('success_toast.title'),
        description: t('success_toast.description'),
        variant: 'success',
      });

      setEmail('');
    } catch (error) {
      console.error(error);
      toast({
        title: t('error_toast.title'),
        description: t('error_toast.description'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-primary py-20 text-primary-foreground">
      <div className="container max-w-2xl text-center">
        <h2 className="mb-6 text-3xl font-bold md:text-4xl">{t('title')}</h2>
        <p className="mb-8 text-lg opacity-90">{t('description')}</p>

        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-md flex-col items-center gap-4 sm:flex-row"
        >
          <Input
            type="email"
            placeholder={t('email_placeholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/60"
            required
          />
          <button
            type="submit"
            className={buttonVariants({
              variant: 'secondary',
              size: 'lg',
            })}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="mr-2 size-4 animate-spin rounded-full border-2 border-primary border-r-transparent" />
                {t('submitting')}
              </>
            ) : (
              t('submit_button')
            )}
          </button>
        </form>

        <p className="mt-4 text-sm opacity-75">{t('privacy_notice')}</p>
      </div>
    </section>
  );
}
