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
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp';
import { PhoneNumberInput } from '../ui/phone-number';
import { useAuthOTP } from '@/hooks/use-auth-otp';

export function NewProfileForm({
  availableCountries,
}: {
  availableCountries: Country[];
}) {
  const t = useTranslations('inputs');
  const tAuth = useTranslations('auth.login');

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

  const {
    state,
    error,
    isLoading,
    isOTPSent,
    authType,
    resendCooldown,
    canResend,
    sendOTPCode,
    validateOTP,
    resendOTP,
    goBack,
  } = useAuthOTP({
    checkUserExists: false,
    redirectOnSuccess: true,
  });

  const form = useForm<CreateProfileInput>({
    resolver: zodResolver(
      isOTPSent
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

  const onFinalSubmit = async (data: CreateProfileInput) => {
    const identifier = data.type === 'EMAIL' ? data.email : data.phoneNumber;

    if (!isOTPSent) {
      // Vérifications pour l'inscription uniquement
      const isEmailExist = await isUserExists(undefined, data.email);
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

      // Première étape : envoyer l'OTP
      await sendOTPCode(identifier ?? '', data.type);
    } else {
      // Deuxième étape : valider l'OTP
      if (data.otp) {
        await validateOTP(data.otp);
      }
    }
  };

  // Afficher les erreurs du hook dans le formulaire
  React.useEffect(() => {
    if (error && isOTPSent) {
      // Erreur lors de la validation de l'OTP
      form.setError('otp', { message: error });
    }
  }, [error, isOTPSent, form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onFinalSubmit)}
        className={'w-full flex flex-col gap-6'}
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {!isOTPSent && (
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

          {isOTPSent && (
            <div className="otp">
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem className="space-y-4 lg:col-span-2">
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
                      {authType === 'PHONE'
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
            disabled={isLoading || !form.formState.isValid || state === 'success'}
          >
            <span>
              {isOTPSent
                ? 'Continuer mon inscription'
                : "Recevoir un code d'accès" +
                  (form.watch('type') === 'EMAIL' ? ' par email' : ' par SMS')}
            </span>
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
                onClick={() => {
                  goBack();
                  form.trigger();
                }}
              >
                <ArrowLeft className="size-icon" />
                {'Retour'}
              </Button>
              <Button
                variant="link"
                className="text-muted-foreground p-0"
                disabled={!canResend || isLoading}
                onClick={resendOTP}
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

          {!isOTPSent && (
            <Button
              type="submit"
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
