'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { useSignUp } from '@clerk/nextjs';
import { api } from '@/trpc/react';
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
  EmailSchema,
  NameSchema,
  E164PhoneSchema,
} from '@/schemas/inputs';
import { z } from 'zod';
import { Button, buttonVariants } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import type { Country } from '@prisma/client';
import { ROUTES } from '@/schemas/routes';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp';
import { useRouter, useSearchParams } from 'next/navigation';
import { PhoneInput } from '@/components/ui/phone-input';

export function NewProfileForm({
  availableCountries,
}: {
  availableCountries: Country[];
}) {
  const params = useSearchParams();
  const countryCode = params.get('countryCode') as CountryCode;
  const router = useRouter();
  const t = useTranslations('inputs');
  const tAuth = useTranslations('auth.login');
  const { signUp, setActive } = useSignUp();
  const createUserMutation = api.auth.createUser.useMutation();

  // State
  const [resendCooldown, setResendCooldown] = React.useState(0);
  const [canResend, setCanResend] = React.useState(true);
  const [showOTP, setShowOTP] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const CreateProfileSchema = z.object({
    firstName: NameSchema,
    lastName: NameSchema,
    residenceCountyCode: CountryCodeSchema,
    email: EmailSchema.optional(),
    phoneNumber: E164PhoneSchema,
    type: z.enum(['EMAIL', 'PHONE']),
    otp: z.string().optional(),
  });

  type CreateProfileInput = z.infer<typeof CreateProfileSchema>;

  const form = useForm<CreateProfileInput>({
    resolver: zodResolver(
      showOTP
        ? CreateProfileSchema.extend({
            otp: z.string().length(6, { message: 'messages.errors.otp_length' }),
          })
        : CreateProfileSchema,
    ),
    defaultValues: {
      firstName: '',
      lastName: '',
      type: 'PHONE',
      email: '',
      phoneNumber: '',
      otp: '',
      residenceCountyCode: countryCode ?? availableCountries?.[0]?.code ?? '',
    },
    mode: 'onChange',
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

  // Surveiller le statut du signUp
  React.useEffect(() => {
    if (signUp?.status === 'complete' && showOTP) {
      // Si la vérification est complète, procéder automatiquement
      const data = form.getValues();
      createUserInDatabase(data)
        .then(() => {
          setActive({ session: signUp.createdSessionId }).then(() => {
            router.push(ROUTES.user.profile_form);
            router.refresh();
          });
        })
        .catch((error) => {
          console.error('Erreur automatique:', error);
          setError('Erreur lors de la finalisation automatique');
        });
    }
  }, [signUp?.status, showOTP, setActive, router, form]);

  const sendOTPCode = async (data: CreateProfileInput) => {
    if (!signUp) {
      setError('SignUp not available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const identifier = data.type === 'EMAIL' ? data.email : data.phoneNumber;

      if (!identifier) {
        setError('Identifier requis');
        return;
      }

      // Créer le sign-up avec un seul identifiant
      if (data.type === 'EMAIL') {
        await signUp.create({
          emailAddress: identifier,
        });
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      } else {
        await signUp.create({
          phoneNumber: identifier,
        });
        await signUp.preparePhoneNumberVerification({ strategy: 'phone_code' });
      }

      setShowOTP(true);
      setCanResend(false);
      setResendCooldown(60);
      toast({ title: tAuth('messages.otp_sent'), variant: 'default' });
    } catch (error: unknown) {
      console.error('Erreur envoi OTP:', error);
      const errorMessage =
        (error as any)?.errors?.[0]?.longMessage ||
        (error as any)?.message ||
        "Erreur lors de l'envoi du code";
      setError(errorMessage);
      toast({ title: 'Erreur', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const validateOTPAndCreateProfile = async (data: CreateProfileInput) => {
    if (!signUp || !setActive) {
      setError('SignUp or setActive not available');
      return;
    }

    // Vérifier si la vérification est déjà complète
    if (signUp.status === 'complete') {
      try {
        // Créer l'utilisateur en base de données
        await createUserInDatabase(data);

        // Activer la session
        await setActive({ session: signUp.createdSessionId });

        // Rediriger vers le formulaire de profil
        router.push(ROUTES.user.profile_form);
        router.refresh();
        return;
      } catch (error) {
        console.error('Erreur après vérification complète:', error);
        setError("Erreur lors de la finalisation de l'inscription");
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      let result;

      if (data.type === 'EMAIL') {
        result = await signUp.attemptEmailAddressVerification({
          code: data.otp!,
        });
      } else {
        result = await signUp.attemptPhoneNumberVerification({
          code: data.otp!,
        });
      }

      if (result.status === 'complete') {
        // Créer l'utilisateur en base de données
        await createUserInDatabase(data);

        // Activer la session
        await setActive({ session: result.createdSessionId });

        // Rediriger vers le formulaire de profil
        router.push(ROUTES.user.profile_form);
        router.refresh();
      } else {
        throw new Error('Validation incomplète');
      }
    } catch (error: unknown) {
      console.error('Erreur validation OTP:', error);
      const errorMessage =
        (error as any)?.errors?.[0]?.longMessage ||
        (error as any)?.message ||
        'Erreur de validation';
      setError(errorMessage);
      form.setValue('otp', '');
      toast({
        title: 'Erreur de validation',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createUserInDatabase = async (data: CreateProfileInput) => {
    try {
      await createUserMutation.mutateAsync({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        countryCode: data.residenceCountyCode,
      });
    } catch (error) {
      console.error('Erreur création utilisateur:', error);
      throw error;
    }
  };

  const handleResendOTP = async () => {
    if (!canResend || !signUp) return;

    const data = form.getValues();
    setIsLoading(true);
    setError(null);

    try {
      // Vérifier le statut avant de renvoyer
      if (signUp.status === 'complete') {
        setError('La vérification est déjà complète');
        return;
      }

      if (data.type === 'EMAIL') {
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      } else {
        await signUp.preparePhoneNumberVerification({ strategy: 'phone_code' });
      }

      setCanResend(false);
      setResendCooldown(60);
      toast({ title: tAuth('messages.otp_sent'), variant: 'default' });
    } catch (error: unknown) {
      console.error('Erreur renvoi OTP:', error);
      const errorMessage =
        (error as any)?.errors?.[0]?.longMessage ||
        (error as any)?.message ||
        'Erreur lors du renvoi';
      setError(errorMessage);
      toast({ title: 'Erreur', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const onFinalSubmit = async (data: CreateProfileInput) => {
    if (!showOTP) {
      // Send OTP
      await sendOTPCode(data);
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
                        options={
                          countryCode
                            ? [countryCode]
                            : availableCountries?.map((item) => item.code as CountryCode)
                        }
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
                      <PhoneInput
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isLoading}
                        placeholder={t('phone.placeholder')}
                        defaultCountry={countryCode as any}
                        countries={availableCountries?.map(
                          (country) => country.code as any,
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
