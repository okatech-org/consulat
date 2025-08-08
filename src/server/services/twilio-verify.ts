import twilio from 'twilio';
import { env } from '@/env';

/**
 * Configuration du service Twilio Verify
 */
interface TwilioVerifyConfig {
  accountSid: string;
  authToken: string;
  serviceSid?: string; // Service SID optionnel, sera créé automatiquement si absent
}

/**
 * Types pour les canaux de vérification
 */
export type VerifyChannel = 'sms' | 'call' | 'email';

/**
 * Réponse d'envoi de vérification
 */
interface SendVerificationResponse {
  success: boolean;
  verificationSid?: string;
  error?: string;
  status?: string;
}

/**
 * Réponse de vérification de code
 */
interface VerifyCodeResponse {
  success: boolean;
  status?: string;
  error?: string;
  valid?: boolean;
}

/**
 * Service Twilio Verify pour la gestion des vérifications OTP
 * Utilise l'API Twilio Verify v2 pour l'envoi et la vérification des codes
 */
class TwilioVerifyService {
  private client: ReturnType<typeof twilio>;
  private serviceSid: string;
  private defaultBrand: string = 'Consulat.ga';

  constructor(config: TwilioVerifyConfig) {
    this.client = twilio(config.accountSid, config.authToken);

    // Si un serviceSid est fourni, l'utiliser, sinon on devra en créer un
    if (config.serviceSid) {
      this.serviceSid = config.serviceSid;
    } else {
      throw new Error(
        'TWILIO_VERIFY_SERVICE_SID is required. Please create a Verify Service in the Twilio Console.',
      );
    }
  }

  /**
   * Créer un service de vérification (à utiliser une seule fois en configuration)
   */
  async createVerifyService(friendlyName: string = this.defaultBrand): Promise<string> {
    try {
      const service = await this.client.verify.v2.services.create({
        friendlyName,
        codeLength: 6,
        lookupEnabled: false,
        skipSmsToLandlines: true,
        doNotShareWarningEnabled: true,
      });

      return service.sid;
    } catch (error) {
      console.error('Error creating Verify Service:', error);
      throw new Error('Failed to create Verify Service');
    }
  }

  /**
   * Envoyer un code de vérification
   */
  async sendVerificationCode(
    to: string,
    channel: VerifyChannel = 'sms',
    options?: {
      locale?: string;
      customFriendlyName?: string;
      customMessage?: string;
    },
  ): Promise<SendVerificationResponse> {
    try {
      // Formater le numéro de téléphone pour SMS/call
      let formattedTo = to;
      if (channel === 'sms' || channel === 'call') {
        // Supprimer les tirets pour le format international
        formattedTo = to.startsWith('+')
          ? to.replace(/-/g, '')
          : `+${to.replace(/-/g, '')}`;
      }

      const verificationData: any = {
        to: formattedTo,
        channel,
      };

      // Ajouter les options si présentes
      // Note: locale n'est pas supporté sur ce service Twilio
      // if (options?.locale) {
      //   verificationData.locale = options.locale;
      // }

      if (options?.customFriendlyName) {
        verificationData.customFriendlyName = options.customFriendlyName;
      }

      if (options?.customMessage) {
        verificationData.customMessage = options.customMessage;
      }

      const verification = await this.client.verify.v2
        .services(this.serviceSid)
        .verifications.create(verificationData);

      return {
        success: true,
        verificationSid: verification.sid,
        status: verification.status,
      };
    } catch (error: any) {
      console.error('Error sending verification code:', error);

      let errorMessage = "Erreur lors de l'envoi du code de vérification";

      // Messages d'erreur spécifiques selon le code d'erreur Twilio
      if (error.code) {
        switch (error.code) {
          case 60200:
            errorMessage = 'Numéro de téléphone invalide';
            break;
          case 60203:
            errorMessage = 'Numéro de téléphone non supporté';
            break;
          case 60212:
            errorMessage = 'Trop de tentatives de vérification';
            break;
          case 60229:
            errorMessage = 'Canal de vérification non disponible pour ce numéro';
            break;
          default:
            errorMessage = error.message || errorMessage;
        }
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Vérifier un code de vérification
   */
  async verifyCode(
    to: string,
    code: string,
    channel?: VerifyChannel,
  ): Promise<VerifyCodeResponse> {
    try {
      // Formater le numéro de téléphone pour SMS/call
      let formattedTo = to;
      if (!to.includes('@')) {
        // Si ce n'est pas un email
        formattedTo = to.startsWith('+')
          ? to.replace(/-/g, '')
          : `+${to.replace(/-/g, '')}`;
      }

      const verificationCheck = await this.client.verify.v2
        .services(this.serviceSid)
        .verificationChecks.create({
          to: formattedTo,
          code,
        });

      return {
        success: verificationCheck.status === 'approved',
        status: verificationCheck.status,
        valid: verificationCheck.valid,
      };
    } catch (error: any) {
      console.error('Error verifying code:', error);

      let errorMessage = 'Erreur lors de la vérification du code';

      // Messages d'erreur spécifiques selon le code d'erreur Twilio
      if (error.code) {
        switch (error.code) {
          case 60200:
            errorMessage = 'Numéro de téléphone invalide';
            break;
          case 60202:
            errorMessage = 'Code de vérification invalide';
            break;
          case 60203:
            errorMessage = 'Numéro de téléphone non supporté';
            break;
          case 60205:
            errorMessage = 'Code de vérification expiré';
            break;
          case 60212:
            errorMessage = 'Trop de tentatives de vérification';
            break;
          default:
            errorMessage = error.message || errorMessage;
        }
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Annuler une vérification en cours
   */
  async cancelVerification(verificationSid: string): Promise<boolean> {
    try {
      await this.client.verify.v2
        .services(this.serviceSid)
        .verifications(verificationSid)
        .update({ status: 'canceled' });

      return true;
    } catch (error) {
      console.error('Error canceling verification:', error);
      return false;
    }
  }

  /**
   * Obtenir les détails d'une vérification
   */
  async getVerificationStatus(verificationSid: string) {
    try {
      const verification = await this.client.verify.v2
        .services(this.serviceSid)
        .verifications(verificationSid)
        .fetch();

      return {
        success: true,
        status: verification.status,
        to: verification.to,
        channel: verification.channel,
        valid: verification.valid,
        dateCreated: verification.dateCreated,
        dateUpdated: verification.dateUpdated,
      };
    } catch (error) {
      console.error('Error fetching verification:', error);
      return {
        success: false,
        error: 'Impossible de récupérer le statut de vérification',
      };
    }
  }
}

// Instance singleton du service
let twilioVerifyServiceInstance: TwilioVerifyService | null = null;

/**
 * Obtenir l'instance du service Twilio Verify
 */
export function getTwilioVerifyService(): TwilioVerifyService {
  if (!twilioVerifyServiceInstance) {
    twilioVerifyServiceInstance = new TwilioVerifyService({
      accountSid: env.TWILIO_ACCOUNT_SID,
      authToken: env.TWILIO_AUTH_TOKEN,
      serviceSid: env.TWILIO_VERIFY_SERVICE_SID,
    });
  }
  return twilioVerifyServiceInstance;
}

// Export pour utilisation directe
export const twilioVerifyService = getTwilioVerifyService();
