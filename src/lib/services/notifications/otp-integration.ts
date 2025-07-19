'use server';

import { sendOTPEmail } from './providers/emails';
import { sendSMS } from './providers/sms';
import { tryCatch } from '@/lib/utils';
import type { OTPSendFunction } from '@/server/auth/otp-auth-provider';

/**
 * Fonction d'envoi OTP qui utilise les services de notifications existants
 * Compatible avec le provider OTP personnalisable
 */
export const sendOTPViaNotifications: OTPSendFunction = async (
  channel: 'email' | 'sms',
  target: string,
  code: string,
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (channel === 'email') {
      // Utiliser le service email existant (Resend)
      const { error } = await tryCatch(sendOTPEmail(target, code));

      if (error) {
        console.error('Erreur envoi email OTP:', error);
        return {
          success: false,
          error: error.message || "Erreur lors de l'envoi de l'email",
        };
      }

      return { success: true };
    }

    if (channel === 'sms') {
      const { error, data } = await tryCatch(
        sendSMS(target, `Votre code de connexion sur consulat.ga : ${code}`),
      );

      if (error) {
        console.error('Erreur envoi SMS OTP:', error);
        return {
          success: false,
          error: error.message || "Erreur lors de l'envoi du SMS",
        };
      }

      // Vérifier le statut de l'envoi
      if (data && data.status !== 'sent' && data.status !== 'queued') {
        return {
          success: false,
          error:
            data.errorMessage || `Échec de l'envoi SMS avec le statut: ${data.status}`,
        };
      }

      return { success: true };
    }

    return {
      success: false,
      error: `Canal non supporté: ${channel}`,
    };
  } catch (error) {
    console.error('Erreur générale envoi OTP:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
};

/**
 * Fonction d'envoi OTP spécialisée pour les emails uniquement
 */
export const sendEmailOTP: OTPSendFunction = async (
  channel: 'email' | 'sms',
  target: string,
  code: string,
): Promise<{ success: boolean; error?: string }> => {
  if (channel !== 'email') {
    return {
      success: false,
      error: 'Ce provider ne supporte que les emails',
    };
  }

  return sendOTPViaNotifications(channel, target, code);
};

/**
 * Fonction d'envoi OTP spécialisée pour les SMS uniquement
 */
export const sendSMSOTP: OTPSendFunction = async (
  channel: 'email' | 'sms',
  target: string,
  code: string,
): Promise<{ success: boolean; error?: string }> => {
  if (channel !== 'sms') {
    return {
      success: false,
      error: 'Ce provider ne supporte que les SMS',
    };
  }

  return sendOTPViaNotifications(channel, target, code);
};
