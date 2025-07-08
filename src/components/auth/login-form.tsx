'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { signIn, useSession } from 'next-auth/react';
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
import { PhoneNumberInput } from '@/components/ui/phone-number';
import { toast } from '@/hooks/use-toast';
import { AuthRedirectManager } from '@/lib/auth/redirect-utils';
import { checkUserExists } from '@/actions/auth';

// Types
type LoginMethod = 'EMAIL' | 'PHONE';
type LoginStep = 'IDENTIFIER' | 'OTP' | 'SUCCESS';

// Étendre le type de retour de signIn pour inclure code
interface SignInResult {
  error?: string;
  code?: string;
  ok?: boolean;
  status?: number;
  url?: string | null;
}

interface LoginFormState {
  method: LoginMethod;
  step: LoginStep;
  isLoading: boolean;
  error: string | null;
  resendCooldown: number;
  canResend: boolean;
  hasRedirected: boolean;
}

// Schema factory
function getLoginSchema(type: LoginMethod, showOTP: boolean) {
  const baseSchema = type === 'EMAIL' ? LoginWithEmailSchema : LoginWithPhoneSchema;

  return baseSchema.extend({
    otp: showOTP
      ? z
          .string({
            invalid_type_error: 'messages.errors.opt_min_length',
            required_error: 'messages.errors.opt_min_length',
          })
          .min(6, { message: 'messages.errors.opt_min_length' })
      : z.string({ invalid_type_error: 'messages.errors.opt_min_length' }).optional(),
  });
}

// Custom hooks
function useResendCooldown() {
  const [resendCooldown, setResendCooldown] = React.useState(0);
  const [canResend, setCanResend] = React.useState(true);

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

  const startCooldown = React.useCallback((seconds: number = 60) => {
    setCanResend(false);
    setResendCooldown(seconds);
  }, []);

  return { resendCooldown, canResend, startCooldown };
}

function useLoginActions() {
  const tAuth = useTranslations('auth');

  const getErrorMessage = React.useCallback(
    (code: string | undefined) => {
      if (!code) return tAuth('login.errors.validation_error');

      // Essayer de trouver dans errors, puis messages
      const errorKey = `login.errors.${code}`;
      let errorMessage = tAuth(errorKey);

      if (errorMessage === errorKey) {
        const messageKey = `login.messages.${code}`;
        errorMessage = tAuth(messageKey);

        // Si toujours pas trouvé, retourner un message générique
        if (errorMessage === messageKey) {
          return tAuth('login.errors.validation_error');
        }
      }

      return errorMessage;
    },
    [tAuth],
  );

  const sendOTPCode = React.useCallback(
    async (identifier: string) => {
      const result = (await signIn('otp', {
        identifier,
        action: 'send',
        redirect: false,
      })) as SignInResult;

      if (result?.error) {
        // Vérifier si c'est le code spécial CODE_SENT
        if (result.code === 'CODE_SENT') {
          // C'est un succès, pas une erreur
          return;
        }

        // Sinon, c'est une vraie erreur
        const errorMessage = getErrorMessage(result.code);
        throw new Error(errorMessage);
      }
    },
    [getErrorMessage],
  );

  const validateOTP = React.useCallback(
    async (otp: string, identifier: string) => {
      const result = (await signIn('otp', {
        identifier,
        code: otp,
        action: 'verify',
        redirect: false,
      })) as SignInResult;

      if (result?.error) {
        const errorMessage = getErrorMessage(result.code);
        throw new Error(errorMessage);
      }

      return result;
    },
    [getErrorMessage],
  );

  return { sendOTPCode, validateOTP };
}

export function LoginForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;
  const t = useTranslations('auth.login');
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');

  // State management
  const [state, setState] = React.useState<LoginFormState>({
    method: 'PHONE',
    step: 'IDENTIFIER',
    isLoading: false,
    error: null,
    resendCooldown: 0,
    canResend: true,
    hasRedirected: false,
  });

  // Custom hooks
  const { resendCooldown, canResend, startCooldown } = useResendCooldown();
  const { sendOTPCode, validateOTP } = useLoginActions();

  // Form setup
  const form = useForm<LoginInput>({
    resolver: zodResolver(getLoginSchema(state.method, state.step === 'OTP')),
    defaultValues: { type: state.method, email: '', otp: '', phoneNumber: '+33-' },
    mode: 'onChange',
  });

  // Update state helper
  const updateState = React.useCallback((updates: Partial<LoginFormState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Manual redirect for success state
  const handleManualRedirect = React.useCallback(() => {
    if (state.hasRedirected) return;

    const redirectUrl = AuthRedirectManager.getRedirectUrl(user || null, callbackUrl);
    router.push(redirectUrl);
    setState((prev) => ({ ...prev, hasRedirected: true }));
  }, [user, state.hasRedirected, router, callbackUrl]);

  // Handlers
  const handleSendOTP = React.useCallback(
    async (identifier: string) => {
      updateState({ isLoading: true, error: null });

      try {
        // Vérifier d'abord si l'utilisateur existe
        const userCheck = await checkUserExists(
          identifier,
          state.method === 'EMAIL' ? 'email' : 'phone',
        );

        if (!userCheck.exists) {
          const errorMessage =
            'Aucun compte associé à cet identifiant. Veuillez vous inscrire.';
          updateState({ error: errorMessage, isLoading: false });

          toast({
            title: 'Compte introuvable',
            description: errorMessage,
            variant: 'destructive',
          });
          return;
        }

        // Si l'utilisateur existe, envoyer l'OTP
        await sendOTPCode(identifier);
        updateState({ step: 'OTP', isLoading: false, error: null });
        startCooldown(60);
        toast({ title: t('messages.otp_sent'), variant: 'default' });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t('errors.send_otp_failed');

        updateState({ error: errorMessage, isLoading: false });

        toast({
          title: t('errors.send_error'),
          description: errorMessage,
          variant: 'destructive',
        });
      }
    },
    [sendOTPCode, updateState, startCooldown, t, state.method],
  );

  const handleValidateOTP = React.useCallback(
    async (otp: string) => {
      updateState({ isLoading: true, error: null });

      try {
        const identifier =
          state.method === 'EMAIL'
            ? form.getValues('email')
            : form.getValues('phoneNumber');

        await validateOTP(otp, identifier);

        updateState({ step: 'SUCCESS', isLoading: false, error: null });

        setTimeout(() => {
          if (!state.hasRedirected) {
            handleManualRedirect();
          }
        }, 1500);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Erreur de validation';

        updateState({ error: errorMessage, isLoading: false, step: 'OTP' });

        form.setValue('otp', '');

        // Afficher aussi un toast pour une meilleure visibilité
        toast({ title: 'Erreur', description: errorMessage, variant: 'destructive' });
      }
    },
    [
      validateOTP,
      state.method,
      form,
      updateState,
      handleManualRedirect,
      state.hasRedirected,
    ],
  );

  const handleResendOTP = React.useCallback(async () => {
    if (!canResend) return;

    const identifier =
      state.method === 'EMAIL' ? form.getValues('email') : form.getValues('phoneNumber');

    await handleSendOTP(identifier);
  }, [canResend, state.method, form, handleSendOTP]);

  const handleGoBack = React.useCallback(() => {
    updateState({ step: 'IDENTIFIER', error: null });
    form.clearErrors();
  }, [form, updateState]);

  const handleMethodChange = React.useCallback(
    (value: string) => {
      const newMethod = value as LoginMethod;
      updateState({ method: newMethod, step: 'IDENTIFIER', error: null });

      form.reset();
      if (newMethod === 'EMAIL') {
        form.setValue('type', 'EMAIL');
        form.setValue('email', '');
      } else {
        form.setValue('type', 'PHONE');
        form.setValue('phoneNumber', '+33-');
      }
    },
    [form, updateState],
  );

  const onSubmit = React.useCallback(
    async (data: LoginInput) => {
      if (state.step === 'IDENTIFIER') {
        const identifierValue = data.type === 'EMAIL' ? data.email : data.phoneNumber;
        await handleSendOTP(identifierValue);
      } else if (data.otp) {
        await handleValidateOTP(data.otp);
      }
    },
    [state.step, handleSendOTP, handleValidateOTP],
  );

  // Error handling effect
  React.useEffect(() => {
    if (state.error) {
      if (state.step === 'IDENTIFIER') {
        const fieldName = state.method === 'EMAIL' ? 'email' : 'phoneNumber';
        form.setError(fieldName, { message: state.error });
      } else {
        form.setError('otp', { message: state.error });
      }
    }
  }, [state.error, state.step, state.method, form]);

  // Auto-redirect if user is already logged in
  React.useEffect(() => {
    if (user && state.step === 'IDENTIFIER' && !state.hasRedirected) {
      setState((prev) => ({ ...prev, hasRedirected: true }));

      AuthRedirectManager.handleLoginSuccess(user, callbackUrl);
    }
  }, [user, state.step, state.hasRedirected, callbackUrl]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex flex-col gap-6">
        <div className="flex flex-col gap-6">
          {state.step === 'SUCCESS' && (
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
                  onClick={handleManualRedirect}
                  size="mobile"
                  weight="medium"
                  fullWidthOnMobile={true}
                  variant="default"
                  leftIcon={<CheckCircle2 className="size-4" />}
                  rightIcon={<ArrowRight className="size-4" />}
                >
                  {user &&
                  (Array.isArray(user.roles) ? user.roles : [user.roles]).some(
                    (role: string) =>
                      ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'AGENT'].includes(role),
                  )
                    ? t('go_to_dashboard')
                    : t('go_to_my_space')}
                </Button>

                <p className="text-xs text-muted-foreground">{t('auto_redirect_info')}</p>
              </div>
            </div>
          )}

          {state.step === 'IDENTIFIER' && (
            <Tabs
              value={state.method}
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
                          autoFocus={state.method === 'EMAIL'}
                          {...field}
                          type="email"
                          autoComplete="email"
                          placeholder={t('inputs.email.placeholder')}
                          disabled={state.isLoading}
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
                        <PhoneNumberInput
                          value={field.value}
                          onChangeAction={field.onChange}
                          disabled={state.isLoading}
                        />
                      </FormControl>

                      <TradFormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>
          )}

          {state.step === 'OTP' && (
            <div className="otp space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold">{t('access_code')}</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {state.method === 'PHONE'
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
                          disabled={state.isLoading}
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

          {(state.step === 'IDENTIFIER' || state.step === 'OTP') && (
            <div className="actions flex flex-col gap-4">
              <Button
                variant="default"
                type="submit"
                disabled={state.isLoading || !form.formState.isValid}
                size="mobile"
                weight="medium"
                fullWidthOnMobile={true}
                loading={state.isLoading}
                rightIcon={
                  !state.isLoading ? <ArrowRight className="size-4" /> : undefined
                }
              >
                {state.step === 'OTP' ? t('access_space') : t('login_button')}
              </Button>

              {state.step === 'OTP' && (
                <div className="flex justify-between items-center gap-4">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={state.isLoading}
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
                    disabled={!canResend || state.isLoading}
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

              {state.step === 'IDENTIFIER' && (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  disabled={state.isLoading}
                  className="mx-auto"
                  onClick={() =>
                    handleMethodChange(state.method === 'EMAIL' ? 'PHONE' : 'EMAIL')
                  }
                >
                  {state.method === 'EMAIL'
                    ? t('login_with_phone_prompt')
                    : t('login_with_email_prompt')}
                </Button>
              )}
            </div>
          )}

          {state.step !== 'SUCCESS' && (
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
