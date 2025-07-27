import type { Provider } from 'next-auth/providers';
import CredentialsProvider from 'next-auth/providers/credentials';
import { CredentialsSignin } from 'next-auth';
import { db } from '@/server/db';
import { vonageService } from '@/server/services/vonage';
import { UserRole } from '@prisma/client';
import type { Channels } from '@vonage/verify2';

// Factory pour créer des erreurs d'authentification avec des codes spécifiques
function createAuthError(code: string, message: string) {
  class CustomCredentialsSignin extends CredentialsSignin {
    code = code;
  }
  const error = new CustomCredentialsSignin();
  error.message = message;
  return error;
}

// Nouvelle erreur spécifique pour l'envoi de code
function createCodeSentError(message: string) {
  class CodeSentError extends CredentialsSignin {
    code = 'CODE_SENT';
  }
  const error = new CodeSentError();
  error.message = message;
  return error;
}

// Déterminer le type et le canal selon l'identifiant
function getIdentifierType(identifier: string): {
  type: 'SMS' | 'EMAIL';
  channel: Channels;
} {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+\d{3}-\d{9,}$/;

  if (emailRegex.test(identifier)) {
    return { type: 'EMAIL', channel: 'email' as Channels };
  } else if (phoneRegex.test(identifier)) {
    return { type: 'SMS', channel: 'sms' as Channels };
  } else {
    throw createAuthError(
      'invalid_identifier',
      "Format de numéro de téléphone ou d'email invalide",
    );
  }
}

export const otpProvider: Provider = CredentialsProvider({
  id: 'otp',
  name: 'OTP',
  credentials: {
    identifier: { label: 'Identifier', type: 'text' }, // email ou phone
    code: { label: 'Code', type: 'text' },
    action: { label: 'Action', type: 'text' }, // "send" ou "verify"
  },
  async authorize(credentials) {
    // Vérification de type pour identifier
    const identifier = credentials?.identifier;
    if (!identifier || typeof identifier !== 'string') {
      throw createAuthError('missing_identifier', 'Email ou téléphone requis');
    }

    // Vérification de type pour action
    const action = credentials?.action;
    if (typeof action !== 'string') {
      throw createAuthError('missing_action', 'Action requise');
    }

    // Déterminer le type d'identifiant
    const { type, channel } = getIdentifierType(identifier);

    // Si on demande l'envoi du code
    if (action === 'send') {
      // Envoyer le code via Vonage
      const result = await vonageService.sendVerificationCode(identifier, channel);

      if (!result.success) {
        throw createAuthError(
          'send_failed',
          result.error || "Erreur lors de l'envoi du code",
        );
      }

      // Stocker le requestId de Vonage
      await db.oTPCode.upsert({
        where: {
          identifier_type: {
            identifier: identifier,
            type: type,
          },
        },
        create: {
          identifier: identifier,
          code: result.requestId!, // Stocker le requestId de Vonage
          type: type,
          expires: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        },
        update: {
          code: result.requestId!, // Stocker le requestId de Vonage
          attempts: 0,
          verified: false,
          expires: new Date(Date.now() + 5 * 60 * 1000),
        },
      });

      // Lancer une erreur spéciale pour indiquer que le code a été envoyé
      throw createCodeSentError('Code envoyé avec succès');
    }

    // Si on vérifie le code
    if (action === 'verify') {
      const code = credentials?.code;
      if (!code || typeof code !== 'string') {
        throw createAuthError('missing_code', 'Code de vérification requis');
      }

      // Récupérer le requestId de Vonage
      const otpCode = await db.oTPCode.findUnique({
        where: {
          identifier_type: {
            identifier: identifier,
            type: type,
          },
        },
      });

      if (!otpCode) {
        throw createAuthError('no_code_pending', 'Aucun code en attente');
      }

      if (otpCode.verified) {
        throw createAuthError('code_already_used', 'Code déjà utilisé');
      }

      if (new Date() > otpCode.expires) {
        throw createAuthError('otp_expired', 'Code expiré');
      }

      // Vérifier le code avec l'API Vonage
      const requestId = otpCode.code; // Le requestId est stocké dans le champ code
      const verificationResult = await vonageService.verifyCode(requestId, code);

      if (!verificationResult.success) {
        await db.oTPCode.update({
          where: { id: otpCode.id },
          data: { attempts: { increment: 1 } },
        });

        if (otpCode.attempts >= 3) {
          throw createAuthError(
            'too_many_attempts',
            'Trop de tentatives. Demandez un nouveau code.',
          );
        }

        throw createAuthError('otp_invalid', 'Code invalide');
      }

      // Marquer comme vérifié
      await db.oTPCode.update({
        where: { id: otpCode.id },
        data: { verified: true },
      });

      // Créer ou récupérer l'utilisateur selon le type
      let user;
      if (type === 'EMAIL') {
        user = await db.user.findUnique({
          where: { email: identifier },
        });

        if (!user) {
          // Créer un nouvel utilisateur avec email
          user = await db.user.create({
            data: {
              email: identifier,
              emailVerified: new Date(),
              name: `User ${identifier}`,
              roles: [UserRole.USER],
              role: UserRole.USER,
            },
          });
        } else if (!user.emailVerified) {
          // Mettre à jour la vérification email
          await db.user.update({
            where: { id: user.id },
            data: { emailVerified: new Date() },
          });
        }
      } else {
        user = await db.user.findUnique({
          where: { phoneNumber: identifier },
        });

        if (!user) {
          // Créer un nouvel utilisateur avec téléphone
          user = await db.user.create({
            data: {
              phoneNumber: identifier,
              phoneNumberVerified: true,
              name: `User ${identifier}`,
              roles: [UserRole.USER],
              role: UserRole.USER,
            },
          });
        } else if (!user.phoneNumberVerified) {
          // Mettre à jour la vérification téléphone
          await db.user.update({
            where: { id: user.id },
            data: { phoneNumberVerified: true },
          });
        }
      }

      if (!user) return null;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        phoneNumber: user.phoneNumber,
      };
    }

    throw createAuthError('invalid_action', 'Action invalide');
  },
});
