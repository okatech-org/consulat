'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { api } from '@/trpc/react';
import { useSignUp } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { Loader2, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
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
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { phoneCountries } from '@/lib/autocomplete-datas';
import { RegistrationSchema, type RegistrationInput } from '@/schemas/user';
import { ROUTES } from '@/schemas/routes';
import type { Country } from '@prisma/client';
import { z } from 'zod';

// Types
type RegistrationStep = 'FORM' | 'VERIFICATION' | 'SUCCESS';

// Schema factory
function getRegistrationSchema(showOTP: boolean) {
  return RegistrationSchema.extend({
    otp: showOTP
      ? z.string().min(6, { message: 'Code de vérification requis' })
      : z.string().optional(),
  });
}

interface NewProfileFormProps {
  availableCountries: Country[];
}

export function NewProfileForm({ availableCountries }: NewProfileFormProps) {
  const t = useTranslations('inputs');
  const tAuth = useTranslations('auth.login');
  const router = useRouter();
  const createUserMutation = api.auth.createUser.useMutation();
  const { isLoaded, signUp, setActive } = useSignUp();
  const { toast } = useToast();

  // State
  const [step, setStep] = useState<RegistrationStep>('FORM');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form
  const form = useForm<RegistrationInput>({
    resolver: zodResolver(getRegistrationSchema(step === 'VERIFICATION')),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      otp: '',
    },
    mode: 'onChange',
  });

  // Fonction pour extraire le code pays à partir du numéro de téléphone
  const getCountryCodeFromPhoneNumber = (phoneNumber: string): string => {
    if (!phoneNumber) return 'FR';

    const match = phoneNumber.match(/^\+(\d{1,4})/);
    if (!match) return 'FR';

    const callingCode = `+${match[1]}`;
    const country = phoneCountries.find((c) => c.value === callingCode);
    return country?.countryCode || 'FR';
  };

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
      if (step === 'FORM') {
        // Set general form error or field-specific errors
        toast({
          title: tAuth('errors.error_title'),
          description: error,
          variant: 'destructive',
        });
      } else {
        form.setError('otp', { message: error });
      }
    }
  }, [error, step, form, toast, tAuth]);

  // Gérer la création d'utilisateur après vérification complète
  React.useEffect(() => {
    if (signUp?.status === 'complete' && signUp.createdSessionId) {
      const createUser = async () => {
        try {
          const countryCode = signUp.phoneNumber
            ? getCountryCodeFromPhoneNumber(signUp.phoneNumber)
            : 'FR';

          await createUserMutation.mutateAsync({
            firstName: signUp.firstName || '',
            lastName: signUp.lastName || '',
            email: signUp.emailAddress || undefined,
            phoneNumber: signUp.phoneNumber || undefined,
            countryCode: countryCode,
            clerkId: signUp.createdUserId || '',
          });

          await setActive?.({ session: signUp.createdSessionId });
          setStep('SUCCESS');

          // Auto-redirect after 3 seconds
          setTimeout(() => {
            router.push(ROUTES.user.profile_form);
            router.refresh();
          }, 3000);
        } catch (error) {
          console.error("Erreur lors de la création de l'utilisateur:", error);
          toast({
            title: tAuth('errors.error_title'),
            description: tAuth('errors.user_creation_failed'),
            variant: 'destructive',
          });
        }
      };

      createUser();
    }
  }, [signUp?.status, signUp?.createdSessionId, setActive, router, createUserMutation, toast, tAuth]);

  // Fonction pour mapper les erreurs Clerk vers les clés de traduction
  const mapClerkErrorToTranslation = (error: any): string => {
    const clerkError = error?.errors?.[0];
    if (!clerkError) return tAuth('errors.validation_error');

    // Mapper les codes d'erreur Clerk vers nos clés de traduction
    switch (clerkError.code) {
      case 'form_phone_number_exists':
        return tAuth('errors.phone_taken');
      case 'form_email_address_exists':
        return tAuth('errors.email_taken');
      case 'form_phone_number_invalid':
        return tAuth('errors.invalid_phone');
      case 'form_email_address_invalid':
        return tAuth('errors.invalid_email');
      case 'form_password_pwned':
        return tAuth('errors.password_compromised');
      case 'form_username_exists':
        return tAuth('errors.username_taken');
      default:
        return (
          clerkError.longMessage || clerkError.message || tAuth('errors.validation_error')
        );
    }
  };

  // Handlers
  const handleSendVerification = async (data: RegistrationInput) => {
    if (!signUp) {
      setError('SignUp not available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Créer le sign-up avec les données du formulaire
      await signUp.create({
        firstName: data.firstName,
        lastName: data.lastName,
        emailAddress: data.email,
        phoneNumber: data.phoneNumber,
      });

      // Préparer la vérification par téléphone uniquement
      await signUp.preparePhoneNumberVerification({ strategy: 'phone_code' });

      setStep('VERIFICATION');
      setCanResend(false);
      setResendCooldown(60);
      toast({
        title: 'Code envoyé',
        description: tAuth('messages.otp_sent'),
      });
    } catch (error: unknown) {
      const errorMessage = mapClerkErrorToTranslation(error);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateOTP = async (otp: string) => {
    if (!signUp) {
      setError('SignUp not available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Vérifier le code OTP par téléphone uniquement
      const result = await signUp.attemptPhoneNumberVerification({
        code: otp,
      });

      if (result?.status === 'complete') {
        toast({
          title: tAuth('messages.login_success'),
          description: 'Vérification réussie!',
        });
      } else {
        throw new Error('Validation incomplète');
      }
    } catch (error: unknown) {
      const clerkError = (error as any)?.errors?.[0];
      let errorMessage = tAuth('errors.validation_error');

      // Mapper les erreurs de vérification OTP
      if (clerkError) {
        switch (clerkError.code) {
          case 'form_code_incorrect':
            errorMessage = tAuth('errors.invalid_code');
            break;
          case 'form_code_expired':
            errorMessage = tAuth('errors.code_expired');
            break;
          case 'form_code_max_attempts_reached':
            errorMessage = tAuth('errors.too_many_attempts');
            break;
          default:
            errorMessage =
              clerkError.longMessage ||
              clerkError.message ||
              tAuth('errors.validation_error');
        }
      }

      setError(errorMessage);
      form.setValue('otp', '');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend || !signUp) return;

    setIsLoading(true);
    setError(null);

    try {
      // Renvoyer le code OTP par téléphone uniquement
      await signUp.preparePhoneNumberVerification({ strategy: 'phone_code' });

      setCanResend(false);
      setResendCooldown(60);
      toast({
        title: 'Code renvoyé',
        description: tAuth('messages.otp_sent'),
      });
    } catch (error: unknown) {
      const errorMessage = mapClerkErrorToTranslation(error);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    setStep('FORM');
    setError(null);
    form.clearErrors();
  };

  const onSubmit = async (data: RegistrationInput) => {
    if (step === 'FORM') {
      await handleSendVerification(data);
    } else if (step === 'VERIFICATION' && data.otp) {
      await handleValidateOTP(data.otp);
    }
  };

  // Gérer l'état de chargement
  if (!isLoaded) {
    return (
      <div className="w-full flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

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
                    Compte créé avec succès!
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Redirection vers votre espace...
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  type="button"
                  size="mobile"
                  weight="medium"
                  fullWidthOnMobile={true}
                  variant="default"
                  leftIcon={<CheckCircle2 className="size-4" />}
                  rightIcon={<ArrowRight className="size-4" />}
                  onClick={() => router.push(ROUTES.user.profile_form)}
                >
                  Accéder à mon espace
                </Button>

                <p className="text-xs text-muted-foreground">
                  Redirection automatique dans quelques secondes...
                </p>
              </div>
            </div>
          )}

          {step === 'FORM' && (
            <div className="form-fields space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold">{t('newProfile.title')}</h1>
                <p className="text-muted-foreground">{t('newProfile.description')}</p>
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('firstName.label')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t('firstName.placeholder')}
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
                      <FormLabel>{t('lastName.label')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t('lastName.placeholder')}
                          disabled={isLoading}
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
                          {...field}
                          type="email"
                          placeholder={t('email.placeholder')}
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
                      <FormLabel>{t('phone.label')}</FormLabel>
                      <FormControl>
                        <PhoneInput
                          value={field.value}
                          onChange={field.onChange}
                          disabled={isLoading}
                          placeholder={t('phone.placeholder')}
                          countries={availableCountries?.map((country) => country.code as any)}
                          defaultCountry={availableCountries?.[0]?.code as any}
                        />
                      </FormControl>
                      <TradFormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {step === 'VERIFICATION' && (
            <div className="otp space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold">Vérifiez votre téléphone</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Nous avons envoyé un code de vérification par SMS à votre numéro de téléphone
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

          {(step === 'FORM' || step === 'VERIFICATION') && (
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
                {step === 'VERIFICATION' ? 'Vérifier' : 'Créer mon compte'}
              </Button>

              {step === 'VERIFICATION' && (
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
                    Retour
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!canResend || isLoading}
                    onClick={handleResendOTP}
                    className="flex-shrink-0"
                  >
                    Renvoyer le code
                    {resendCooldown > 0 && (
                      <span className="text-xs text-muted-foreground ml-1">
                        ({resendCooldown}s)
                      </span>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </form>
    </Form>
  );
}
