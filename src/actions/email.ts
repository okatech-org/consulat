'use server';

import { sendSMS } from '@/lib/services/notifications/providers/sms';
import { getTranslations } from 'next-intl/server';

export async function sendSMSOTP(phone: string, otp: string) {
  const t = await getTranslations('sms.otp');

  try {
    if (!process.env.TWILIO_PHONE_NUMBER) {
      console.error('TWILIO_PHONE_NUMBER not configured');
      throw new Error('SMS service not configured');
    }

    const message = t('message', {
      otp,
      expiry: t('expiry_time', { count: 10 }),
      appName: t('app_name'),
    });

    await sendSMS(phone, message, 'Consulat.ga');
  } catch (error) {
    console.error('SMS OTP Error:', error);

    if (error instanceof Error) {
      // Erreurs spécifiques Twilio
      if (error.message.includes('21660') || error.message.includes('Mismatch')) {
        throw new Error('Service SMS temporairement indisponible. Veuillez utiliser l\'email.');
      }
      if (error.message.includes('not a Twilio phone number')) {
        throw new Error('Configuration SMS invalide');
      }
      if (error.message.includes('rate limit')) {
        throw new Error('Trop de tentatives. Veuillez patienter.');
      }
      
      // Propager le message d'erreur original s'il est clair
      throw error;
    }

    throw new Error('Impossible d\'envoyer le code SMS');
  }
}
