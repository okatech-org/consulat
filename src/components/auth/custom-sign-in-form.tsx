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
import { getActiveCountries } from '@/actions/countries';
import type { Country } from '@prisma/client';
import { toast } from 'sonner';

// Types
type LoginMethod = 'EMAIL' | 'PHONE';
type LoginStep = 'IDENTIFIER' | 'OTP' | 'SUCCESS';

// Schema factory
function getLoginSchema(type: LoginMethod, showOTP: boolean) {
  const baseSchema = type === 'EMAIL' ? LoginWithEmailSchema : LoginWithPhoneSchema;
  return baseSchema.extend({
    otp: showOTP
      ? z.string().min(6, { message: 'messages.errors.opt_min_length' })
      : z.string().optional(),
  });
}

export function CustomSignInForm() {
  const router = useRouter();
  const t = useTranslations('auth.login');
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('redirect_url');
  const redirectUrl = callbackUrl ?? '/my-space';
  const { signIn, setActive } = useSignIn();

  // State
  const [method, setMethod] = React.useState<LoginMethod>('PHONE');
  const [step, setStep] = React.useState<LoginStep>('IDENTIFIER');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = React.useState(0);
  const [canResend, setCanResend] = React.useState(true);
  const [countries, setCountries] = React.useState<Country[]>([]);

  // Load countries
  React.useEffect(() => {
    getActiveCountries()
      .then(setCountries)
      .catch(() => {
        setCountries([]);
      });
  }, []);

  // Form
  const form = useForm<LoginInput>({
    resolver: zodResolver(getLoginSchema(method, step === 'OTP')),
    defaultValues: { type: method, email: '', otp: '', phoneNumber: '' },
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

  // Error handling effect
  React.useEffect(() => {
    if (error) {
      if (step === 'IDENTIFIER') {
        const fieldName = method === 'EMAIL' ? 'email' : 'phoneNumber';
        form.setError(fieldName, { message: error });
      } else {
        form.setError('otp', { message: error });
      }
    }
  }, [error, step, method, form]);

  // Handlers
  const handleSendOTP = async (identifier: string) => {
    if (!signIn) {
      setError('SignIn not available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await signIn.create({
        identifier: identifier,
        strategy: method === 'EMAIL' ? 'email_code' : 'phone_code',
      });

      setStep('OTP');
      setResendCooldown(60);
      setCanResend(false);
      toast.success('Code envoyé', {
        description: t('messages.otp_sent'),
      });
    } catch (error: unknown) {
      const errorMessage =
        (error as any)?.errors?.[0]?.longMessage ||
        (error as any)?.message ||
        t('errors.send_otp_failed');
      setError(errorMessage);
      toast.error('Erreur', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateOTP = async (otp: string) => {
    if (!signIn || !setActive) {
      setError('SignIn or setActive not available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: method === 'EMAIL' ? 'email_code' : 'phone_code',
        code: otp,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        setStep('SUCCESS');
        router.push(redirectUrl);
        router.refresh();
      } else {
        throw new Error('Validation incomplète');
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as any)?.errors?.[0]?.longMessage ||
        (error as any)?.message ||
        'Erreur de validation';
      setError(errorMessage);
      form.setValue('otp', '');
      toast.error('Erreur de validation', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    const identifier =
      method === 'EMAIL' ? form.getValues('email') : form.getValues('phoneNumber');
    await handleSendOTP(identifier);
  };

  const handleGoBack = () => {
    setStep('IDENTIFIER');
    setError(null);
    form.clearErrors();
  };

  const handleMethodChange = (value: string) => {
    const newMethod = value as LoginMethod;
    setMethod(newMethod);
    setStep('IDENTIFIER');
    setError(null);
    form.reset();
    if (newMethod === 'EMAIL') {
      form.setValue('type', 'EMAIL');
      form.setValue('email', '');
    } else {
      form.setValue('type', 'PHONE');
      form.setValue('phoneNumber', '');
    }
  };

  const onSubmit = async (data: LoginInput) => {
    if (step === 'IDENTIFIER') {
      const identifierValue = data.type === 'EMAIL' ? data.email : data.phoneNumber;
      await handleSendOTP(identifierValue);
    } else if (data.otp) {
      await handleValidateOTP(data.otp);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex flex-col gap-6">
        <div className="flex flex-col gap-6">
          {step === 'SUCCESS' && (
            <div className="success-state space-y-6 text-center">
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-800">
                    {t('login_success')}
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
                  <Link href={redirectUrl}>{t('go_to_my_space')}</Link>
                </Button>

                <p className="text-xs text-muted-foreground">{t('auto_redirect_info')}</p>
              </div>
            </div>
          )}

          {step === 'IDENTIFIER' && (
            <Tabs
              value={method}
              onValueChange={handleMethodChange}
              className="inputs w-full"
            >
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
          )}

          {step === 'OTP' && (
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
            </div>
          )}

          {(step === 'IDENTIFIER' || step === 'OTP') && (
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
                    {resendCooldown > 0 && (
                      <span className="text-xs text-muted-foreground ml-1">
                        ({resendCooldown}s)
                      </span>
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
                  onClick={() =>
                    handleMethodChange(method === 'EMAIL' ? 'PHONE' : 'EMAIL')
                  }
                >
                  {method === 'EMAIL'
                    ? t('login_with_phone_prompt')
                    : t('login_with_email_prompt')}
                </Button>
              )}
            </div>
          )}

          {step !== 'SUCCESS' && (
            <div className="subactions flex justify-center">
              <p className="text-sm text-muted-foreground">
                <span>{t('no_account')}</span>
                <Link
                  className={
                    buttonVariants({ variant: 'link', size: 'sm' }) + ' !p-0 !h-auto'
                  }
                  href={ROUTES.registration}
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
