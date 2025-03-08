'use server';

import { Resend } from 'resend';
import { getTranslations } from 'next-intl/server';
import { AdminWelcomeEmailToHtml } from '@/emails/AdminWelcomeEmail';
import { env } from '@/lib/env';
import { OTPEmailToHtml } from '../OTPEmail';

const resend = new Resend(env.RESEND_API_KEY);
const resend_sender = env.RESEND_SENDER;
const appName = env.NEXT_PUBLIC_APP_NAME;

export async function sendAdminWelcomeEmail({
  adminEmail,
  adminName,
  organizationName,
  dashboardUrl,
  organizationLogo,
  links,
}: {
  adminEmail: string;
  adminName: string;
  organizationName: string;
  dashboardUrl: string;
  organizationLogo: string;
  links?: { label: string; url: string }[];
}) {
  const t = await getTranslations('organization.emails.adminWelcome');

  const emailHtml = await AdminWelcomeEmailToHtml({
    dashboardUrl,
    organizationLogo,
    content: {
      subject: t('subject', { appName }),
      greeting: t('greeting', { adminName }),
      intro: t('intro', { organizationName }),
      instructions: t.raw('instructions'),
      buttonLabel: t('buttonLabel'),
      outro: t('outro'),
      signature: t('signature', { appName }),
      links,
    },
  });

  try {
    await resend.emails.send({
      from: `${appName} <${resend_sender}>`,
      to: adminEmail,
      subject: t('subject', { appName }),
      html: emailHtml,
      tags: [{ name: 'category', value: 'admin-welcome' }],
    });
  } catch (error) {
    console.error('Failed to send admin welcome email:', error);
    throw new Error('Failed to send admin welcome email');
  }
}

export async function sendOTPEmail(email: string, otp: string) {
  const t = await getTranslations('emails.otp');

  const emailHtml = await OTPEmailToHtml({
    otp,
    content: {
      subject: t('subject'),
      title: t('title'),
      intro: t('intro'),
      outro: t('outro'),
      warning: t('warning'),
    },
  });
  try {
    await resend.emails.send({
      from: `${env.NEXT_PUBLIC_APP_NAME} <${env.RESEND_SENDER}>`,
      to: email,
      subject: t('subject'),
      html: emailHtml,
      tags: [{ name: 'category', value: 'otp' }],
    });
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
}
