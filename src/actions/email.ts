'use server'

import { Resend } from 'resend'
import { sendSMS } from '@/lib/twilio'
import { getTranslations } from 'next-intl/server'

const resend = new Resend(process.env.RESEND_API_KEY)
const resend_sender = process.env.RESEND_SENDER ?? 'contact@update.okacode.com'

// Design system colors from globals.css
const colors = {
  primary: 'hsl(221.2 83.2% 53.3%)',
  secondary: 'hsl(342, 99%, 45%)',
  background: 'hsl(0 0% 100%)',
  foreground: 'hsl(222.2 84% 4.9%)',
  muted: 'hsl(210 40% 96.1%)',
  mutedForeground: 'hsl(215.4 16.3% 46.9%)',
  destructive: 'hsl(0 84.2% 60.2%)',
  border: 'hsl(214.3 31.8% 91.4%)',
}

async function createBaseEmailTemplate(content: string) {
  const t = await getTranslations('emails.common')

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <header style="height: 200px; display: flex; justify-items:center; align-items: center; text-align: center; padding: 2rem; border-bottom: 1px solid ${colors.primary}">
         <p style="font-size: 2rem; color: ${colors.background}">${t('title')}</p>
      </header>

      <main style="padding: 20px;">
       ${content}
      </main>

      <footer style="background-color: #f8f9fa; padding: 20px; text-align: center; margin-top: 30px;">
        <p style="margin-bottom: 10px;">${t('footer.copyright', { year: new Date().getFullYear() })}</p>
        <a href="https://www.consulat.ga" 
          style="display: inline-block; padding: 10px 20px; background-color: ${colors.primary}; color: ${colors.background}; text-decoration: none; border-radius: 5px; margin-top: 10px;">
          ${t('footer.cta')}
        </a>
      </footer>
    </div>
  `
}

export async function sendOTPEmail(email: string, otp: string) {
  const otpEmail = await createOTPEmailTemplate(otp)
  const t = await getTranslations('emails.otp')

  try {
    await resend.emails.send({
      from: `Consulat <${resend_sender}>`,
      to: email,
      subject: t('title'),
      html: otpEmail,
      tags: [
        {
          name: 'category',
          value: 'otp-verification',
        },
      ],
    })
  } catch (error) {
    console.error('Failed to send OTP email:', error)
    throw new Error('Failed to send verification code')
  }
}

export async function sendSMSOTP(phone: string, otp: string) {
  const t = await getTranslations('sms.otp')

  try {
    if (!process.env.TWILIO_PHONE_NUMBER) {
      console.error('TWILIO_PHONE_NUMBER not configured')
      throw new Error('SMS service not properly configured')
    }

    const message = t('message', {
      otp,
      expiry: t('expiry_time'),
      appName: t('app_name'),
    })

    await sendSMS(phone, message)
    console.log(t('logs.success', { phone }))
  } catch (error) {
    console.error(t('logs.error'), error)

    if (error instanceof Error) {
      if (error.message.includes('not a Twilio phone number')) {
        throw new Error(t('errors.invalid_config'))
      }
      throw new Error(t('errors.send_failed', { error: error.message }))
    }

    throw new Error(t('errors.unknown'))
  }
}

export async function createOTPEmailTemplate(otp: string) {
  const t = await getTranslations('emails.otp')

  const content = `
    <div style="padding: 20px;">
      <h1 style="color: ${colors.foreground}; font-size: 24px; margin-bottom: 20px; text-align: center;">
        ${t('title')}
      </h1>
      <p style="color: ${colors.mutedForeground}; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
        ${t('description')}
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <div style="background-color: ${colors.muted}; border-radius: 8px; padding: 20px; display: inline-block;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: ${colors.primary};">
            ${otp}
          </span>
        </div>
      </div>
      <p style="color: ${colors.mutedForeground}; font-size: 14px; text-align: center;">
        ${t('expiry')}
      </p>
      <div style="background-color: ${colors.destructive}; border-radius: 8px; padding: 15px; margin-top: 20px;">
        <p style="color: ${colors.background}; margin: 0; font-size: 14px; text-align: center;">
          ${t('warning')}
        </p>
      </div>
    </div>
  `

  return createBaseEmailTemplate(content)
}