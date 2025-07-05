import { Vonage } from '@vonage/server-sdk';
import { Auth } from '@vonage/auth';
import { env } from '@/env';
import { Verify2, Channels } from '@vonage/verify2';

const credentials = new Auth({
  apiKey: env.VONAGE_API_KEY,
  apiSecret: env.VONAGE_API_SECRET,
  applicationId: env.VONAGE_APPLICATION_ID,
  privateKey: env.VONAGE_PRIVATE_KEY,
});
const options = {};
const verifyClient = new Verify2(credentials, options);

export const vonageService = {
  // Envoyer un code de vérification
  async sendVerificationCode(identifier: string, channel: Channels) {
    try {
      const resp = await verifyClient.newRequest({
        brand: 'Consulat',
        workflow: [
          {
            channel: channel,
            to: identifier,
          },
        ],
        locale: 'fr-fr',
        codeLength: 6,
        channelTimeout: 300,
      });

      return {
        success: true,
        requestId: resp.requestId,
      };
    } catch (error) {
      console.error("Erreur lors de l'envoi du code de vérification:", error);
      return {
        success: false,
        error: "Impossible d'envoyer le code de vérification",
      };
    }
  },

  // Vérifier le code
  async verifyCode(requestId: string, code: string) {
    try {
      const resp = await verifyClient.checkCode(requestId, code);
      return {
        success: true,
      };
    } catch (error) {
      console.error('Erreur lors de la vérification du code:', error);
      return {
        success: false,
        error: 'Code invalide ou expiré',
      };
    }
  },

  // Annuler une vérification
  async cancelVerification(requestId: string) {
    try {
      await verifyClient.cancel(requestId);
      return {
        success: true,
      };
    } catch (error) {
      console.error("Erreur lors de l'annulation de la vérification:", error);
      return {
        success: false,
        error: "Impossible d'annuler la vérification",
      };
    }
  },
};
