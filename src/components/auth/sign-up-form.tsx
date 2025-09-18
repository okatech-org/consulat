'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSignUp } from '@clerk/nextjs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  TradFormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RegistrationSchema, type RegistrationInput } from '@/schemas/user';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Mail, Phone, CheckCircle2, User } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { ROUTES } from '@/schemas/routes';
import Link from 'next/link';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { z } from 'zod';
import { PhoneInput } from '@/components/ui/phone-input';
import { useToast } from '@/hooks/use-toast';
import type { Country } from '@/types/country';

// Types
type SignUpStep = 'PERSONAL_INFO' | 'CONTACT_INFO' | 'PHONE_VERIFICATION' | 'SUCCESS';

// Schema factory
function getSignUpSchema(step: SignUpStep) {
  const baseSchema = RegistrationSchema;

  if (step === 'PERSONAL_INFO') {
    return baseSchema.pick({ firstName: true, lastName: true });
  }

  if (step === 'CONTACT_INFO') {
    return baseSchema.pick({ email: true, phoneNumber: true });
  }

  if (step === 'PHONE_VERIFICATION') {
    return baseSchema.extend({
      otp: z.string().min(6, { message: 'messages.errors.opt_min_length' }),
    });
  }

  return baseSchema;
}

// Fonction pour traduire les erreurs Clerk
function translateClerkError(error: string): string {
  const errorTranslations: Record<string, string> = {
    'That phone number is taken. Please try another.':
      'Ce numéro de téléphone est déjà utilisé. Veuillez en essayer un autre.',
    'That email address is taken. Please try another.':
      'Cette adresse email est déjà utilisée. Veuillez en essayer une autre.',
    'Invalid phone number format.': 'Format de numéro de téléphone invalide.',
    'Invalid email address format.': "Format d'adresse email invalide.",
    'Phone number is required.': 'Le numéro de téléphone est requis.',
    'Email address is required.': "L'adresse email est requise.",
    'First name is required.': 'Le prénom est requis.',
    'Last name is required.': 'Le nom est requis.',
    'Invalid verification code.': 'Code de vérification invalide.',
    'Verification code expired.': 'Code de vérification expiré.',
    'Too many failed attempts.': 'Trop de tentatives échouées.',
    'SignUp not available': "Service d'inscription non disponible",
    'SignUp or setActive not available': "Service d'inscription non disponible",
  };

  // Rechercher une traduction exacte
  if (errorTranslations[error]) {
    return errorTranslations[error];
  }

  // Rechercher des mots-clés pour des traductions partielles
  const lowerError = error.toLowerCase();
  if (lowerError.includes('phone') && lowerError.includes('taken')) {
    return 'Ce numéro de téléphone est déjà utilisé. Veuillez en essayer un autre.';
  }
  if (lowerError.includes('email') && lowerError.includes('taken')) {
    return 'Cette adresse email est déjà utilisée. Veuillez en essayer une autre.';
  }
  if (lowerError.includes('invalid') && lowerError.includes('phone')) {
    return 'Format de numéro de téléphone invalide.';
  }
  if (lowerError.includes('invalid') && lowerError.includes('email')) {
    return "Format d'adresse email invalide.";
  }
  if (lowerError.includes('verification') && lowerError.includes('code')) {
    return 'Code de vérification invalide.';
  }

  // Retourner le message original si aucune traduction n'est trouvée
  return error;
}

export function SignUpForm({ countries }: { countries: Country[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const { signUp, setActive } = useSignUp();

  // State
  const [step, setStep] = React.useState<SignUpStep>('PERSONAL_INFO');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = React.useState(0);
  const [canResend, setCanResend] = React.useState(true);
  const [formData, setFormData] = React.useState<Partial<RegistrationInput>>({});

  // Form
  const form = useForm<RegistrationInput>({
    resolver: zodResolver(getSignUpSchema(step)),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      otp: '',
    },
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
      const translatedError = translateClerkError(error);

      if (step === 'PERSONAL_INFO') {
        form.setError('firstName', { message: translatedError });
      } else if (step === 'CONTACT_INFO') {
        // Déterminer le bon champ selon le type d'erreur
        const lowerError = error.toLowerCase();
        if (lowerError.includes('phone') || lowerError.includes('téléphone')) {
          form.setError('phoneNumber', { message: translatedError });
        } else if (lowerError.includes('email')) {
          form.setError('email', { message: translatedError });
        } else {
          // Par défaut, afficher l'erreur sur le téléphone car c'est souvent lié
          form.setError('phoneNumber', { message: translatedError });
        }
      } else if (step === 'PHONE_VERIFICATION') {
        form.setError('otp', { message: translatedError });
      }
    }
  }, [error, step, form]);

  // Handlers
  const handleCreateSignUp = async (data: Partial<RegistrationInput>) => {
    if (!signUp) {
      setError('SignUp not available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const signUpParams = {
        firstName: data.firstName,
        lastName: data.lastName,
        emailAddress: data.email,
        phoneNumber: data.phoneNumber,
      };

      await signUp.create(signUpParams);

      // Start with phone verification
      await signUp.preparePhoneNumberVerification({ strategy: 'phone_code' });

      setStep('PHONE_VERIFICATION');
      setResendCooldown(60);
      setCanResend(false);
      toast({
        title: 'Code envoyé',
        description: 'Un code de vérification a été envoyé à votre téléphone',
      });
    } catch (error: unknown) {
      const rawErrorMessage =
        (error as { errors?: Array<{ longMessage?: string }>; message?: string })
          ?.errors?.[0]?.longMessage ||
        (error as { message?: string })?.message ||
        'Erreur lors de la création du compte';

      const translatedErrorMessage = translateClerkError(rawErrorMessage);
      setError(translatedErrorMessage);
      toast({
        title: 'Erreur',
        description: translatedErrorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPhoneCode = async (otp: string) => {
    if (!signUp || !setActive) {
      setError('SignUp or setActive not available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await signUp.attemptPhoneNumberVerification({ code: otp });

      if (result.status === 'complete') {
        // Phone verified, inscription terminée
        await setActive({ session: result.createdSessionId });
        setStep('SUCCESS');
        router.push(ROUTES.user.profile_form);
        router.refresh();
      } else {
        throw new Error('Vérification du téléphone incomplète');
      }
    } catch (error: unknown) {
      const rawErrorMessage =
        (error as { errors?: Array<{ longMessage?: string }>; message?: string })
          ?.errors?.[0]?.longMessage ||
        (error as { message?: string })?.message ||
        'Code de vérification invalide';

      const translatedErrorMessage = translateClerkError(rawErrorMessage);
      setError(translatedErrorMessage);
      form.setValue('otp', '');
      toast({
        title: 'Erreur de vérification',
        description: translatedErrorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend || !signUp) return;

    setIsLoading(true);
    try {
      await signUp.preparePhoneNumberVerification({ strategy: 'phone_code' });
      setResendCooldown(60);
      setCanResend(false);
      toast({
        title: 'Code renvoyé',
        description: 'Un nouveau code a été envoyé à votre téléphone',
      });
    } catch (error: unknown) {
      const rawErrorMessage =
        (error as { errors?: Array<{ longMessage?: string }> })?.errors?.[0]
          ?.longMessage || 'Erreur lors du renvoi';
      const translatedErrorMessage = translateClerkError(rawErrorMessage);
      toast({
        title: 'Erreur',
        description: translatedErrorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    if (step === 'PHONE_VERIFICATION') {
      setStep('CONTACT_INFO');
    } else if (step === 'CONTACT_INFO') {
      setStep('PERSONAL_INFO');
    }
    setError(null);
    form.clearErrors();
  };

  const onSubmit = async (data: RegistrationInput) => {
    const updatedFormData = { ...formData, ...data };
    setFormData(updatedFormData);

    if (step === 'PERSONAL_INFO') {
      setStep('CONTACT_INFO');
    } else if (step === 'CONTACT_INFO') {
      await handleCreateSignUp(updatedFormData);
    } else if (step === 'PHONE_VERIFICATION' && data.otp) {
      await handleVerifyPhoneCode(data.otp);
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
                    Compte créé avec succès
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Redirection vers votre espace...
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
                  <Link href={ROUTES.user.profile_form}>Accéder à mon espace</Link>
                </Button>

                <p className="text-xs text-muted-foreground">
                  Redirection automatique en cours...
                </p>
              </div>
            </div>
          )}

          {step === 'PERSONAL_INFO' && (
            <div className="personal-info space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                  <User className="h-5 w-5" />
                  Informations personnelles
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Commençons par vos informations de base
                </p>
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          autoFocus
                          placeholder="Votre prénom"
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
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Votre nom" disabled={isLoading} />
                      </FormControl>
                      <TradFormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {step === 'CONTACT_INFO' && (
            <div className="contact-info space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                  <Mail className="h-5 w-5" />
                  Informations de contact
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Votre numéro de téléphone sera vérifié
                </p>
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse email</FormLabel>
                      <FormControl>
                        <Input
                          autoFocus
                          {...field}
                          type="email"
                          autoComplete="email"
                          placeholder="votre@email.com"
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
                      <FormLabel>Numéro de téléphone</FormLabel>
                      <FormControl>
                        <PhoneInput
                          value={field.value}
                          onChange={field.onChange}
                          disabled={isLoading}
                          placeholder="+33 6 12 34 56 78"
                          countries={countries?.map((country) => country.code as 'FR')}
                          defaultCountry={countries?.[0]?.code as 'FR'}
                        />
                      </FormControl>
                      <TradFormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {step === 'PHONE_VERIFICATION' && (
            <div className="verification space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                  <Phone className="h-5 w-5" />
                  Vérification téléphone
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Saisissez le code reçu par SMS
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

          {(step === 'PERSONAL_INFO' ||
            step === 'CONTACT_INFO' ||
            step === 'PHONE_VERIFICATION') && (
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
                {step === 'PERSONAL_INFO' && 'Continuer'}
                {step === 'CONTACT_INFO' && 'Créer mon compte'}
                {step === 'PHONE_VERIFICATION' && 'Vérifier le téléphone'}
              </Button>

              {(step === 'CONTACT_INFO' || step === 'PHONE_VERIFICATION') && (
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

                  {step === 'PHONE_VERIFICATION' && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={!canResend || isLoading}
                      onClick={handleResendCode}
                      className="flex-shrink-0"
                    >
                      Renvoyer le code
                      {resendCooldown > 0 && (
                        <span className="text-xs text-muted-foreground ml-1">
                          ({resendCooldown}s)
                        </span>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {step !== 'SUCCESS' && (
            <div className="subactions flex justify-center">
              <p className="text-sm text-muted-foreground">
                <span>Vous avez déjà un compte ? </span>
                <Link
                  className={
                    buttonVariants({ variant: 'link', size: 'sm' }) + ' !p-0 !h-auto'
                  }
                  href={ROUTES.auth.login}
                >
                  Se connecter
                </Link>
              </p>
            </div>
          )}
        </div>
      </form>
    </Form>
  );
}
