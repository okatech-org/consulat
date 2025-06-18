'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  TradFormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import {
  LoginWithPhoneSchema,
  LoginWithEmailSchema,
  type LoginInput,
} from '@/schemas/user';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { ErrorMessageKey, tryCatch } from '@/lib/utils';
import { ROUTES } from '@/schemas/routes';
import Link from 'next/link';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { ErrorCard } from '@/components/ui/error-card';
import { z } from 'zod';
import { PhoneNumberInput } from '@/components/ui/phone-number';
import { authClient } from '@/lib/auth/auth-client';

function getLoginSchema(type: 'EMAIL' | 'PHONE', showOTP: boolean) {
  if (type === 'EMAIL') {
    return LoginWithEmailSchema.extend({
      otp: showOTP
        ? z
            .string({
              invalid_type_error: 'messages.errors.opt_min_length',
              required_error: 'messages.errors.opt_min_length',
            })
            .min(6, {
              message: 'messages.errors.opt_min_length',
            })
        : z
            .string({
              invalid_type_error: 'messages.errors.opt_min_length',
            })
            .optional(),
    });
  }
  return LoginWithPhoneSchema.extend({
    otp: showOTP
      ? z
          .string({
            invalid_type_error: 'messages.errors.opt_min_length',
            required_error: 'messages.errors.opt_min_length',
          })
          .min(6, {
            message: 'messages.errors.opt_min_length',
          })
      : z
          .string({
            invalid_type_error: 'messages.errors.opt_min_length',
          })
          .optional(),
  });
}

export function LoginForm() {
  const t = useTranslations('auth.login');
  const tError = useTranslations('messages.errors');
  const router = useRouter();
  const searchParams = useSearchParams();
  const authError = searchParams.get('error') as ErrorMessageKey | null;
  const callbackUrl = searchParams.get('callbackUrl');

  const [method, setMethod] = React.useState<'EMAIL' | 'PHONE'>('PHONE');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isOTPSent, setIsOTPSent] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = React.useState(0);
  const [canResend, setCanResend] = React.useState(true);

  const form = useForm<LoginInput>({
    resolver: zodResolver(getLoginSchema(method, isOTPSent)),
    defaultValues: {
      type: method,
      email: '',
      otp: '',
      phoneNumber: '+33-',
    },
  });

  // Cooldown timer for resend
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

  const sendOTPCode = async (identifier: string, type: 'EMAIL' | 'PHONE') => {
    setIsLoading(true);
    setError(null);

    if (type === 'EMAIL') {
      const response = await tryCatch(
        authClient.emailOtp.sendVerificationOtp({
          email: identifier,
          type: 'sign-in',
        }),
      );

      if (response.error) {
        setError(
          response.error instanceof Error ? response.error.message : 'Failed to send OTP',
        );
        setIsLoading(false);
        return;
      }
    }

    if (type === 'PHONE') {
      const response = await tryCatch(
        authClient.phoneNumber.sendOtp({
          phoneNumber: identifier,
        }),
      );

      if (response.error) {
        setError(
          response.error instanceof Error ? response.error.message : 'Failed to send OTP',
        );
        setIsLoading(false);
        return;
      }
    }

    setIsOTPSent(true);
    setCanResend(false);
    setResendCooldown(60);
    setIsLoading(false);
  };

  const validateOTP = async (otp: string) => {
    setIsLoading(true);
    setError(null);
    let hasError = false;

    if (method === 'EMAIL') {
      const response = await authClient.signIn.emailOtp({
        email: form.getValues('email'),
        otp,
      });

      console.log('response signIn.emailOtp', response);

      if (response.error) {
        setError(
          response.error instanceof Error
            ? response.error.message
            : 'Votre code de vérification est invalide ou expiré, veuillez réessayer ou renvoyer un nouveau code.',
        );
        setIsLoading(false);
        hasError = true;
        return;
      }
    }

    if (method === 'PHONE') {
      const response = await authClient.phoneNumber.verify({
        phoneNumber: form.getValues('phoneNumber'),
        code: otp,
      });

      if (response.error) {
        setError(
          response.error instanceof Error
            ? response.error.message
            : 'Votre code de vérification est invalide ou expiré, veuillez réessayer ou renvoyer un nouveau code.',
        );
        setIsLoading(false);
        hasError = true;
        return;
      }
    }

    if (!hasError) {
      router.push(callbackUrl ?? ROUTES.base);
      setIsLoading(false);
    }
  };

  const resendOTP = async () => {
    if (!canResend) return;

    const identifier =
      method === 'EMAIL' ? form.getValues('email') : form.getValues('phoneNumber');
    await sendOTPCode(identifier, method);
  };

  const goBack = () => {
    setIsOTPSent(false);
    setError(null);
    form.clearErrors();
  };

  const onSubmit = async (data: LoginInput) => {
    if (!isOTPSent) {
      const identifierValue = data.type === 'EMAIL' ? data.email : data.phoneNumber;
      await sendOTPCode(identifierValue, data.type);
    } else {
      if (data.otp) {
        await validateOTP(data.otp);
      }
    }
  };

  // Handle method change
  const handleMethodChange = (value: string) => {
    setMethod(value as 'EMAIL' | 'PHONE');
    setIsOTPSent(false);
    setError(null);
    form.reset();
    if (value === 'EMAIL') {
      form.setValue('type', 'EMAIL');
      form.setValue('email', '');
    } else {
      form.setValue('type', 'PHONE');
      form.setValue('phoneNumber', '+33-');
    }
  };

  // Display errors in the form
  React.useEffect(() => {
    if (error) {
      if (!isOTPSent) {
        // Error when sending OTP
        const fieldName = method === 'EMAIL' ? 'email' : 'phoneNumber';
        form.setError(fieldName, { message: error });
      } else if (isOTPSent) {
        // Error when validating OTP
        form.setError('otp', { message: error });
      }
    }
  }, [error, isOTPSent, method, form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={'w-full flex flex-col gap-6'}
      >
        <div className="flex flex-col gap-6">
          {!isOTPSent && (
            <Tabs
              value={method}
              onValueChange={handleMethodChange}
              className="inputs w-full"
            >
              <TabsContent value="EMAIL">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('inputs.email.label')}</FormLabel>
                      <FormControl>
                        <Input
                          autoFocus={true}
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

              <TabsContent value="PHONE">
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('inputs.phone.label')}</FormLabel>
                      <FormControl>
                        <PhoneNumberInput
                          value={field.value}
                          onChangeAction={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <TradFormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>
          )}

          {isOTPSent && (
            <div className="otp">
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <FormLabel className="text-xl font-semibold">
                      {t('access_code')}
                    </FormLabel>
                    <FormControl>
                      <InputOTP
                        autoFocus
                        maxLength={6}
                        {...field}
                        autoComplete="one-time-code"
                        disabled={isLoading}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot className="w-12" index={0} />
                          <InputOTPSlot className="w-12" index={1} />
                          <InputOTPSlot className="w-12" index={2} />
                          <InputOTPSlot className="w-12" index={3} />
                          <InputOTPSlot className="w-12" index={4} />
                          <InputOTPSlot className="w-12" index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormDescription>
                      {method === 'PHONE'
                        ? t('access_code_phone_description')
                        : t('access_code_email_description')}
                    </FormDescription>
                    <TradFormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <div className="actions flex flex-col gap-4">
            <Button
              variant="default"
              type="submit"
              disabled={isLoading || !form.formState.isValid}
            >
              <span>{isOTPSent ? t('access_space') : t('login_button')}</span>
              {!isLoading && <ArrowRight className="size-icon" />}
              {isLoading && <Loader2 className="size-icon animate-spin" />}
            </Button>

            {isOTPSent && (
              <div className="flex justify-between items-center">
                <Button
                  type="button"
                  variant="link"
                  className="text-muted-foreground p-0"
                  disabled={isLoading}
                  onClick={goBack}
                >
                  <ArrowLeft className="size-icon" />
                  {t('back')}
                </Button>
                <Button
                  variant="link"
                  className="text-muted-foreground p-0"
                  disabled={!canResend || isLoading}
                  onClick={resendOTP}
                >
                  {t('resend_code')}
                  {resendCooldown > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {t('resend_cooldown', { cooldown: resendCooldown })}
                    </span>
                  )}
                </Button>
              </div>
            )}

            {!isOTPSent && (
              <Button
                type="button"
                variant="link"
                disabled={isLoading}
                className="max-w-fit mx-auto"
                onClick={() => handleMethodChange(method === 'EMAIL' ? 'PHONE' : 'EMAIL')}
              >
                <span className="text-muted-foreground">
                  {method === 'EMAIL'
                    ? t('login_with_phone_prompt')
                    : t('login_with_email_prompt')}
                </span>
              </Button>
            )}
          </div>

          {authError && <ErrorCard description={tError('auth_error')} />}

          <div className="subactions flex justify-center">
            <p className="text-sm text-muted-foreground">
              <span>{t('no_account')}</span>
              <Link
                className={buttonVariants({ variant: 'link' }) + ' !p-0'}
                href={ROUTES.registration}
              >
                {t('create_consular_space')}
              </Link>
            </p>
          </div>
        </div>
      </form>
    </Form>
  );
}
