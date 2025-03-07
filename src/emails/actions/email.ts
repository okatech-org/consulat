'use server';

import { Resend } from 'resend';
import { getTranslations } from 'next-intl/server';
import { AdminWelcomeEmailToHtml } from '../AdminWelcomeEmail';

const resend = new Resend(process.env.RESEND_API_KEY);
const resend_sender = process.env.RESEND_SENDER ?? 'contact@update.okacode.com';

export async function sendAdminWelcomeEmail({
  adminEmail,
  adminName,
  organizationName,
  dashboardUrl,
}: {
  adminEmail: string;
  adminName: string;
  organizationName: string;
  dashboardUrl: string;
}) {
  const t = await getTranslations('organization.emails.adminWelcome');

  const emailHtml = await AdminWelcomeEmailToHtml({
    adminName,
    organizationName,
    dashboardUrl,
    t: {
      subject: t('subject', { appName: 'Consulat.ga' }),
      greeting: t('greeting'),
      intro: t('intro'),
      instructions: t('instructions'),
      buttonLabel: t('buttonLabel'),
      outro: t('outro'),
      signature: t('signature'),
    },
  });

  try {
    await resend.emails.send({
      from: `Consulat <${resend_sender}>`,
      to: adminEmail,
      subject: t('subject', { appName: 'Consulat.ga' }),
      html: emailHtml,
      tags: [{ name: 'category', value: 'admin-welcome' }],
    });
  } catch (error) {
    console.error('Failed to send admin welcome email:', error);
    throw new Error('Failed to send admin welcome email');
  }
}
