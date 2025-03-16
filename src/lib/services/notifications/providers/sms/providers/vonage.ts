import { Vonage } from '@vonage/server-sdk';
import { SMSMessage, SMSProvider, SMSResponse } from '../types';
import { tryCatch } from '@/lib/utils';
import { env } from '@/lib/env/index';

/**
 * Vonage SMS Provider
 *
 * Note: We're using 'any' types in some places due to type incompatibilities
 * with the current Vonage SDK version. This should be revisited when upgrading
 * the SDK or when better type definitions are available.
 */
export class VonageProvider implements SMSProvider {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private client: any;
  private defaultFrom: string;

  constructor() {
    const apiKey = env.VONAGE_API_KEY;
    const apiSecret = env.VONAGE_API_SECRET;
    const from = env.VONAGE_PHONE_NUMBER;

    if (!apiKey || !apiSecret || !from) {
      throw new Error('Missing Vonage configuration');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.client = new Vonage({ apiKey, apiSecret } as any);
    this.defaultFrom = from;
  }

  async sendSMS(message: SMSMessage): Promise<SMSResponse> {
    const { error, data } = await tryCatch(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.client.sms
        .send({
          to: message.to,
          from: this.defaultFrom,
          text: message.body,
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then((resp: any) => {
          // Based on Vonage documentation, the response should have a messages array
          if (!resp || !Array.isArray(resp.messages) || resp.messages.length === 0) {
            throw new Error('Invalid response from Vonage');
          }

          const firstMessage = resp.messages[0];

          return {
            providerId: 'vonage',
            // Handle different property names that might be in the response
            messageId: (
              firstMessage.messageId ||
              firstMessage.message_id ||
              ''
            ).toString(),
            status: firstMessage.status === '0' ? 'sent' : 'failed',
            errorMessage:
              firstMessage.status !== '0'
                ? (
                    firstMessage.errorText ||
                    firstMessage['error-text'] ||
                    'Unknown error'
                  ).toString()
                : undefined,
          } as SMSResponse;
        }),
    );

    if (error) {
      console.error('Vonage SMS sending failed:', error);
      return {
        providerId: 'vonage',
        messageId: '',
        status: 'failed',
        errorMessage: error.message,
      };
    }

    return data as SMSResponse;
  }
}
