'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useSignIn } from '@clerk/nextjs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  TradFormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LoginWithPhoneSchema,
  LoginWithEmailSchema,
  type LoginInput,
} from '@/schemas/user';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Mail, Phone, CheckCircle2 } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { ROUTES } from '@/schemas/routes';
import Link from 'next/link';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { z } from 'zod';
import { PhoneInput } from '@/components/ui/phone-input';
import { toast } from 'sonner';
import { useCountriesList } from '@/hooks/use-countries';

// Constants
const RESEND_COOLDOWN_SECONDS = 60;
const DEFAULT_REDIRECT_URL = '/my-space';
const OTP_LENGTH = 6;

// Types
type LoginMethod = 'EMAIL' | 'PHONE';
type LoginStep = 'IDENTIFIER' | 'OTP' | 'SUCCESS';

interface ClerkError {
  errors?: Array<{ longMessage?: string }>;
  message?: string;
}

// Enhanced schema factory with better validation
function getLoginSchema(type: LoginMethod, showOTP: boolean) {
  const baseSchema = type === 'EMAIL' ? LoginWithEmailSchema : LoginWithPhoneSchema;
  return baseSchema.extend({
    otp: showOTP
      ? z
          .string()
          .min(OTP_LENGTH, { message: 'messages.errors.opt_min_length' })
          .max(OTP_LENGTH, { message: 'messages.errors.opt_max_length' })
          .regex(/^\d+$/, { message: 'messages.errors.opt_numeric_only' })
      : z.string().optional(),
  });
}

// Error translation utility
const createErrorTranslator = (t: (key: string) => string) => {
  const errorMap = new Map([
    ['Invalid phone number format.', 'errors.invalid_phone'],
    ['Invalid email address format.', 'errors.invalid_email'],
    ['Invalid verification code.', 'errors.invalid_code'],
    ['Verification code expired.', 'errors.code_expired'],
    ['Too many failed attempts.', 'errors.too_many_attempts'],
    ['SignIn not available', 'errors.signin_unavailable'],
    ['SignIn or setActive not available', 'errors.signin_unavailable'],
    ["Couldn't find your account.", 'errors.account_not_found'],
    ['Account not found.', 'errors.account_not_found'],
  ]);

  const keywordPatterns = [
    { keywords: ['invalid', 'phone'], translation: 'errors.invalid_phone' },
    { keywords: ['invalid', 'email'], translation: 'errors.invalid_email' },
    { keywords: ['verification', 'code'], translation: 'errors.invalid_code' },
    { keywords: ['account', 'not found'], translation: 'errors.account_not_found' },
    { keywords: ['too many'], translation: 'errors.too_many_attempts' },
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

// Custom hooks
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

// Main component
export function CustomSignInForm() {
  const router = useRouter();
  const t = useTranslations('auth.login');
  const searchParams = useSearchParams();
  const { signIn, setActive } = useSignIn();

  // State
  const [method, setMethod] = React.useState<LoginMethod>('PHONE');
  const [step, setStep] = React.useState<LoginStep>('IDENTIFIER');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Custom hooks
  const { cooldown, canResend, startCooldown } = useResendCooldown();
  const { countries } = useCountriesList();

  // Computed values
  const callbackUrl = searchParams.get('redirect_url');
  const redirectUrl = callbackUrl ?? DEFAULT_REDIRECT_URL;
  const translateError = React.useMemo(() => createErrorTranslator(t), [t]);

  // Form
  const form = useForm<LoginInput>({
    resolver: zodResolver(getLoginSchema(method, step === 'OTP')),
    defaultValues: {
      type: method,
      email: '',
      otp: '',
      phoneNumber: '',
    },
    mode: 'onChange',
  });

  // Enhanced error extraction
  const extractErrorMessage = React.useCallback(
    (error: unknown): string => {
      if (typeof error === 'string') return error;

      const clerkError = error as ClerkError;
      return (
        clerkError?.errors?.[0]?.longMessage ||
        clerkError?.message ||
        t('errors.unexpected_error')
      );
    },
    [t],
  );

  // Error handling effect
  React.useEffect(() => {
    if (!error) return;

    const translatedError = translateError(error);

    if (step === 'IDENTIFIER') {
      const fieldName = method === 'EMAIL' ? 'email' : 'phoneNumber';
      form.setError(fieldName, { message: translatedError });
    } else {
      form.setError('otp', { message: translatedError });
    }
  }, [error, step, method, form, translateError]);

  // Handlers
  const handleSendOTP = React.useCallback(
    async (identifier: string) => {
      if (!signIn) {
        setError('SignIn not available');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const strategy = method === 'EMAIL' ? 'email_code' : 'phone_code';
        const cleanIdentifier =
          method === 'EMAIL' ? identifier.trim().toLowerCase() : identifier;

        await signIn.create({
          identifier: cleanIdentifier,
          strategy,
        });

        setStep('OTP');
        startCooldown();

        toast.success('Code envoyé', {
          description: t('messages.otp_sent'),
        });
      } catch (error) {
        const errorMessage = extractErrorMessage(error);
        setError(errorMessage);
        toast.error('Erreur', {
          description: translateError(errorMessage),
        });
      } finally {
        setIsLoading(false);
      }
    },
    [signIn, method, startCooldown, t, extractErrorMessage, translateError],
  );

  const handleValidateOTP = React.useCallback(
    async (otp: string) => {
      if (!signIn || !setActive) {
        setError('SignIn or setActive not available');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const strategy = method === 'EMAIL' ? 'email_code' : 'phone_code';

        const result = await signIn.attemptFirstFactor({
          strategy,
          code: otp.trim(),
        });

        if (result.status === 'complete') {
          await setActive({ session: result.createdSessionId });
          setStep('SUCCESS');

          // Small delay for UX, then redirect
          setTimeout(() => {
            router.push(redirectUrl);
          }, 1000);
        } else {
          throw new Error('Validation incomplète');
        }
      } catch (error) {
        const errorMessage = extractErrorMessage(error);
        setError(errorMessage);
        form.setValue('otp', '');
        toast.error('Erreur de validation', {
          description: translateError(errorMessage),
        });
      } finally {
        setIsLoading(false);
      }
    },
    [
      signIn,
      setActive,
      method,
      form,
      router,
      redirectUrl,
      extractErrorMessage,
      translateError,
    ],
  );

  const handleResendOTP = React.useCallback(async () => {
    if (!canResend) return;

    const identifier =
      method === 'EMAIL' ? form.getValues('email') : form.getValues('phoneNumber');

    await handleSendOTP(identifier);
  }, [canResend, method, form, handleSendOTP]);

  const handleGoBack = React.useCallback(() => {
    setStep('IDENTIFIER');
    setError(null);
    form.clearErrors();
    form.setValue('otp', '');
  }, [form]);

  const handleMethodChange = React.useCallback(
    (value: string) => {
      const newMethod = value as LoginMethod;
      setMethod(newMethod);
      setStep('IDENTIFIER');
      setError(null);

      // Reset form with new method
      const newDefaults = {
        type: newMethod,
        email: newMethod === 'EMAIL' ? form.getValues('email') : '',
        phoneNumber: newMethod === 'PHONE' ? form.getValues('phoneNumber') : '',
        otp: '',
      };

      form.reset(newDefaults);
    },
    [form],
  );

  const onSubmit = React.useCallback(
    async (data: LoginInput) => {
      if (step === 'IDENTIFIER') {
        const identifierValue = data.type === 'EMAIL' ? data.email : data.phoneNumber;
        await handleSendOTP(identifierValue);
      } else if (data.otp) {
        await handleValidateOTP(data.otp);
      }
    },
    [step, handleSendOTP, handleValidateOTP],
  );

  // Memoized components
  const SuccessState = React.memo(function SuccessState() {
    return (
      <div className="success-state space-y-6 text-center">
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-800">{t('login_success')}</h3>
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
            <Link href={redirectUrl}>{t('go_to_my_space')}</Link>
          </Button>

          <p className="text-xs text-muted-foreground">{t('auto_redirect_info')}</p>
        </div>
      </div>
    );
  });

  const IdentifierStep = React.memo(function IdentifierStep() {
    return (
      <Tabs value={method} onValueChange={handleMethodChange} className="inputs w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="PHONE" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            {t('tabs.phone')}
          </TabsTrigger>
          <TabsTrigger value="EMAIL" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            {t('tabs.email')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="EMAIL" className="mt-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('inputs.email.label')}</FormLabel>
                <FormControl>
                  <Input
                    autoFocus={method === 'EMAIL'}
                    {...field}
                    type="email"
                    autoComplete="email"
                    placeholder={t('inputs.email.placeholder')}
                    disabled={isLoading}
                  />
                </FormControl>
                <TradFormMessage />
              </FormItem>
            )}
          />
        </TabsContent>

        <TabsContent value="PHONE" className="mt-6">
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('inputs.phone.label')}</FormLabel>
                <FormControl>
                  <PhoneInput
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isLoading}
                    placeholder={t('inputs.phone.placeholder')}
                    countries={countries?.map((country) => country.code as any)}
                    defaultCountry={countries?.[0]?.code as any}
                  />
                </FormControl>
                <TradFormMessage />
              </FormItem>
            )}
          />
        </TabsContent>
      </Tabs>
    );
  });

  const OTPStep = React.memo(function OTPStep() {
    return (
      <div className="otp space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold">{t('access_code')}</h3>
          <p className="text-sm text-muted-foreground mt-2">
            {method === 'PHONE'
              ? t('access_code_phone_description')
              : t('access_code_email_description')}
          </p>
        </div>

        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => (
            <FormItem className="space-y-4">
              <FormControl>
                <div className="flex justify-center">
                  <InputOTP
                    autoFocus
                    maxLength={OTP_LENGTH}
                    {...field}
                    autoComplete="one-time-code"
                    disabled={isLoading}
                  >
                    <InputOTPGroup>
                      {Array.from({ length: OTP_LENGTH }, (_, i) => (
                        <InputOTPSlot key={i} className="w-12 h-12" index={i} />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </FormControl>
              <TradFormMessage />
            </FormItem>
          )}
        />
      </div>
    );
  });

  const ActionButtons = React.memo(function ActionButtons() {
    return (
      <div className="actions flex flex-col gap-4">
        <Button
          variant="default"
          type="submit"
          disabled={isLoading || !form.formState.isValid}
          size="mobile"
          weight="medium"
          fullWidthOnMobile={true}
          loading={isLoading}
          rightIcon={!isLoading ? <ArrowRight className="size-4" /> : undefined}
        >
          {step === 'OTP' ? t('access_space') : t('login_button')}
        </Button>

        {step === 'OTP' && (
          <div className="flex justify-between items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isLoading}
              onClick={handleGoBack}
              leftIcon={<ArrowLeft className="size-4" />}
              className="flex-shrink-0"
            >
              {t('back')}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canResend || isLoading}
              onClick={handleResendOTP}
              className="flex-shrink-0"
            >
              {t('resend_code')}
              {cooldown > 0 && (
                <span className="text-xs text-muted-foreground ml-1">({cooldown}s)</span>
              )}
            </Button>
          </div>
        )}

        {step === 'IDENTIFIER' && (
          <Button
            type="button"
            variant="link"
            size="sm"
            disabled={isLoading}
            className="mx-auto"
            onClick={() => handleMethodChange(method === 'EMAIL' ? 'PHONE' : 'EMAIL')}
          >
            {method === 'EMAIL'
              ? t('login_with_phone_prompt')
              : t('login_with_email_prompt')}
          </Button>
        )}
      </div>
    );
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex flex-col gap-6">
        <div className="flex flex-col gap-6">
          {step === 'SUCCESS' && <SuccessState />}
          {step === 'IDENTIFIER' && <IdentifierStep />}
          {step === 'OTP' && <OTPStep />}
          {(step === 'IDENTIFIER' || step === 'OTP') && <ActionButtons />}

          {step !== 'SUCCESS' && (
            <div className="subactions flex justify-center">
              <p className="text-sm text-muted-foreground">
                <span>{t('no_account')}</span>
                <Link
                  className={
                    buttonVariants({ variant: 'link', size: 'sm' }) + ' !p-0 !h-auto'
                  }
                  href={ROUTES.auth.signup}
                >
                  {t('create_consular_space')}
                </Link>
              </p>
            </div>
          )}
        </div>
      </form>
    </Form>
  );
}
