'use server';

import { db } from '@/lib/prisma';
import { customAlphabet } from 'nanoid';
import bcrypt from 'bcryptjs';
import {
  otpLimiter,
  otpGenerationLimiter,
  checkRateLimit,
  getRateLimitKey,
  formatWaitTime,
} from '@/lib/security/rate-limiter';
import {
  logOTPGeneration,
  logRateLimitExceeded,
  logError,
} from '@/lib/security/production-logger';
import { tryCatch } from '../utils';
import { notifyValidationCode } from '../services/notifications';

/**
 * Génère un OTP sécurisé de 6 chiffres
 * @returns OTP en clair pour l'envoi
 */
export const generateOTP = async () => {
  const nanoid = customAlphabet('0123456789', 6);
  return nanoid();
};

/**
 * Sauvegarde un OTP haché en base pour un identifier donné
 * @param identifier - Email ou numéro de téléphone
 * @param otp - OTP en clair
 * @param type - Type d'identifier (EMAIL ou PHONE)
 */
export const saveHashedOTP = async ({
  identifier,
  otp,
  type,
}: {
  identifier: string;
  otp: string;
  type: 'EMAIL' | 'PHONE';
}): Promise<{ success: boolean; error?: string; waitTime?: string }> => {
  try {
    // Vérification du rate limiting pour la génération d'OTP
    const rateLimitKey = getRateLimitKey(identifier, 'otp_gen');
    const rateLimitResult = await checkRateLimit(otpGenerationLimiter, rateLimitKey);

    if (!rateLimitResult.allowed) {
      const waitTime = formatWaitTime(rateLimitResult.msBeforeNext || 0);
      logRateLimitExceeded(identifier, 'otp_generation', 'unknown');
      return {
        success: false,
        error: `messages.errors.otp_generation_rate_limit`,
        waitTime,
      };
    }

    // Hash de l'OTP avant stockage
    const hashedOTP = await bcrypt.hash(otp, 12);

    // Supprimer les anciens OTP pour cet identifier
    await db.verificationToken.deleteMany({
      where: {
        identifier,
        type,
      },
    });

    // Créer le nouveau token avec l'OTP haché
    await db.verificationToken.create({
      data: {
        identifier,
        token: hashedOTP,
        type,
        expires: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      },
    });

    logOTPGeneration(identifier, type, 'unknown');
    return { success: true };
  } catch (error) {
    logError("Erreur lors de la sauvegarde de l'OTP", error, { identifier, type });
    return { success: false, error: 'messages.errors.otp_generation_error' };
  }
};

/**
 * Valide un OTP en comparant avec le hash stocké
 * @param identifier - Email ou numéro de téléphone
 * @param otp - OTP saisi par l'utilisateur
 * @param type - Type d'identifier (EMAIL ou PHONE)
 * @returns true si l'OTP est valide, false sinon
 */
export const authenticateWithOTP = async ({
  identifier,
  otp,
  type,
}: {
  identifier: string;
  otp: string;
  type: 'EMAIL' | 'PHONE';
}): Promise<{ valid: boolean; error?: string; waitTime?: string }> => {
  try {
    // Vérification des paramètres d'entrée
    if (!identifier || !otp || !type) {
      console.error('OTP Validation Error: Paramètres manquants');
      return { valid: false, error: 'messages.errors.missing_otp' };
    }

    // Vérification du rate limiting pour les tentatives de validation d'OTP
    const rateLimitKey = getRateLimitKey(identifier, 'otp_validate');
    const rateLimitResult = await checkRateLimit(otpLimiter, rateLimitKey);

    if (!rateLimitResult.allowed) {
      const waitTime = formatWaitTime(rateLimitResult.msBeforeNext || 0);
      logRateLimitExceeded(identifier, 'otp_validation', 'unknown');
      return {
        valid: false,
        error: `messages.errors.otp_validation_rate_limit`,
        waitTime,
      };
    }

    // Recherche du token stocké (haché)
    const tokenVerification = await db.verificationToken.findFirst({
      where: {
        identifier,
        type,
        expires: {
          gt: new Date(),
        },
      },
    });

    if (!tokenVerification) {
      console.error('OTP Validation Error: Token non trouvé ou expiré');
      return { valid: false, error: 'messages.errors.otp_expired_or_invalid' };
    }

    // Comparaison sécurisée avec le hash
    const isValid = await bcrypt.compare(otp, tokenVerification.token);

    if (!isValid) {
      console.error('OTP Validation Error: OTP invalide');
      return { valid: false, error: 'messages.errors.otp_invalid' };
    }

    // Suppression du token après validation réussie (usage unique)
    await db.verificationToken.delete({
      where: { id: tokenVerification.id },
    });

    return { valid: true };
  } catch (error) {
    console.error('OTP Validation Error:', error);
    return { valid: false, error: 'messages.errors.otp_validation_error' };
  }
};

export type AuthType = 'EMAIL' | 'PHONE';

export async function sendOTP(identifier: string, type: AuthType) {
  try {
    const generatedOTP = await generateOTP();

    const saveResult = await saveHashedOTP({
      identifier,
      otp: generatedOTP,
      type,
    });

    if (!saveResult.success) {
      console.error('Error saving OTP:', saveResult.error);
      return { error: saveResult.error, waitTime: saveResult.waitTime };
    }

    const notificationResult = await tryCatch(
      notifyValidationCode(generatedOTP, {
        ...(type === 'EMAIL' && { email: identifier }),
        ...(type === 'PHONE' && { phoneNumber: identifier.replaceAll('-', '') }),
      }),
    );

    if (notificationResult.error) {
      console.error('Error sending OTP:', notificationResult.error);
      return { error: 'Failed to send verification code' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending OTP:', error);
    return { error: 'Failed to send verification code' };
  }
}
