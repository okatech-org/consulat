'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';
import { sendOTP, isUserExists } from '@/actions/auth';
import { authenticateWithOTP } from '@/lib/user/otp';
import { tryCatch } from '@/lib/utils';
import { signIn } from 'next-auth/react';

export type AuthState =
  | 'idle'
  | 'loading'
  | 'checking-user'
  | 'otp-sent'
  | 'validating-otp'
  | 'success'
  | 'error';

export type AuthType = 'EMAIL' | 'PHONE';

interface UseAuthOTPOptions {
  onSuccess?: () => void;
  redirectOnSuccess?: boolean;
  checkUserExists?: boolean; // Pour login vs registration
}

interface UseAuthOTPReturn {
  // États
  state: AuthState;
  error: string | null;
  isLoading: boolean;
  isOTPSent: boolean;

  // Données
  identifier: string | null;
  authType: AuthType | null;

  // Cooldown pour renvoi
  resendCooldown: number;
  canResend: boolean;

  // Actions
  sendOTPCode: (identifier: string, type: AuthType) => Promise<void>;
  validateOTP: (otp: string) => Promise<void>;
  resendOTP: () => Promise<void>;
  reset: () => void;
  goBack: () => void;
}

export function useAuthOTP(options: UseAuthOTPOptions = {}): UseAuthOTPReturn {
  const { onSuccess, redirectOnSuccess = true, checkUserExists = true } = options;

  const router = useRouter();
  const tAuth = useTranslations('auth.login');
  const tErrors = useTranslations('messages.errors');

  // États principaux
  const [state, setState] = useState<AuthState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [identifier, setIdentifier] = useState<string | null>(null);
  const [authType, setAuthType] = useState<AuthType | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // États dérivés
  const isLoading = ['loading', 'checking-user', 'validating-otp'].includes(state);
  const isOTPSent = ['otp-sent', 'validating-otp', 'success'].includes(state);
  const canResend = resendCooldown === 0 && state === 'otp-sent';

  // Timer pour le cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Fonction pour envoyer l'OTP
  const sendOTPCode = useCallback(
    async (identifierValue: string, type: AuthType) => {
      try {
        setError(null);
        setState('checking-user');
        setIdentifier(identifierValue);
        setAuthType(type);

        // Vérifier si l'utilisateur existe (si requis)
        if (checkUserExists) {
          const userExists = await isUserExists(
            undefined,
            type === 'EMAIL' ? identifierValue : undefined,
            type === 'PHONE' ? identifierValue : undefined,
          );

          if (!userExists) {
            const errorKey =
              type === 'EMAIL' ? 'no_user_found_with_email' : 'no_user_found_with_phone';
            setError(`messages.errors.${errorKey}`);
            setState('error');
            return;
          }
        }

        setState('loading');

        const { error: sendError, data: sendData } = await tryCatch(
          sendOTP(identifierValue, type),
        );

        if (sendError || !sendData?.success) {
          const errorMessage = sendData?.error || 'code_not_sent_otp';
          setError(errorMessage);
          setState('error');

          toast({
            title: tErrors('code_not_sent_otp'),
            variant: 'destructive',
          });
          return;
        }

        setState('otp-sent');
        setResendCooldown(60); // 60 secondes de cooldown

        toast({
          title: tAuth('messages.otp_sent'),
          variant: 'success',
        });
      } catch (err) {
        console.error('Error sending OTP:', err);
        setError('messages.errors.otp_generation_error');
        setState('error');
      }
    },
    [checkUserExists, tAuth, tErrors],
  );

  // Fonction pour valider l'OTP
  const validateOTP = useCallback(
    async (otp: string) => {
      if (!identifier || !authType) {
        setError('messages.errors.missing_otp');
        setState('error');
        return;
      }

      try {
        setError(null);
        setState('validating-otp');

        const otpValidation = await authenticateWithOTP({
          identifier,
          otp,
          type: authType,
        });

        if (!otpValidation?.valid) {
          const errorMessage = otpValidation?.error || 'messages.errors.invalid_otp';
          setError(errorMessage);
          setState('otp-sent'); // Rester sur l'écran OTP pour permettre de réessayer
          return;
        }

        await signIn('credentials', {
          identifier,
          type: authType,
          redirect: false,
        });

        setState('success');

        toast({
          title: tAuth('messages.login_success'),
          variant: 'success',
        });

        // Actions de succès
        if (onSuccess) {
          onSuccess();
        }

        if (redirectOnSuccess) {
          router.refresh();
        }
      } catch (err) {
        console.error('Error validating OTP:', err);
        setError('messages.errors.otp_validation_error');
        setState('error');
      }
    },
    [identifier, authType, router, redirectOnSuccess, onSuccess, tAuth],
  );

  // Fonction pour renvoyer l'OTP
  const resendOTP = useCallback(async () => {
    if (!identifier || !authType || !canResend) return;

    await sendOTPCode(identifier, authType);
  }, [identifier, authType, canResend, sendOTPCode]);

  // Fonction pour reset l'état
  const reset = useCallback(() => {
    setState('idle');
    setError(null);
    setIdentifier(null);
    setAuthType(null);
    setResendCooldown(0);
  }, []);

  // Fonction pour revenir à l'étape précédente
  const goBack = useCallback(() => {
    if (['otp-sent', 'validating-otp', 'error'].includes(state)) {
      setState('idle');
      setError(null);
      setResendCooldown(0);
    }
  }, [state]);

  return {
    // États
    state,
    error,
    isLoading,
    isOTPSent,

    // Données
    identifier,
    authType,

    // Cooldown
    resendCooldown,
    canResend,

    // Actions
    sendOTPCode,
    validateOTP,
    resendOTP,
    reset,
    goBack,
  };
}
