'use server';

import { sendSMS } from '@/lib/services/notifications/providers/sms';
import { getTranslations } from 'next-intl/server';

export async function sendSMSOTP(phone: string, otp: string) {
  const t = await getTranslations('sms.otp');

  try {
    if (!process.env.TWILIO_PHONE_NUMBER) {
      console.error('TWILIO_PHONE_NUMBER not configured');
      throw new Error('SMS service not properly configured');
    }

    const message = t('message', {
      otp,
      expiry: t('expiry_time', { count: 10 }),
      appName: t('app_name'),
    });

    await sendSMS(phone, message, 'Consulat.ga');
  } catch (error) {
    console.error(t('logs.error'), error);

    if (error instanceof Error) {
      if (error.message.includes('not a Twilio phone number')) {
        throw new Error(t('errors.invalid_config'));
      }
      throw new Error(t('errors.send_failed', { error: error.message }));
    }

    throw new Error(t('errors.unknown'));
  }
}
