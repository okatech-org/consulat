import { twilioVerifyService, type VerifyChannel } from './twilio-verify';
import { sendOTPEmail } from '@/lib/services/notifications/providers/emails';
import { tryCatch } from '@/lib/utils';

/**
 * Configuration pour le service de vérification unifié
 */
interface UnifiedVerifyConfig {
  codeLength?: number;
  expiryMinutes?: number;
  maxAttempts?: number;
  brand?: string;
}

/**
 * Types pour les canaux supportés
 */
export type UnifiedVerifyChannel = 'sms' | 'call' | 'email';

/**
 * Réponse d'envoi de vérification
 */
interface UnifiedSendResponse {
  success: boolean;
  requestId?: string;
  error?: string;
  channel: UnifiedVerifyChannel;
}

/**
 * Réponse de vérification de code
 */
interface UnifiedVerifyResponse {
  success: boolean;
  status?: string;
  error?: string;
  valid?: boolean;
}

/**
 * Service de vérification unifié qui utilise :
 * - Twilio Verify pour SMS et appels vocaux
 * - Service email existant (Resend) pour les emails
 */
class UnifiedVerifyService {
  private config: UnifiedVerifyConfig;
  private brand: string;

  constructor(config: UnifiedVerifyConfig = {}) {
    this.config = {
      codeLength: 6,
      expiryMinutes: 10,
      maxAttempts: 3,
      brand: 'Consulat.ga',
      ...config,
    };
    this.brand = this.config.brand!;
  }

  /**
   * Déterminer le type d'identifiant et le canal approprié
   */
  private getIdentifierInfo(identifier: string): {
    type: 'EMAIL' | 'SMS';
    channel: UnifiedVerifyChannel;
    formattedIdentifier: string;
  } {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+\d{1,4}-?\d{9,}$/;

    if (emailRegex.test(identifier)) {
      return {
        type: 'EMAIL',
        channel: 'email',
        formattedIdentifier: identifier,
      };
    } else if (phoneRegex.test(identifier)) {
      return {
        type: 'SMS',
        channel: 'sms',
        formattedIdentifier: identifier,
      };
    } else {
      throw new Error("Format d'identifiant invalide");
    }
  }

  /**
   * Générer un code OTP personnalisé pour les emails
   */
  private generateOTPCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Envoyer un code de vérification
   */
  async sendVerificationCode(
    identifier: string,
    channel?: UnifiedVerifyChannel,
    options?: {
      locale?: string;
      customMessage?: string;
    },
  ): Promise<UnifiedSendResponse> {
    try {
      const identifierInfo = this.getIdentifierInfo(identifier);
      const targetChannel = channel || identifierInfo.channel;

      // Pour les emails, utiliser notre service email existant
      if (targetChannel === 'email') {
        const otpCode = this.generateOTPCode();

        const { error } = await tryCatch(sendOTPEmail(identifier, otpCode));

        if (error) {
          console.error('Erreur envoi email OTP:', error);
          return {
            success: false,
            error: error.message || "Erreur lors de l'envoi de l'email",
            channel: targetChannel,
          };
        }

        // Ici on peut stocker le code en base de données avec un identifiant unique
        // pour la vérification ultérieure, mais pour l'exemple on retourne directement
        return {
          success: true,
          requestId: `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          channel: targetChannel,
        };
      }

      // Pour SMS et appels, utiliser Twilio Verify
      const twilioChannel: VerifyChannel = targetChannel as VerifyChannel;
      const result = await twilioVerifyService.sendVerificationCode(
        identifierInfo.formattedIdentifier,
        twilioChannel,
        {
          locale: options?.locale || 'fr-fr',
          customFriendlyName: this.brand,
          customMessage: options?.customMessage,
        },
      );

      if (!result.success) {
        return {
          success: false,
          error: result.error,
          channel: targetChannel,
        };
      }

      return {
        success: true,
        requestId: result.verificationSid,
        channel: targetChannel,
      };
    } catch (error: any) {
      console.error('Erreur envoi code de vérification:', error);
      return {
        success: false,
        error: error.message || "Erreur lors de l'envoi du code",
        channel: channel || 'sms',
      };
    }
  }

  /**
   * Vérifier un code de vérification
   */
  async verifyCode(
    identifier: string,
    code: string,
    requestId?: string,
  ): Promise<UnifiedVerifyResponse> {
    try {
      const identifierInfo = this.getIdentifierInfo(identifier);

      // Pour les emails, on utiliserait normalement une vérification en base
      // Pour l'exemple, on suppose que tous les codes email sont valides si ils ont 6 chiffres
      if (identifierInfo.type === 'EMAIL') {
        // Ici vous devriez implémenter la vérification avec votre base de données
        // en utilisant le requestId pour retrouver le code stocké

        if (code.length === 6 && /^\d+$/.test(code)) {
          return {
            success: true,
            status: 'approved',
            valid: true,
          };
        } else {
          return {
            success: false,
            status: 'pending',
            error: 'Code invalide',
            valid: false,
          };
        }
      }

      // Pour SMS et appels, utiliser Twilio Verify
      const result = await twilioVerifyService.verifyCode(
        identifierInfo.formattedIdentifier,
        code,
      );

      return {
        success: result.success,
        status: result.status,
        error: result.error,
        valid: result.valid,
      };
    } catch (error: any) {
      console.error('Erreur vérification code:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors de la vérification',
        status: 'pending',
        valid: false,
      };
    }
  }

  /**
   * Annuler une vérification (SMS/call uniquement)
   */
  async cancelVerification(requestId: string): Promise<boolean> {
    try {
      // Pour les emails, pas de cancellation nécessaire
      if (requestId.startsWith('email-')) {
        return true;
      }

      // Pour Twilio Verify
      return await twilioVerifyService.cancelVerification(requestId);
    } catch (error) {
      console.error('Erreur annulation vérification:', error);
      return false;
    }
  }

  /**
   * Obtenir les informations de configuration
   */
  getConfig(): UnifiedVerifyConfig {
    return { ...this.config };
  }

  /**
   * Valider un format d'identifiant
   */
  validateIdentifier(identifier: string): {
    valid: boolean;
    type?: 'EMAIL' | 'SMS';
    error?: string;
  } {
    try {
      const info = this.getIdentifierInfo(identifier);
      return {
        valid: true,
        type: info.type,
      };
    } catch (error: any) {
      return {
        valid: false,
        error: error.message,
      };
    }
  }
}

// Instance singleton du service
let unifiedVerifyServiceInstance: UnifiedVerifyService | null = null;

/**
 * Obtenir l'instance du service de vérification unifié
 */
export function getUnifiedVerifyService(): UnifiedVerifyService {
  if (!unifiedVerifyServiceInstance) {
    unifiedVerifyServiceInstance = new UnifiedVerifyService({
      brand: 'Consulat.ga',
      codeLength: 6,
      expiryMinutes: 10,
      maxAttempts: 3,
    });
  }
  return unifiedVerifyServiceInstance;
}

// Export pour utilisation directe
export const unifiedVerifyService = getUnifiedVerifyService();
