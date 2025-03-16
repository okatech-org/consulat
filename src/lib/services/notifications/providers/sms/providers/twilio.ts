import twilio, { Twilio } from 'twilio';
import { SMSMessage, SMSProvider, SMSResponse } from '../types';
import { tryCatch } from '@/lib/utils';
import { env } from '@/lib/env/index';

export class TwilioProvider implements SMSProvider {
  private client: Twilio;
  private defaultFrom: string;

  constructor() {
    const accountSid = env.TWILIO_ACCOUNT_SID;
    const authToken = env.TWILIO_AUTH_TOKEN;
    const from = env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !from) {
      throw new Error('Missing Twilio configuration');
    }

    this.client = twilio(accountSid, authToken);
    this.defaultFrom = from;
  }

  async sendSMS(message: SMSMessage): Promise<SMSResponse> {
    const { error, data } = await tryCatch(
      this.client.messages.create({
        body: message.body,
        to: message.to,
        from: this.defaultFrom,
      }),
    );

    if (error) {
      console.error('Twilio SMS sending failed:', error);
      return {
        providerId: 'twilio',
        messageId: '',
        status: 'failed',
        errorMessage: error.message,
      };
    }

    console.log('data', { data });

    return {
      providerId: 'twilio',
      messageId: data?.sid || '',
      status: 'sent',
      errorMessage: '',
    } as SMSResponse;
  }
}
