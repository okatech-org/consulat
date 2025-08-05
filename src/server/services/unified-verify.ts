import { twilioVerifyService, type VerifyChannel } from './twilio-verify';
import { sendOTPEmail } from '@/lib/services/notifications/providers/emails';
import { tryCatch } from '@/lib/utils';
import { db } from '@/server/db';
import { createHash } from 'crypto';

/**
 * Configuration pour le service de vérification unifié
 */
interface UnifiedVerifyConfig {
  codeLength?: number;
  expiryMinutes?: number;
  maxAttempts?: number;
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

  constructor(config: UnifiedVerifyConfig = {}) {
    this.config = {
      codeLength: 6,
      expiryMinutes: 10,
      maxAttempts: 3,
      ...config,
    };
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
   * Hasher un code OTP pour le stockage sécurisé
   */
  private hashCode(code: string): string {
    return createHash('sha256').update(code).digest('hex');
  }

  /**
   * Envoyer un code de vérification
   */
  async sendVerificationCode(
    identifier: string,
    channel?: UnifiedVerifyChannel,
  ): Promise<UnifiedSendResponse> {
    try {
      const identifierInfo = this.getIdentifierInfo(identifier);
      const targetChannel = channel || identifierInfo.channel;

      // Pour les emails, utiliser notre service email existant
      if (targetChannel === 'email') {
        const otpCode = this.generateOTPCode();

        // Stocker le code en base de données AVANT l'envoi
        const requestId = `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        console.log('email data', {
          identifier: identifier,
          code: otpCode,
          type: 'EMAIL',
          expires: new Date(Date.now() + this.config.expiryMinutes! * 60 * 1000),
        });

        await db.oTPCode.upsert({
          where: {
            identifier_type: {
              identifier: identifier,
              type: 'EMAIL',
            },
          },
          create: {
            identifier: identifier,
            code: this.hashCode(otpCode), // Stocker le hash, pas le code en clair
            type: 'EMAIL',
            expires: new Date(Date.now() + this.config.expiryMinutes! * 60 * 1000),
          },
          update: {
            code: this.hashCode(otpCode), // Stocker le hash, pas le code en clair
            attempts: 0,
            verified: false,
            expires: new Date(Date.now() + this.config.expiryMinutes! * 60 * 1000),
          },
        });

        // Envoyer l'email avec le code
        const { error } = await tryCatch(sendOTPEmail(identifier, otpCode));

        if (error) {
          console.error('Erreur envoi email OTP:', error);
          // Supprimer le code de la base si l'envoi échoue
          await db.oTPCode
            .delete({
              where: {
                identifier_type: {
                  identifier: identifier,
                  type: 'EMAIL',
                },
              },
            })
            .catch(() => {});

          return {
            success: false,
            error: error.message || "Erreur lors de l'envoi de l'email",
            channel: targetChannel,
          };
        }

        return {
          success: true,
          requestId: requestId,
          channel: targetChannel,
        };
      }

      // Pour SMS et appels, utiliser Twilio Verify
      const twilioChannel: VerifyChannel = targetChannel as VerifyChannel;
      const result = await twilioVerifyService.sendVerificationCode(
        identifierInfo.formattedIdentifier,
        twilioChannel,
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
    } catch (error: unknown) {
      console.error('Erreur envoi code de vérification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erreur lors de l'envoi du code",
        channel: channel || 'sms',
      };
    }
  }

  /**
   * Vérifier un code de vérification
   */
  async verifyCode(identifier: string, code: string): Promise<UnifiedVerifyResponse> {
    try {
      const identifierInfo = this.getIdentifierInfo(identifier);

      // Pour les emails, vérifier avec la base de données
      if (identifierInfo.type === 'EMAIL') {
        // Récupérer le code depuis la base de données
        const otpRecord = await db.oTPCode.findUnique({
          where: {
            identifier_type: {
              identifier: identifier,
              type: 'EMAIL',
            },
          },
        });

        if (!otpRecord) {
          return {
            success: false,
            status: 'pending',
            error: 'Aucun code en attente pour cet email',
            valid: false,
          };
        }

        if (otpRecord.verified) {
          return {
            success: false,
            status: 'pending',
            error: 'Code déjà utilisé',
            valid: false,
          };
        }

        if (new Date() > otpRecord.expires) {
          return {
            success: false,
            status: 'pending',
            error: 'Code expiré',
            valid: false,
          };
        }

        if (otpRecord.attempts >= this.config.maxAttempts!) {
          return {
            success: false,
            status: 'pending',
            error: 'Trop de tentatives',
            valid: false,
          };
        }

        // Vérifier le code en comparant les hash
        if (otpRecord.code === this.hashCode(code)) {
          // Supprimer le code après vérification réussie (plus sécurisé)
          await db.oTPCode.delete({
            where: { id: otpRecord.id },
          });

          return {
            success: true,
            status: 'approved',
            valid: true,
          };
        } else {
          // Incrémenter les tentatives
          await db.oTPCode.update({
            where: { id: otpRecord.id },
            data: { attempts: { increment: 1 } },
          });

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
    } catch (error: unknown) {
      console.error('Erreur vérification code:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de la vérification',
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
    } catch (error: unknown) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Erreur de validation',
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
      codeLength: 6,
      expiryMinutes: 10,
      maxAttempts: 3,
    });
  }
  return unifiedVerifyServiceInstance;
}

// Export pour utilisation directe
export const unifiedVerifyService = getUnifiedVerifyService();
