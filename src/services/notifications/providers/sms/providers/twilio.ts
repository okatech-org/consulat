import { Twilio } from 'twilio';
import { SMSMessage, SMSProvider, SMSResponse } from '../types';
import { tryCatch } from '@/lib/utils';

export class TwilioProvider implements SMSProvider {
  private client: Twilio;
  private defaultFrom: string;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !from) {
      throw new Error('Missing Twilio configuration');
    }

    this.client = new Twilio(accountSid, authToken);
    this.defaultFrom = from;
  }

  async sendSMS(message: SMSMessage): Promise<SMSResponse> {
    const { error, data } = await tryCatch(
      this.client.messages
        .create({
          body: message.body,
          to: message.to,
          from: message.from || this.defaultFrom,
        })
        .then((result) => {
          return {
            providerId: 'twilio',
            messageId: result.sid,
            status:
              result.status === 'sent'
                ? 'sent'
                : result.status === 'queued'
                  ? 'queued'
                  : 'failed',
          } as SMSResponse;
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

    return data as SMSResponse;
  }
}
