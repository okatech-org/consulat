import { TwilioProvider } from './providers/twilio';
import { VonageProvider } from './providers/vonage';
import { SMSMessage, SMSProvider, SMSResponse } from './types';

// Classe principale qui gère les providers SMS
export class SMSService {
  private provider: SMSProvider;

  constructor() {
    const providerName = process.env.SMS_PROVIDER?.toLowerCase() || 'twilio';

    switch (providerName) {
      case 'vonage':
        this.provider = new VonageProvider();
        break;
      case 'twilio':
      default:
        this.provider = new TwilioProvider();
        break;
    }

    console.log(`SMS Service initialized with provider: ${providerName}`);
  }

  async sendSMS(to: string, body: string, from?: string): Promise<SMSResponse> {
    const message: SMSMessage = { to, body, from };
    return await this.provider.sendSMS(message);
  }
}

// Singleton instance
let smsService: SMSService | null = null;

// Fonction d'accès au service
export function getSMSService(): SMSService {
  if (!smsService) {
    smsService = new SMSService();
  }
  return smsService;
}

// Fonction utilitaire pour envoyer un SMS facilement
export async function sendSMS(
  to: string,
  body: string,
  from?: string,
): Promise<SMSResponse> {
  return await getSMSService().sendSMS(to, body, from);
}

// Exporter les types pour une utilisation externe
export type { SMSMessage, SMSResponse, SMSProvider };
