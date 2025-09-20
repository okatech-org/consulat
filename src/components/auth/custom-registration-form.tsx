'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useSignUp, useUser } from '@clerk/nextjs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  TradFormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2, Phone, CheckCircle2, RefreshCw, Clock, WifiOff, AlertCircle } from 'lucide-react';
import { ROUTES } from '@/schemas/routes';
import Link from 'next/link';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { getActiveCountries } from '@/actions/countries';
import type { Country } from '@prisma/client';
import { api } from '@/trpc/react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Types
type RegistrationStep = 'DETAILS' | 'VERIFICATION' | 'SYNCING' | 'SUCCESS';
type SyncState = 'loading' | 'success' | 'error' | 'timeout' | 'retrying';

// Schema
const RegistrationSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  emailAddress: z.string().email({ message: 'Invalid email address' }),
  phoneNumber: z.string().min(1, { message: 'Phone number is required' }),
  code: z.string().optional(),
});

type RegistrationInput = z.infer<typeof RegistrationSchema>;

// Function to translate Clerk errors
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

  // Search for exact translation
  if (errorTranslations[error]) {
    return errorTranslations[error];
  }

  // Search for keywords for partial translations
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

  // Return original message if no translation found
  return error;
}

export function CustomRegistrationForm() {
  const router = useRouter();
  const t = useTranslations('auth.signup');
  const { toast } = useToast();
  const { signUp, setActive } = useSignUp();
  const { user } = useUser();

  // State
  const [step, setStep] = React.useState<RegistrationStep>('DETAILS');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = React.useState(0);
  const [canResend, setCanResend] = React.useState(true);
  const [countries, setCountries] = React.useState<Country[]>([]);

  // Sync state
  const [syncState, setSyncState] = React.useState<SyncState>('loading');
  const [syncErrorMessage, setSyncErrorMessage] = React.useState<string>('');
  const [retryCount, setRetryCount] = React.useState(0);
  const [timeoutId, setTimeoutId] = React.useState<NodeJS.Timeout | null>(null);

  // Sync mutation
  const { mutate: syncUser, isPending: isSyncPending } = api.auth.handleNewUser.useMutation({
    onSuccess: () => {
      if (timeoutId) clearTimeout(timeoutId);
      setSyncState('success');
      setTimeout(() => {
        setStep('SUCCESS');
      }, 1500);
    },
    onError: (error) => {
      if (timeoutId) clearTimeout(timeoutId);
      setSyncState('error');
      setSyncErrorMessage(error.message || 'Une erreur inattendue s\'est produite');
    },
  });

  // Load countries
  React.useEffect(() => {
    getActiveCountries().then(setCountries).catch(() => {
      setCountries([]);
    });
  }, []);


  // Form
  const form = useForm<RegistrationInput>({
    resolver: zodResolver(RegistrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      emailAddress: '',
      phoneNumber: '',
      code: '',
    },
    mode: 'onChange',
  });

  // Cooldown effect
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Sync retry handler
  const handleSyncRetry = React.useCallback(() => {
    if (!user) return;

    setRetryCount(prev => prev + 1);
    setSyncState('retrying');
    setSyncErrorMessage('');

    setTimeout(() => {
      syncUser({ clerkId: user.id });
      setSyncState('loading');

      const timeout = setTimeout(() => {
        setSyncState('timeout');
      }, 30000);
      setTimeoutId(timeout);
    }, 500);
  }, [user, syncUser]);

  // Auto-retry on connection restore
  React.useEffect(() => {
    const handleOnline = () => {
      if (syncState === 'error' && navigator.onLine) {
        handleSyncRetry();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [syncState, handleSyncRetry]);

  // Error handling effect
  React.useEffect(() => {
    if (error) {
      const translatedError = translateClerkError(error, t);
      if (step === 'DETAILS') {
        // Try to set error on the appropriate field
        if (error.toLowerCase().includes('email')) {
          form.setError('emailAddress', { message: translatedError });
        } else if (error.toLowerCase().includes('phone')) {
          form.setError('phoneNumber', { message: translatedError });
        } else if (error.toLowerCase().includes('first')) {
          form.setError('firstName', { message: translatedError });
        } else if (error.toLowerCase().includes('last')) {
          form.setError('lastName', { message: translatedError });
        } else {
          toast({
            title: 'Erreur',
            description: translatedError,
            variant: 'destructive',
          });
        }
      } else {
        form.setError('code', { message: translatedError });
      }
    }
  }, [error, step, form, t, toast]);

  // Handlers
  const handleCreateAccount = async (data: RegistrationInput) => {
    if (!signUp) {
      setError('SignUp not available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await signUp.create({
        firstName: data.firstName,
        lastName: data.lastName,
        emailAddress: data.emailAddress,
        phoneNumber: data.phoneNumber,
      });

      await signUp.preparePhoneNumberVerification({ strategy: 'phone_code' });

      setStep('VERIFICATION');
      setResendCooldown(60);
      setCanResend(false);
      toast({
        title: 'Code envoyé',
        description: t('verification_code_sent'),
      });
    } catch (error: unknown) {
      const errorMessage =
        (error as { errors?: Array<{ longMessage?: string }> })?.errors?.[0]?.longMessage ||
        (error as { message?: string })?.message ||
        'Erreur lors de la création du compte';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (code: string) => {
    if (!signUp || !setActive) {
      setError('SignUp or setActive not available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await signUp.attemptPhoneNumberVerification({
        code,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        setStep('SYNCING');
        setSyncState('loading');

        // Start sync process
        setTimeout(() => {
          if (result.createdUserId) {
            syncUser({ clerkId: result.createdUserId });

            const timeout = setTimeout(() => {
              setSyncState('timeout');
            }, 30000);
            setTimeoutId(timeout);
          }
        }, 500);
      } else {
        throw new Error('Verification incomplète');
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { errors?: Array<{ longMessage?: string }> })?.errors?.[0]?.longMessage ||
        (error as { message?: string })?.message ||
        'Erreur de vérification';
      setError(errorMessage);
      form.setValue('code', '');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend || !signUp) return;

    setIsLoading(true);
    setError(null);

    try {
      await signUp.preparePhoneNumberVerification({ strategy: 'phone_code' });
      setResendCooldown(60);
      setCanResend(false);
      toast({
        title: 'Code renvoyé',
        description: t('verification_code_sent'),
      });
    } catch (error: unknown) {
      const errorMessage =
        (error as { errors?: Array<{ longMessage?: string }> })?.errors?.[0]?.longMessage ||
        (error as { message?: string })?.message ||
        'Erreur lors du renvoi';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: RegistrationInput) => {
    if (step === 'DETAILS') {
      await handleCreateAccount(data);
    } else if (step === 'VERIFICATION' && data.code) {
      await handleVerifyCode(data.code);
    }
  };

  // Render sync status
  const renderSyncStatus = () => {
    switch (syncState) {
      case 'loading':
        return (
          <div className="w-full flex flex-col justify-center gap-4 items-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="text-center space-y-2">
              <p className="text-lg font-medium">
                Création de votre espace consulaire
              </p>
              <p className="text-sm text-muted-foreground">
                Veuillez patienter, cela peut prendre quelques instants...
              </p>
            </div>
          </div>
        );

      case 'retrying':
        return (
          <div className="w-full flex flex-col justify-center gap-4 items-center">
            <RefreshCw className="h-12 w-12 animate-spin text-primary" />
            <div className="text-center space-y-2">
              <p className="text-lg font-medium">
                Nouvelle tentative en cours...
              </p>
              <p className="text-sm text-muted-foreground">
                Tentative {retryCount}/3
              </p>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="w-full flex flex-col justify-center gap-4 items-center">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <div className="text-center space-y-2">
              <p className="text-lg font-medium text-green-700">
                Espace consulaire créé avec succès !
              </p>
              <p className="text-sm text-muted-foreground">
                Redirection en cours...
              </p>
            </div>
          </div>
        );

      case 'timeout':
        return (
          <div className="w-full space-y-4">
            <Alert variant="destructive">
              <Clock className="h-4 w-4" />
              <AlertTitle>Délai d&apos;attente dépassé</AlertTitle>
              <AlertDescription>
                La création de votre espace prend plus de temps que prévu.
                Veuillez réessayer ou vérifier votre connexion internet.
              </AlertDescription>
            </Alert>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={handleSyncRetry}
                disabled={isSyncPending}
                className="flex-1 sm:flex-none"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
            </div>
          </div>
        );

      case 'error': {
        const isNetworkError = !navigator.onLine || syncErrorMessage.includes('network') || syncErrorMessage.includes('connexion');

        return (
          <div className="w-full space-y-4">
            <Alert variant="destructive">
              {isNetworkError ? (
                <WifiOff className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>
                {isNetworkError ? 'Problème de connexion' : 'Erreur de synchronisation'}
              </AlertTitle>
              <AlertDescription className="space-y-2">
                <p>{syncErrorMessage}</p>
                {isNetworkError && (
                  <p className="text-sm">
                    Vérifiez votre connexion internet et réessayez.
                  </p>
                )}
              </AlertDescription>
            </Alert>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={handleSyncRetry}
                disabled={isSyncPending || retryCount >= 3}
                className="flex-1 sm:flex-none"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {retryCount >= 3 ? 'Limite atteinte' : 'Réessayer'}
              </Button>

              {retryCount >= 3 && (
                <Button
                  variant="outline"
                  onClick={() => router.push(ROUTES.base)}
                  className="flex-1 sm:flex-none"
                >
                  Retour à l'accueil
                </Button>
              )}
            </div>

            {retryCount > 0 && (
              <p className="text-xs text-center text-muted-foreground">
                Tentatives: {retryCount}/3
              </p>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col w-full grow items-center sm:justify-center">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
          {step === 'SYNCING' && (
            <div className="w-full space-y-4">
              {renderSyncStatus()}
            </div>
          )}

          {step === 'SUCCESS' && (
            <div className="success-state space-y-6 text-center">
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-800">
                    {t('registration_success')}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    {t('redirecting_message')}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  asChild
                  size="mobile"
                  weight="medium"
                  fullWidthOnMobile={true}
                  variant="default"
                  leftIcon={<CheckCircle2 className="size-4" />}
                  rightIcon={<ArrowRight className="size-4" />}
                >
                  <Link href={ROUTES.user.profile_form}>{t('continue_setup')}</Link>
                </Button>
              </div>
            </div>
          )}

          {step === 'DETAILS' && (
            <div className="w-full space-y-4">
              <div className="flex flex-col gap-y-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('fields.firstName')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          placeholder={t('placeholders.firstName')}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <TradFormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('fields.lastName')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          placeholder={t('placeholders.lastName')}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <TradFormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emailAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('fields.email')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder={t('placeholders.email')}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <TradFormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('fields.phoneNumber')}</FormLabel>
                      <FormControl>
                        <PhoneInput
                          value={field.value}
                          onChange={field.onChange}
                          disabled={isLoading}
                          placeholder={t('placeholders.phoneNumber')}
                          countries={countries?.map((country) => country.code as any)}
                          defaultCountry={countries?.[0]?.code as any}
                        />
                      </FormControl>
                      <TradFormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col w-full gap-y-4">
                <Button
                  type="submit"
                  disabled={isLoading || !form.formState.isValid}
                  className="w-full"
                >
                  {isLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    t('create_account_button')
                  )}
                </Button>

                <Button variant="link" size="sm" asChild>
                  <Link href="/sign-in">
                    {t('already_have_account')} {t('sign_in_link')}
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {step === 'VERIFICATION' && (
            <div className="w-full space-y-4">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <Phone className="h-5 w-5" />
                  {t('verify_phone_title')}
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {t('verify_phone_description')}
                </p>
              </div>

              <div className="flex flex-col gap-y-4">
                <div className="flex flex-col items-center justify-center gap-y-2">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormControl>
                          <div className="flex justify-center text-center">
                            <InputOTP
                              autoFocus
                              maxLength={6}
                              {...field}
                              autoComplete="one-time-code"
                              disabled={isLoading}
                            >
                              <InputOTPGroup>
                                <InputOTPSlot className="w-12 h-12" index={0} />
                                <InputOTPSlot className="w-12 h-12" index={1} />
                                <InputOTPSlot className="w-12 h-12" index={2} />
                                <InputOTPSlot className="w-12 h-12" index={3} />
                                <InputOTPSlot className="w-12 h-12" index={4} />
                                <InputOTPSlot className="w-12 h-12" index={5} />
                              </InputOTPGroup>
                            </InputOTP>
                          </div>
                        </FormControl>
                        <TradFormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    disabled={!canResend || isLoading}
                    onClick={handleResendCode}
                  >
                    {resendCooldown > 0
                      ? t('resend_code_fallback', { seconds: resendCooldown })
                      : t('resend_code')}
                  </Button>
                </div>
              </div>

              <div className="flex flex-col w-full gap-y-4">
                <Button
                  type="submit"
                  disabled={isLoading || !form.getValues('code')}
                  className="w-full"
                >
                  {isLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    t('verify_button')
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}