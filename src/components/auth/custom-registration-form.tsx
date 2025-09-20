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
import {
  ArrowRight,
  Loader2,
  Phone,
  CheckCircle2,
  RefreshCw,
  Clock,
  WifiOff,
  AlertCircle,
} from 'lucide-react';
import { ROUTES } from '@/schemas/routes';
import Link from 'next/link';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/trpc/react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useActiveCountries } from '@/hooks/use-countries';

// Constants
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_RETRY_ATTEMPTS = 3;
const SYNC_TIMEOUT_MS = 30000;
const REDIRECT_DELAY_MS = 1500;

// Types
type RegistrationStep = 'DETAILS' | 'VERIFICATION' | 'SYNCING' | 'SUCCESS';
type SyncState = 'loading' | 'success' | 'error' | 'timeout' | 'retrying';

interface ClerkError {
  errors?: Array<{ longMessage?: string }>;
  message?: string;
}

// Enhanced Schema with better validation
const RegistrationSchema = z.object({
  firstName: z
    .string()
    .min(1, { message: 'First name is required' })
    .max(50, { message: 'First name must be less than 50 characters' })
    .regex(/^[a-zA-ZÀ-ÿ\s-']+$/, { message: 'First name contains invalid characters' }),
  lastName: z
    .string()
    .min(1, { message: 'Last name is required' })
    .max(50, { message: 'Last name must be less than 50 characters' })
    .regex(/^[a-zA-ZÀ-ÿ\s-']+$/, { message: 'Last name contains invalid characters' }),
  emailAddress: z
    .string()
    .email({ message: 'Invalid email address' })
    .max(254, { message: 'Email address is too long' }),
  phoneNumber: z
    .string()
    .min(1, { message: 'Phone number is required' })
    .regex(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number format' }),
  code: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{6}$/.test(val), {
      message: 'Verification code must be 6 digits',
    }),
});

type RegistrationInput = z.infer<typeof RegistrationSchema>;

// Error translation utility
const createErrorTranslator = (t: (key: string) => string) => {
  const errorMap = new Map([
    ['That phone number is taken. Please try another.', 'errors.phone_taken'],
    ['That email address is taken. Please try another.', 'errors.email_taken'],
    ['Invalid phone number format.', 'errors.invalid_phone'],
    [
      'Phone number must be a valid phone number according to E.164 international standard.',
      'errors.invalid_phone_e164',
    ],
    ['Invalid email address format.', 'errors.invalid_email'],
    ['Phone number is required.', 'errors.required_field'],
    ['Email address is required.', 'errors.required_field'],
    ['First name is required.', 'errors.required_field'],
    ['Last name is required.', 'errors.required_field'],
    ['Invalid verification code.', 'errors.invalid_code'],
    ['Verification code expired.', 'errors.code_expired'],
    ['Too many failed attempts.', 'errors.too_many_attempts'],
    ['SignUp not available', 'errors.missing_action'],
    ['SignUp or setActive not available', 'errors.missing_action'],
  ]);

  const keywordPatterns = [
    { keywords: ['phone', 'taken'], translation: 'errors.phone_taken' },
    { keywords: ['email', 'taken'], translation: 'errors.email_taken' },
    { keywords: ['invalid', 'phone'], translation: 'errors.invalid_phone' },
    { keywords: ['invalid', 'email'], translation: 'errors.invalid_email' },
    { keywords: ['verification', 'code'], translation: 'errors.invalid_code' },
  ];

  return (error: string): string => {
    // Exact match
    const exactTranslation = errorMap.get(error);
    if (exactTranslation) return t(exactTranslation);

    // Keyword match
    const lowerError = error.toLowerCase();
    const keywordMatch = keywordPatterns.find(({ keywords }) =>
      keywords.every((keyword) => lowerError.includes(keyword)),
    );

    return keywordMatch ? t(keywordMatch.translation) : error;
  };
};

// Custom hooks for better separation of concerns
const useResendCooldown = (initialCooldown = RESEND_COOLDOWN_SECONDS) => {
  const [cooldown, setCooldown] = React.useState(0);
  const [canResend, setCanResend] = React.useState(true);

  const startCooldown = React.useCallback(() => {
    setCooldown(initialCooldown);
    setCanResend(false);
  }, [initialCooldown]);

  React.useEffect(() => {
    if (cooldown <= 0) return;

    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldown]);

  return { cooldown, canResend, startCooldown };
};

const useSyncManager = () => {
  const [syncState, setSyncState] = React.useState<SyncState>('loading');
  const [errorMessage, setErrorMessage] = React.useState('');
  const [retryCount, setRetryCount] = React.useState(0);
  const [timeoutId, setTimeoutId] = React.useState<NodeJS.Timeout | null>(null);

  const clearLocalTimeout = React.useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  }, [timeoutId]);

  const startTimeout = React.useCallback(() => {
    clearLocalTimeout();
    const id = setTimeout(() => setSyncState('timeout'), SYNC_TIMEOUT_MS);
    setTimeoutId(id);
  }, [clearLocalTimeout]);

  const retry = React.useCallback(() => {
    setRetryCount((prev) => prev + 1);
    setSyncState('retrying');
    setErrorMessage('');
  }, []);

  const reset = React.useCallback(() => {
    clearLocalTimeout();
    setRetryCount(0);
    setErrorMessage('');
  }, [clearTimeout]);

  React.useEffect(() => {
    return () => clearLocalTimeout();
  }, [clearLocalTimeout]);

  return {
    syncState,
    setSyncState,
    errorMessage,
    setErrorMessage,
    retryCount,
    startTimeout,
    retry,
    reset,
    clearLocalTimeout,
  };
};

// Main component
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

  // Custom hooks
  const { cooldown, canResend, startCooldown } = useResendCooldown();
  const syncManager = useSyncManager();

  // API
  const { countries } = useActiveCountries();
  const { mutate: syncUser, isPending: isSyncPending } =
    api.auth.handleNewUser.useMutation({
      onSuccess: () => {
        syncManager.clearLocalTimeout();
        syncManager.setSyncState('success');
        setTimeout(() => setStep('SUCCESS'), REDIRECT_DELAY_MS);
      },
      onError: (error) => {
        syncManager.clearLocalTimeout();
        syncManager.setSyncState('error');
        syncManager.setErrorMessage(
          error.message || "Une erreur inattendue s'est produite",
        );
      },
    });

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

  // Error translator
  const translateError = React.useMemo(() => createErrorTranslator(t), [t]);

  // Auto-retry on connection restore
  React.useEffect(() => {
    const handleOnline = () => {
      if (syncManager.syncState === 'error' && navigator.onLine) {
        handleSyncRetry();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [syncManager.syncState]);

  // Error handling effect
  React.useEffect(() => {
    if (!error) return;

    const translatedError = translateError(error);

    if (step === 'DETAILS') {
      const errorLower = error.toLowerCase();
      if (errorLower.includes('email')) {
        form.setError('emailAddress', { message: translatedError });
      } else if (errorLower.includes('phone')) {
        form.setError('phoneNumber', { message: translatedError });
      } else if (errorLower.includes('first')) {
        form.setError('firstName', { message: translatedError });
      } else if (errorLower.includes('last')) {
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
  }, [error, step, form, translateError, toast]);

  // Enhanced error extraction
  const extractErrorMessage = (error: unknown): string => {
    if (typeof error === 'string') return error;

    const clerkError = error as ClerkError;
    return (
      clerkError?.errors?.[0]?.longMessage ||
      clerkError?.message ||
      "Une erreur inattendue s'est produite"
    );
  };

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
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        emailAddress: data.emailAddress.trim().toLowerCase(),
        phoneNumber: data.phoneNumber,
      });

      await signUp.preparePhoneNumberVerification({ strategy: 'phone_code' });

      setStep('VERIFICATION');
      startCooldown();
      toast({
        title: 'Code envoyé',
        description: t('verification_code_sent'),
      });
    } catch (error) {
      setError(extractErrorMessage(error));
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
      const result = await signUp.attemptPhoneNumberVerification({ code });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        setStep('SYNCING');
        syncManager.setSyncState('loading');

        // Start sync process with delay
        setTimeout(() => {
          if (result.createdUserId) {
            syncUser({ clerkId: result.createdUserId });
            syncManager.startTimeout();
          }
        }, 500);
      } else {
        throw new Error('Verification incomplète');
      }
    } catch (error) {
      setError(extractErrorMessage(error));
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
      startCooldown();
      toast({
        title: 'Code renvoyé',
        description: t('verification_code_sent'),
      });
    } catch (error) {
      setError(extractErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncRetry = React.useCallback(() => {
    if (!user || syncManager.retryCount >= MAX_RETRY_ATTEMPTS) return;

    syncManager.retry();

    setTimeout(() => {
      syncUser({ clerkId: user.id });
      syncManager.setSyncState('loading');
      syncManager.startTimeout();
    }, 500);
  }, [user, syncUser, syncManager]);

  const onSubmit = async (data: RegistrationInput) => {
    if (step === 'DETAILS') {
      await handleCreateAccount(data);
    } else if (step === 'VERIFICATION' && data.code) {
      await handleVerifyCode(data.code);
    }
  };

  // Enhanced sync status component
  const SyncStatusComponent = React.memo(function SyncStatusComponent() {
    const isNetworkError =
      !navigator.onLine ||
      syncManager.errorMessage.includes('network') ||
      syncManager.errorMessage.includes('connexion');

    switch (syncManager.syncState) {
      case 'loading':
        return (
          <div className="w-full flex flex-col justify-center gap-4 items-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="text-center space-y-2">
              <p className="text-lg font-medium">Création de votre espace consulaire</p>
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
              <p className="text-lg font-medium">Nouvelle tentative en cours...</p>
              <p className="text-sm text-muted-foreground">
                Tentative {syncManager.retryCount}/{MAX_RETRY_ATTEMPTS}
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
              <p className="text-sm text-muted-foreground">Redirection en cours...</p>
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
                La création de votre espace prend plus de temps que prévu. Veuillez
                réessayer ou vérifier votre connexion internet.
              </AlertDescription>
            </Alert>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={handleSyncRetry}
                disabled={isSyncPending || syncManager.retryCount >= MAX_RETRY_ATTEMPTS}
                className="flex-1 sm:flex-none"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
            </div>
          </div>
        );

      case 'error':
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
                <p>{syncManager.errorMessage}</p>
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
                disabled={isSyncPending || syncManager.retryCount >= MAX_RETRY_ATTEMPTS}
                className="flex-1 sm:flex-none"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {syncManager.retryCount >= MAX_RETRY_ATTEMPTS
                  ? 'Limite atteinte'
                  : 'Réessayer'}
              </Button>

              {syncManager.retryCount >= MAX_RETRY_ATTEMPTS && (
                <Button
                  variant="outline"
                  onClick={() => router.push(ROUTES.base)}
                  className="flex-1 sm:flex-none"
                >
                  Retour à l&apos;accueil
                </Button>
              )}
            </div>

            {syncManager.retryCount > 0 && (
              <p className="text-xs text-center text-muted-foreground">
                Tentatives: {syncManager.retryCount}/{MAX_RETRY_ATTEMPTS}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  });

  return (
    <div className="flex flex-col w-full grow items-center sm:justify-center">
      <div id="clerk-captcha"></div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
          {step === 'SYNCING' && (
            <div className="w-full space-y-4">
              <SyncStatusComponent />
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
                          autoComplete="given-name"
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
                          autoComplete="family-name"
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
                          autoComplete="email"
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
                    {cooldown > 0
                      ? t('resend_code_fallback', { seconds: cooldown })
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
