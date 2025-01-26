'use client';

import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { buttonVariants } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { subscribeToWaitlist } from '@/actions/email-list';

export function CTASection() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await subscribeToWaitlist(email);

      toast({
        title: 'Inscription réussie !',
        description: 'Nous vous préviendrons dès que le site sera disponible.',
        variant: 'success',
      });

      setEmail('');
    } catch (error) {
      console.error(error);
      toast({
        title: 'Une erreur est survenue',
        description:
          'Impossible de vous inscrire pour le moment. Veuillez réessayer plus tard.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-primary py-20 text-primary-foreground">
      <div className="container max-w-2xl text-center">
        <h2 className="mb-6 text-3xl font-bold md:text-4xl">
          Soyez les premiers informés
        </h2>
        <p className="mb-8 text-lg opacity-90">
          Laissez-nous votre email pour être notifié dès que la plateforme sera
          disponible.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-md flex-col items-center gap-4 sm:flex-row"
        >
          <Input
            type="email"
            placeholder="Votre adresse email"
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
                Inscription...
              </>
            ) : (
              'Me prévenir'
            )}
          </button>
        </form>

        <p className="mt-4 text-sm opacity-75">
          Nous respectons votre vie privée. Vous pourrez vous désinscrire à tout moment.
        </p>
      </div>
    </section>
  );
}
