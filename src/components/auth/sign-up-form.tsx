'use client';
import * as Clerk from '@clerk/elements/common';
import * as SignUp from '@clerk/elements/sign-up';
import { Button } from '@/components/ui/button';
import { CardDescription, CardFooter, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { Loader2, Phone } from 'lucide-react';
import type { Country } from '@prisma/client';

// Composant personnalisé pour les erreurs traduites
function TranslatedFieldError({
  error,
  t,
}: {
  error: { message: string } | null;
  t: (key: string) => string;
}) {
  if (!error?.message) return null;

  const translatedError = translateClerkError(error.message, t);
  return <div className="block text-sm text-destructive">{translatedError}</div>;
}

// Fonction pour traduire les erreurs Clerk
function translateClerkError(error: string, t: (key: string) => string): string {
  const errorTranslations: Record<string, string> = {
    'That phone number is taken. Please try another.': t('errors.phone_taken'),
    'That email address is taken. Please try another.': t('errors.email_taken'),
    'Invalid phone number format.': t('errors.invalid_phone'),
    'Phone number must be a valid phone number according to E.164 international standard.':
      t('errors.invalid_phone_e164'),
    'Invalid email address format.': t('errors.invalid_email'),
    'Phone number is required.': t('errors.required_field'),
    'Email address is required.': t('errors.required_field'),
    'First name is required.': t('errors.required_field'),
    'Last name is required.': t('errors.required_field'),
    'Invalid verification code.': t('errors.invalid_code'),
    'Verification code expired.': t('errors.code_expired'),
    'Too many failed attempts.': t('errors.too_many_attempts'),
    'SignUp not available': t('errors.missing_action'),
    'SignUp or setActive not available': t('errors.missing_action'),
  };

  // Rechercher une traduction exacte
  if (errorTranslations[error]) {
    return errorTranslations[error];
  }

  // Rechercher des mots-clés pour des traductions partielles
  const lowerError = error.toLowerCase();
  if (lowerError.includes('phone') && lowerError.includes('taken')) {
    return t('errors.phone_taken');
  }
  if (lowerError.includes('email') && lowerError.includes('taken')) {
    return t('errors.email_taken');
  }
  if (lowerError.includes('invalid') && lowerError.includes('phone')) {
    return t('errors.invalid_phone');
  }
  if (lowerError.includes('invalid') && lowerError.includes('email')) {
    return t('errors.invalid_email');
  }
  if (lowerError.includes('verification') && lowerError.includes('code')) {
    return t('errors.invalid_code');
  }

  // Retourner le message original si aucune traduction n'est trouvée
  return error;
}

export default function SignUpPage({ countries }: { countries: Country[] }) {
  const t = useTranslations('auth.signup');

  return (
    <div className="flex flex-col w-full grow items-center sm:justify-center">
      <SignUp.Root>
        <Clerk.Loading>
          {(isGlobalLoading) => (
            <>
              <SignUp.Step name="start" className="w-full">
                <div className="w-full space-y-4">
                  <div className="flex flex-col gap-y-4">
                    <Clerk.Field name="firstName" className="space-y-2">
                      <Clerk.Label asChild>
                        <Label>{t('fields.firstName')}</Label>
                      </Clerk.Label>
                      <Clerk.Input type="text" required asChild>
                        <Input placeholder={t('placeholders.firstName')} />
                      </Clerk.Input>
                      <Clerk.FieldError>
                        {(error) => <TranslatedFieldError error={error} t={t} />}
                      </Clerk.FieldError>
                    </Clerk.Field>
                    <Clerk.Field name="lastName" className="space-y-2">
                      <Clerk.Label asChild>
                        <Label>{t('fields.lastName')}</Label>
                      </Clerk.Label>
                      <Clerk.Input type="text" required asChild>
                        <Input placeholder={t('placeholders.lastName')} />
                      </Clerk.Input>
                      <Clerk.FieldError>
                        {(error) => <TranslatedFieldError error={error} t={t} />}
                      </Clerk.FieldError>
                    </Clerk.Field>
                    <Clerk.Field name="emailAddress" className="space-y-2">
                      <Clerk.Label asChild>
                        <Label>{t('fields.email')}</Label>
                      </Clerk.Label>
                      <Clerk.Input type="email" required asChild>
                        <Input placeholder={t('placeholders.email')} />
                      </Clerk.Input>
                      <Clerk.FieldError>
                        {(error) => <TranslatedFieldError error={error} t={t} />}
                      </Clerk.FieldError>
                    </Clerk.Field>
                    <Clerk.Field name="phoneNumber" className="space-y-2">
                      <Clerk.Label asChild>
                        <Label>{t('fields.phoneNumber')}</Label>
                      </Clerk.Label>
                      <Clerk.Input type="tel" required asChild>
                        <Input type="tel" placeholder={t('placeholders.phoneNumber')} />
                      </Clerk.Input>
                      <Clerk.FieldError>
                        {(error) => <TranslatedFieldError error={error} t={t} />}
                      </Clerk.FieldError>
                    </Clerk.Field>
                  </div>
                  <div>
                    <div className="flex flex-col w-full gap-y-4">
                      <SignUp.Captcha className="empty:hidden" />
                      <SignUp.Action submit asChild>
                        <Button disabled={isGlobalLoading}>
                          <Clerk.Loading>
                            {(isLoading) => {
                              return isLoading ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                t('create_account_button')
                              );
                            }}
                          </Clerk.Loading>
                        </Button>
                      </SignUp.Action>
                      <Button variant="link" size="sm" asChild>
                        <Clerk.Link navigate="sign-in">
                          {t('already_have_account')} {t('sign_in_link')}
                        </Clerk.Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </SignUp.Step>

              <SignUp.Step name="verifications" className="w-full">
                <SignUp.Strategy name="phone_code">
                  <div className="w-full space-y-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Phone className="h-5 w-5" />
                        {t('verify_phone_title')}
                      </CardTitle>
                      <CardDescription>{t('verify_phone_description')}</CardDescription>
                    </div>
                    <div className="flex flex-col gap-y-4">
                      <div className="flex flex-col items-center justify-center gap-y-2">
                        <Clerk.Field name="code" className="space-y-2">
                          <Clerk.Label className="sr-only">
                            {t('fields.code')}
                          </Clerk.Label>
                          <div className="flex justify-center text-center">
                            <Clerk.Input
                              type="otp"
                              className="flex justify-center has-[:disabled]:opacity-50"
                              autoSubmit
                              render={({ value, status }) => {
                                return (
                                  <div
                                    data-status={status}
                                    className={cn(
                                      'relative flex size-10 items-center justify-center border-y border-r border-input text-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md',
                                      {
                                        'z-10 ring-2 ring-ring ring-offset-background':
                                          status === 'cursor' || status === 'selected',
                                      },
                                    )}
                                  >
                                    {value}
                                    {status === 'cursor' && (
                                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                        <div className="animate-caret-blink h-4 w-px bg-foreground duration-1000" />
                                      </div>
                                    )}
                                  </div>
                                );
                              }}
                            />
                          </div>
                          <Clerk.FieldError>
                            {(error) => <TranslatedFieldError error={error} t={t} />}
                          </Clerk.FieldError>
                        </Clerk.Field>
                        <SignUp.Action
                          asChild
                          resend
                          className="text-muted-foreground"
                          fallback={({ resendableAfter }) => (
                            <Button variant="link" size="sm" disabled>
                              {t('resend_code_fallback', { seconds: resendableAfter })}
                            </Button>
                          )}
                        >
                          <Button type="button" variant="link" size="sm">
                            {t('resend_code')}
                          </Button>
                        </SignUp.Action>
                      </div>
                    </div>
                    <CardFooter>
                      <div className="flex flex-col w-full gap-y-4">
                        <SignUp.Action submit asChild>
                          <Button disabled={isGlobalLoading}>
                            <Clerk.Loading>
                              {(isLoading) => {
                                return isLoading ? (
                                  <Loader2 className="size-4 animate-spin" />
                                ) : (
                                  t('verify_button')
                                );
                              }}
                            </Clerk.Loading>
                          </Button>
                        </SignUp.Action>
                      </div>
                    </CardFooter>
                  </div>
                </SignUp.Strategy>
              </SignUp.Step>
            </>
          )}
        </Clerk.Loading>
      </SignUp.Root>
    </div>
  );
}
