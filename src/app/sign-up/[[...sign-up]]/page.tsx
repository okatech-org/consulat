'use client';

import { useSignUp } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/components/ui/phone-input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/trpc/react';
import { ROUTES } from '@/schemas/routes';
import { toast } from '@/hooks/use-toast';
import type { Country } from '@prisma/client';
import { phoneCountries } from '@/lib/autocomplete-datas';

interface SignUpPageProps {
  availableCountries: Country[];
}

export function SignUpForm({ availableCountries }: SignUpPageProps) {
  const t = useTranslations('inputs');
  const tAuth = useTranslations('auth.login');
  const router = useRouter();
  const createUserMutation = api.auth.createUser.useMutation();
  const { isLoaded, signUp, setActive } = useSignUp();

  // États du formulaire
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  });
  const [currentStep, setCurrentStep] = useState<'form' | 'verification'>('form');
  const [verificationCode, setVerificationCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour extraire le code pays à partir du numéro de téléphone
  const getCountryCodeFromPhoneNumber = (phoneNumber: string): string => {
    if (!phoneNumber) return 'FR';

    const match = phoneNumber.match(/^\+(\d{1,4})/);
    if (!match) return 'FR';

    const callingCode = `+${match[1]}`;
    const country = phoneCountries.find((c) => c.value === callingCode);
    return country?.countryCode || 'FR';
  };

  // Cooldown timer for resend
  useEffect(() => {
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

  // Gérer la création d'utilisateur après vérification complète
  useEffect(() => {
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
          });

          await setActive?.({ session: signUp.createdSessionId });
          router.push(ROUTES.user.profile_form);
          router.refresh();
        } catch (error) {
          console.error("Erreur lors de la création de l'utilisateur:", error);
          toast({
            title: 'Erreur',
            description: 'Erreur lors de la création de votre profil',
            variant: 'destructive',
          });
        }
      };

      createUser();
    }
  }, [signUp?.status, signUp?.createdSessionId, setActive, router, createUserMutation]);

  // Fonction pour soumettre le formulaire initial
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUp) return;

    setIsLoading(true);
    setError(null);

    try {
      // Créer le sign-up avec les données du formulaire
      await signUp.create({
        firstName: formData.firstName,
        lastName: formData.lastName,
        emailAddress: formData.email,
        phoneNumber: formData.phoneNumber,
      });

      // Préparer la vérification par email ou téléphone
      if (formData.email) {
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      } else if (formData.phoneNumber) {
        await signUp.preparePhoneNumberVerification({ strategy: 'phone_code' });
      }

      setCurrentStep('verification');
      setCanResend(false);
      setResendCooldown(60);
      toast({ title: tAuth('messages.otp_sent'), variant: 'default' });
    } catch (error: unknown) {
      const errorMessage =
        (error as { errors?: Array<{ longMessage?: string }>; message?: string })
          ?.errors?.[0]?.longMessage ||
        (error as { message?: string })?.message ||
        'Erreur lors de la création du compte';
      setError(errorMessage);
      toast({ title: 'Erreur', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour vérifier le code OTP
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUp) return;

    setIsLoading(true);
    setError(null);

    try {
      let result;

      if (formData.email) {
        result = await signUp.attemptEmailAddressVerification({ code: verificationCode });
      } else if (formData.phoneNumber) {
        result = await signUp.attemptPhoneNumberVerification({ code: verificationCode });
      }

      if (result?.status === 'complete') {
        toast({ title: 'Vérification réussie !', variant: 'default' });
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { errors?: Array<{ longMessage?: string }>; message?: string })
          ?.errors?.[0]?.longMessage ||
        (error as { message?: string })?.message ||
        'Erreur lors de la vérification';
      setError(errorMessage);
      toast({ title: 'Erreur', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour renvoyer le code
  const handleResendCode = async () => {
    if (!canResend || !signUp) return;

    setIsLoading(true);
    setError(null);

    try {
      if (formData.email) {
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      } else if (formData.phoneNumber) {
        await signUp.preparePhoneNumberVerification({ strategy: 'phone_code' });
      }

      setCanResend(false);
      setResendCooldown(60);
      toast({ title: tAuth('messages.otp_sent'), variant: 'default' });
    } catch (error: unknown) {
      const errorMessage =
        (error as { errors?: Array<{ longMessage?: string }>; message?: string })
          ?.errors?.[0]?.longMessage ||
        (error as { message?: string })?.message ||
        'Erreur lors du renvoi';
      setError(errorMessage);
      toast({ title: 'Erreur', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(false);
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

  // Rendu du formulaire initial
  if (currentStep === 'form') {
    return (
      <div className="w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">{t('newProfile.title')}</h1>
          <p className="text-muted-foreground">{t('newProfile.description')}</p>
        </div>

        <form onSubmit={handleSubmitForm} className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="firstName">{t('firstName.label')}</Label>
              <Input
                id="firstName"
                placeholder={t('firstName.placeholder')}
                value={formData.firstName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, firstName: e.target.value }))
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="lastName">{t('lastName.label')}</Label>
              <Input
                id="lastName"
                placeholder={t('lastName.placeholder')}
                value={formData.lastName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, lastName: e.target.value }))
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="email">{t('email.label')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('email.placeholder')}
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>

            <div>
              <Label htmlFor="phoneNumber">{t('phone.label')}</Label>
              <PhoneInput
                placeholder={t('phone.placeholder')}
                countries={availableCountries?.map((country) => country.code as any)}
                defaultCountry={availableCountries?.[0]?.code as any}
                value={formData.phoneNumber}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, phoneNumber: value || '' }))
                }
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || (!formData.email && !formData.phoneNumber)}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Créer mon compte
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </div>
    );
  }

  // Rendu de l'étape de vérification
  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">
          {formData.email ? 'Vérifiez votre email' : 'Vérifiez votre téléphone'}
        </h1>
        <p className="text-muted-foreground">
          {formData.email
            ? 'Nous avons envoyé un code de vérification à votre adresse email'
            : 'Nous avons envoyé un code de vérification par SMS'}
        </p>
      </div>

      <form onSubmit={handleVerifyCode} className="space-y-4">
        <div>
          <Label className="text-xl font-semibold">Code de vérification</Label>
          <InputOTP
            maxLength={6}
            value={verificationCode}
            onChange={setVerificationCode}
            autoComplete="one-time-code"
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
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>
        )}

        <div className="space-y-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || verificationCode.length !== 6}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Vérifier
          </Button>

          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="link"
              className="text-muted-foreground p-0"
              disabled={isLoading}
              onClick={() => setCurrentStep('form')}
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            <Button
              variant="link"
              className="text-muted-foreground p-0"
              disabled={!canResend || isLoading}
              onClick={handleResendCode}
            >
              Renvoyer le code
              {resendCooldown > 0 && (
                <span className="text-xs text-muted-foreground ml-1">
                  ({resendCooldown}s)
                </span>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function SignUpPage() {
  return <SignUpForm availableCountries={[]} />;
}
