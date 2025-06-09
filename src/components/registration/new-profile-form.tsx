'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  TradFormMessage,
} from '@/components/ui/form';
import { CountrySelect } from '@/components/ui/country-select';
import { type CountryCode } from '@/lib/autocomplete-datas';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CountryCodeSchema,
  DateSchema,
  EmailSchema,
  NameSchema,
  PhoneNumberSchema,
} from '@/schemas/inputs';
import { z } from 'zod';
import { Button, buttonVariants } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { Country } from '@prisma/client';
import { ROUTES } from '@/schemas/routes';
import Link from 'next/link';
import { isUserExists } from '@/actions/auth';
import { ErrorMessageKey, tryCatch } from '@/lib/utils';
import { ErrorCard } from '../ui/error-card';
import { toast } from '@/hooks/use-toast';
import { createUserProfile } from '@/actions/profile';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp';
import { useRouter } from 'next/navigation';
import { PhoneNumberInput } from '../ui/phone-number';
import { authClient } from '@/lib/auth/auth-client';

export function NewProfileForm({
  availableCountries,
}: {
  availableCountries: Country[];
}) {
  const router = useRouter();
  const t = useTranslations('inputs');
  const tAuth = useTranslations('auth.login');
  const tErrors = useTranslations('messages.errors');
  const [resendCooldown, setResendCooldown] = React.useState(0);
  const [canResend, setCanResend] = React.useState(true);

  const [showOTP, setShowOTP] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<ErrorMessageKey | null>(null);

  const CreateProfileSchema = z.object({
    firstName: NameSchema,
    lastName: NameSchema,
    residenceCountyCode: CountryCodeSchema,
    email: EmailSchema.optional(),
    phoneNumber: PhoneNumberSchema,
    emailVerified: DateSchema.optional(),
    phoneVerified: DateSchema.optional(),
    type: z.enum(['EMAIL', 'PHONE']),
    otp: z.string().optional(),
  });

  type CreateProfileInput = z.infer<typeof CreateProfileSchema>;

  const form = useForm<CreateProfileInput>({
    resolver: zodResolver(
      showOTP
        ? CreateProfileSchema.extend({
            otp: z
              .string({
                required_error: 'messages.errors.otp_length',
                invalid_type_error: 'messages.errors.otp_length',
              })
              .length(6, { message: 'messages.errors.otp_length' }),
          })
        : CreateProfileSchema,
    ),
    defaultValues: {
      firstName: '',
      lastName: '',
      type: 'PHONE',
      email: '',
      phoneNumber: '+33-',
      otp: '',
      residenceCountyCode: (availableCountries?.[0]?.code ?? '') as CountryCode,
    },
    mode: 'onBlur',
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

    const response =
      type === 'EMAIL'
        ? await authClient.emailOtp.sendVerificationOtp({
            email: identifier,
            type: 'sign-in',
          })
        : await authClient.phoneNumber.sendOtp({
            phoneNumber: identifier,
          });

    if (response.error) {
      form.setError('otp', {
        message: 'messages.errors.code_not_sent_otp',
      });
      setIsLoading(false);
      return false;
    }

    setShowOTP(true);
    setCanResend(false);
    setResendCooldown(60);
    toast({
      title: tAuth('messages.otp_sent'),
      variant: 'success',
    });

    setIsLoading(false);
    return true;
  };

  const validateOTPAndCreateProfile = async (data: CreateProfileInput) => {
    setIsLoading(true);
    setError(null);

    const response =
      data.type === 'PHONE'
        ? await authClient.phoneNumber.verify({
            phoneNumber: data.phoneNumber,
            code: data.otp!,
          })
        : await authClient.signIn.emailOtp({
            email: data.email!,
            otp: data.otp!,
          });

    if (response.error) {
      form.setError('otp', {
        message: `messages.errors.${response.error.code}`,
      });
      return;
    }

    const userId = response.data?.user?.id;

    if (!userId) {
      form.setError('otp', {
        message: 'messages.errors.user_creation_failed',
      });
      return;
    }

    const profileResult = await tryCatch(createUserProfile(data, userId));

    if (profileResult.error) {
      setError(profileResult.error.message as ErrorMessageKey);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    router.push(ROUTES.registration);
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    const data = form.getValues();
    const identifier = data.type === 'EMAIL' ? data.email : data.phoneNumber;

    await sendOTPCode(identifier!, data.type);
  };

  const onFinalSubmit = async (data: CreateProfileInput) => {
    const identifier = data.type === 'EMAIL' ? data.email : data.phoneNumber;

    if (!showOTP) {
      // Check if user already exists
      const isEmailExist = data.email ? await isUserExists(undefined, data.email) : false;
      if (isEmailExist) {
        form.setError('email', {
          message: 'messages.errors.user_email_already_exists',
        });
        return;
      }

      const isPhoneExist = await isUserExists(undefined, undefined, data.phoneNumber);
      if (isPhoneExist) {
        form.setError('phoneNumber', {
          message: 'messages.errors.user_phone_already_exists',
        });
        return;
      }

      // Send OTP
      await sendOTPCode(identifier!, data.type);
    } else {
      // Validate OTP and create profile
      await validateOTPAndCreateProfile(data);
    }
  };

  const goBack = () => {
    setShowOTP(false);
    setError(null);
    form.clearErrors();
  };

  // Display errors in the form
  React.useEffect(() => {
    if (error) {
      if (!showOTP) {
        // Error when sending OTP
        const fieldName = form.watch('type') === 'EMAIL' ? 'email' : 'phoneNumber';
        form.setError(fieldName, { message: error });
      } else if (showOTP) {
        // Error when validating OTP
        form.setError('otp', { message: error });
      }
    }
  }, [error, showOTP, form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onFinalSubmit)}
        className={'w-full flex flex-col gap-6'}
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {!showOTP && (
            <>
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem className="lg:col-span-1">
                    <FormLabel>{t('firstName.label')}</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder={t('firstName.placeholder')}
                        {...field}
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
                  <FormItem className="lg:col-span-1">
                    <FormLabel>{t('lastName.label')}</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder={t('lastName.placeholder')}
                        {...field}
                      />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="residenceCountyCode"
                render={({ field }) => (
                  <FormItem className="lg:col-span-full">
                    <FormLabel>{t('residenceCounty.label')}</FormLabel>
                    <FormControl>
                      <CountrySelect
                        type="single"
                        selected={field.value as CountryCode}
                        onChange={(value) => field.onChange(value)}
                        options={availableCountries?.map(
                          (item) => item.code as CountryCode,
                        )}
                      />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('email.label')}</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder={t('email.placeholder')}
                        {...field}
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
                  <FormItem className="w-full">
                    <FormLabel>{t('phone.label')}</FormLabel>
                    <FormControl>
                      <PhoneNumberInput
                        value={field.value}
                        onChangeAction={field.onChange}
                        disabled={isLoading}
                        options={availableCountries?.map(
                          (item) => item.code as CountryCode,
                        )}
                      />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          {showOTP && (
            <div className="otp lg:col-span-2">
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <FormLabel className="text-xl font-semibold">
                      {t('otp.label')}
                    </FormLabel>
                    <FormControl>
                      <InputOTP
                        maxLength={6}
                        {...field}
                        autoComplete="one-time-code"
                        disabled={isLoading}
                        autoFocus
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
                      {form.watch('type') === 'PHONE'
                        ? t('otp.phone_description')
                        : t('otp.email_description')}
                    </FormDescription>
                    <TradFormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>

        <div className="actions flex flex-col gap-4">
          <Button
            variant="default"
            type="submit"
            disabled={isLoading || !form.formState.isValid}
          >
            <span>
              {showOTP
                ? 'Continuer mon inscription'
                : "Recevoir un code d'accès" +
                  (form.watch('type') === 'EMAIL' ? ' par email' : ' par SMS')}
            </span>
            {!isLoading && <ArrowRight className="size-icon" />}
            {isLoading && <Loader2 className="size-icon animate-spin" />}
          </Button>

          {showOTP && (
            <div className="flex justify-between items-center">
              <Button
                type="button"
                variant="link"
                className="text-muted-foreground p-0"
                disabled={isLoading}
                onClick={goBack}
              >
                <ArrowLeft className="size-icon" />
                {'Retour'}
              </Button>
              <Button
                variant="link"
                className="text-muted-foreground p-0"
                disabled={!canResend || isLoading}
                onClick={handleResendOTP}
              >
                {'Renvoyer le code'}
                {resendCooldown > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {tAuth('resend_cooldown', { cooldown: resendCooldown })}
                  </span>
                )}
              </Button>
            </div>
          )}
          {!showOTP && (
            <Button
              type="button"
              variant="link"
              disabled={isLoading}
              onClick={() => {
                form.setValue('type', form.watch('type') === 'EMAIL' ? 'PHONE' : 'EMAIL');
              }}
            >
              <span className="text-muted-foreground">
                {form.watch('type') === 'EMAIL'
                  ? "Recevoir un code d'accès par téléphone"
                  : "Recevoir un code d'accès par email"}
              </span>
            </Button>
          )}
        </div>

        <div className="subactions flex justify-center">
          {error && <ErrorCard description={tErrors(error)} />}
          <p className="text-sm text-muted-foreground">
            <span>Vous avez déjà une demande en cours ?</span>
            <Link
              className={buttonVariants({ variant: 'link' }) + ' !p-0 !px-1 h-min'}
              href={`${ROUTES.auth.login}?callbackUrl=${ROUTES.registration}`}
            >
              {'Continuer mon inscription'}
            </Link>
          </p>
        </div>
      </form>
    </Form>
  );
}
