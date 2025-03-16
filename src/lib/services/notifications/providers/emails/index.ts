'use server';

import { Resend } from 'resend';
import { getTranslations } from 'next-intl/server';
import { env } from '@/lib/env/index';
import { OTPEmailToHtml } from './components/OTPEmail';
import { AdminWelcomeEmailToHtml } from './components/AdminWelcomeEmail';
import { NotificationEmailToHtml } from './components/NotificationEmail';

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
  await resend.emails.send({
    from: `${appName} <${resend_sender}>`,
    to: email,
    subject: t('subject'),
    html: emailHtml,
    tags: [{ name: 'category', value: 'otp' }],
  });
}

interface SendNotificationEmailParams {
  email: string;
  notificationTitle: string;
  notificationMessage: string;
  actionUrl?: string;
  actionLabel?: string;
  name?: string;
}

export async function sendNotificationEmail({
  email,
  name,
  notificationTitle,
  notificationMessage,
  actionUrl,
  actionLabel,
}: SendNotificationEmailParams) {
  const t = await getTranslations('emails.notification');

  const emailHtml = await NotificationEmailToHtml({
    notificationTitle,
    notificationMessage,
    actionUrl,
    actionLabel,
    content: {
      subject: t('subject', { appName }),
      greeting: t('greeting', { name: name ?? `@${email.split('@')[0]}` }),
      outro: t('outro'),
      signature: t('signature', { appName }),
    },
  });

  try {
    await resend.emails.send({
      from: `${appName} <${resend_sender}>`,
      to: email,
      subject: t('subject', { appName }),
      html: emailHtml,
      tags: [{ name: 'category', value: 'notification' }],
    });
  } catch (error) {
    console.error('Failed to send notification email:', error);
    throw new Error('Failed to send notification email');
  }
}
