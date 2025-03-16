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
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { isUserExists, sendOTP } from '@/actions/auth';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { ErrorMessageKey, tryCatch } from '@/lib/utils';
import { PhoneInput } from '@/components/ui/phone-input';
import { ROUTES } from '@/schemas/routes';
import Link from 'next/link';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { ErrorCard } from '@/components/ui/error-card';
import { validateOTP } from '@/lib/user/otp';
import { z } from 'zod';

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
  const router = useRouter();
  const t = useTranslations('auth.login');
  const tError = useTranslations('messages.errors');
  const searchParams = useSearchParams();
  const [displayOTP, setDisplayOTP] = React.useState(false);
  const authError = searchParams.get('error') as ErrorMessageKey | null;
  const [isLoading, setIsLoading] = React.useState(false);
  const [method, setMethod] = React.useState<'EMAIL' | 'PHONE'>('PHONE');
  const [resendCooldown, setResendCooldown] = React.useState(0);

  const form = useForm<LoginInput>({
    resolver: zodResolver(getLoginSchema(method, displayOTP)),
    defaultValues: {
      type: method,
      email: '',
      otp: '',
      phone: {
        countryCode: '+33',
        number: '',
      },
    },
  });

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    const data = form.getValues();
    const identifier =
      data.type === 'EMAIL'
        ? data.email
        : `${data.phone?.countryCode}${data.phone?.number}`;

    setIsLoading(true);
    const { error: sendOTPError, data: sendOTPData } = await tryCatch(
      sendOTP(identifier ?? '', data.type),
    );

    if (sendOTPError) {
      toast({
        title: t('messages.code_not_sent_otp'),
        variant: 'destructive',
      });
    }

    if (sendOTPData) {
      toast({
        title: t('messages.otp_sent'),
        variant: 'success',
      });
      setResendCooldown(60); // 60 seconds cooldown
    }

    setIsLoading(false);
  };

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    const identifier =
      data.type === 'EMAIL'
        ? data.email
        : `${data.phone?.countryCode}${data.phone?.number}`;

    if (!displayOTP && data.type === 'EMAIL') {
      const isExist = await isUserExists(undefined, data.email);
      if (!isExist) {
        form.setError('email', {
          message: 'messages.errors.no_user_found_with_email',
        });
        setIsLoading(false);
        return;
      }
    }

    if (!displayOTP && data.type === 'PHONE') {
      const isExist = await isUserExists(undefined, undefined, data.phone);
      if (!isExist) {
        form.setError('phone.number', {
          message: 'messages.errors.no_user_found_with_phone',
        });
        setIsLoading(false);
        return;
      }
    }

    if (!displayOTP) {
      // Envoyer l'OTP
      const { error: sendOTPError, data: sendOTPData } = await tryCatch(
        sendOTP(identifier ?? '', data.type),
      );

      if (sendOTPError) {
        toast({
          title: tError('code_not_sent_otp'),
          variant: 'destructive',
        });
      }

      if (sendOTPData) {
        setDisplayOTP(true);
        toast({
          title: t('messages.otp_sent'),
          variant: 'success',
        });
        setResendCooldown(60); // 60 seconds cooldown
      }

      setIsLoading(false);

      return;
    }

    if (displayOTP) {
      const isOTPValid = await validateOTP({
        identifier,
        otp: data.otp ?? '',
        type: data.type,
      });

      if (!isOTPValid) {
        form.setError('otp', {
          message: 'messages.errors.invalid_otp',
        });
        setIsLoading(false);
        return;
      }

      if (isOTPValid) {
        await signIn('credentials', {
          identifier: data.type === 'EMAIL' ? data.email : data.phone,
          type: data.type,
          redirect: false,
        });

        router.refresh();
      }
    }

    setIsLoading(false);
  };

  // Gérer le changement de méthode
  const handleMethodChange = (value: string) => {
    setMethod(value as 'EMAIL' | 'PHONE');
    form.reset();
    if (value === 'EMAIL') {
      form.setValue('type', 'EMAIL');
      form.setValue('email', '');
    } else {
      form.setValue('type', 'PHONE');
      form.setValue('phone', {
        countryCode: '+33',
        number: '',
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={'w-full flex flex-col gap-6'}
      >
        <div className="flex flex-col gap-6">
          {!displayOTP && (
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
                <FormItem>
                  <FormLabel>{t('inputs.phone.label')}</FormLabel>
                  <PhoneInput parentForm={form} fieldName="phone" disabled={isLoading} />
                </FormItem>
              </TabsContent>
            </Tabs>
          )}
          {displayOTP && (
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
              <span>{displayOTP ? t('access_space') : t('login_button')}</span>
              {!isLoading && <ArrowRight className="size-icon" />}
              {isLoading && <Loader2 className="size-icon animate-spin" />}
            </Button>

            {displayOTP && (
              <div className="flex justify-between items-center">
                <Button
                  type="button"
                  variant="link"
                  className="text-muted-foreground p-0"
                  disabled={isLoading}
                  onClick={() => {
                    setDisplayOTP(false);
                  }}
                >
                  <ArrowLeft className="size-icon" />
                  {t('back')}
                </Button>
                <Button
                  variant="link"
                  className="text-muted-foreground p-0"
                  disabled={isLoading || resendCooldown > 0}
                  onClick={handleResendOTP}
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
            {!displayOTP && (
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
        </div>{' '}
      </form>
    </Form>
  );
}
